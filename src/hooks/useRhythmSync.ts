import { useCallback, useEffect, useRef, useState } from "react";
import { useMetronome } from "./useMetronome";
import { useAudioAnalyser } from "./useAudioAnalyser";
import { useMidi } from "./useMidi";
import type { ListeningMode, RhythmFeedback } from "../types";

interface UseRhythmSyncOptions {
  tempo: number;
  running: boolean;
  listeningMode: ListeningMode;
}

interface UseRhythmSyncResult {
  phase: number;
  feedback: RhythmFeedback;
  micLevel: number;
  micError: string | null;
  midiError: string | null;
  midiDevices: string[];
}

const TOLERANCE_RATIO = 0.14; // proportion de la durée du temps tolérée autour du battement
const FEEDBACK_DECAY_MS = 1400; // retour à "neutral" si plus aucun événement détecté

/**
 * Compare chaque événement détecté (attaque micro ou note MIDI) à l'instant du battement
 * de métronome le plus proche, et en déduit un feedback "steady" (dans la tolérance),
 * "off" (hors tolérance) ou "neutral" (pas assez de signal, ou mode visuel seul).
 */
export function useRhythmSync({ tempo, running, listeningMode }: UseRhythmSyncOptions): UseRhythmSyncResult {
  const [feedback, setFeedback] = useState<RhythmFeedback>("neutral");

  const lastBeatTimeRef = useRef(0);
  const beatDurationRef = useRef(60000 / tempo);
  const decayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    beatDurationRef.current = 60000 / tempo;
  }, [tempo]);

  const handleBeat = useCallback((beatTimeMs: number) => {
    lastBeatTimeRef.current = beatTimeMs;
  }, []);

  const { phase } = useMetronome({ tempo, running, onBeat: handleBeat });

  const evaluateEvent = useCallback((timeMs: number) => {
    const beatDuration = beatDurationRef.current;
    const lastBeat = lastBeatTimeRef.current;
    if (lastBeat === 0) return;

    // Distance au battement précédent, ramenée dans [0, beatDuration), puis on regarde
    // si elle est proche de 0 (juste après le temps) ou proche de beatDuration (juste avant).
    const delta = (timeMs - lastBeat) % beatDuration;
    const distanceToNearestBeat = Math.min(delta, beatDuration - delta);
    const tolerance = beatDuration * TOLERANCE_RATIO;

    setFeedback(distanceToNearestBeat <= tolerance ? "steady" : "off");

    if (decayTimeoutRef.current) clearTimeout(decayTimeoutRef.current);
    decayTimeoutRef.current = setTimeout(() => setFeedback("neutral"), FEEDBACK_DECAY_MS);
  }, []);

  const { level: micLevel, error: micError } = useAudioAnalyser({
    enabled: running && listeningMode === "microphone",
    onOnset: evaluateEvent,
  });

  const { error: midiError, connectedDevices: midiDevices } = useMidi({
    enabled: running && listeningMode === "midi",
    onNoteOn: (_note, _velocity, timeMs) => evaluateEvent(timeMs),
  });

  useEffect(() => {
    if (!running) setFeedback("neutral");
  }, [running]);

  useEffect(() => {
    return () => {
      if (decayTimeoutRef.current) clearTimeout(decayTimeoutRef.current);
    };
  }, []);

  return {
    phase,
    feedback: listeningMode === "visuel" ? "neutral" : feedback,
    micLevel,
    micError: listeningMode === "microphone" ? micError : null,
    midiError: listeningMode === "midi" ? midiError : null,
    midiDevices,
  };
}
