import { useEffect, useRef, useState } from "react";

interface UseMetronomeOptions {
  tempo: number; // BPM
  running: boolean;
  onBeat?: (beatTimeMs: number, beatIndex: number) => void;
}

interface UseMetronomeResult {
  /** Phase du battement en cours, de 0 (début du temps) à 1 (fin du temps). */
  phase: number;
  beatIndex: number;
}

/**
 * Pilote la pulsation visuelle (cercle qui respire) au tempo choisi, via requestAnimationFrame
 * pour une animation fluide indépendante du taux de rafraîchissement de l'écran.
 * Expose aussi les instants de battement (onBeat) pour la comparaison avec l'audio/MIDI détecté.
 */
export function useMetronome({ tempo, running, onBeat }: UseMetronomeOptions): UseMetronomeResult {
  const [phase, setPhase] = useState(0);
  const [beatIndex, setBeatIndex] = useState(0);

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastBeatIndexRef = useRef(-1);
  const onBeatRef = useRef(onBeat);
  onBeatRef.current = onBeat;

  useEffect(() => {
    if (!running) {
      startTimeRef.current = null;
      lastBeatIndexRef.current = -1;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const beatDurationMs = 60000 / tempo;

    const tick = (now: number) => {
      if (startTimeRef.current === null) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const currentBeatIndex = Math.floor(elapsed / beatDurationMs);
      const currentPhase = (elapsed % beatDurationMs) / beatDurationMs;

      setPhase(currentPhase);

      if (currentBeatIndex !== lastBeatIndexRef.current) {
        lastBeatIndexRef.current = currentBeatIndex;
        setBeatIndex(currentBeatIndex);
        onBeatRef.current?.(now, currentBeatIndex);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempo, running]);

  return { phase, beatIndex };
}
