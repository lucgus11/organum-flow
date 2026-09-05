import { useEffect, useRef, useState } from "react";

interface UseAudioAnalyserOptions {
  enabled: boolean;
  onOnset?: (timeMs: number) => void;
}

interface UseAudioAnalyserResult {
  /** Niveau d'entrée courant, 0 à 1, pour un éventuel retour visuel de niveau. */
  level: number;
  error: string | null;
  ready: boolean;
}

/**
 * Capture le micro via getUserMedia + AnalyserNode et détecte les attaques (onsets) par une
 * méthode d'énergie : on suit l'amplitude RMS du signal temporel et on déclenche un "onset"
 * quand elle dépasse nettement sa moyenne mobile récente, avec une période réfractaire pour
 * éviter les déclenchements multiples sur une même attaque.
 */
export function useAudioAnalyser({ enabled, onOnset }: UseAudioAnalyserOptions): UseAudioAnalyserResult {
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const onOnsetRef = useRef(onOnset);
  onOnsetRef.current = onOnset;

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setReady(false);
      return;
    }

    let cancelled = false;
    let runningAverage = 0.02;
    let lastOnsetTime = 0;
    const REFRACTORY_MS = 180;
    const TRIGGER_RATIO = 1.6; // seuil = moyenne mobile * ce ratio

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx: AudioContext = new AudioCtx();
        audioCtxRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0;
        source.connect(analyser);

        const buffer = new Float32Array(analyser.fftSize);

        const loop = () => {
          analyser.getFloatTimeDomainData(buffer);

          let sumSquares = 0;
          for (let i = 0; i < buffer.length; i++) sumSquares += buffer[i] * buffer[i];
          const rms = Math.sqrt(sumSquares / buffer.length);

          setLevel(Math.min(1, rms * 6));

          const now = performance.now();
          if (rms > runningAverage * TRIGGER_RATIO && rms > 0.015 && now - lastOnsetTime > REFRACTORY_MS) {
            lastOnsetTime = now;
            onOnsetRef.current?.(now);
          }

          // Moyenne mobile lente, hors des pics eux-mêmes pour ne pas "avaler" le seuil.
          runningAverage = runningAverage * 0.97 + rms * 0.03;

          rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);
        setReady(true);
        setError(null);
      } catch (err) {
        console.error("[useAudioAnalyser] accès micro refusé ou indisponible", err);
        setError(
          "Micro inaccessible. Vérifiez les autorisations du navigateur ou choisissez un autre mode d'écoute."
        );
        setReady(false);
      }
    }

    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
      streamRef.current = null;
    };
  }, [enabled]);

  return { level, error, ready };
}
