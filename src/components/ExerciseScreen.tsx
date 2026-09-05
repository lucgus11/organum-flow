import { useEffect, useMemo, useState } from "react";
import { EXERCISES } from "../data/exercises";
import { useRhythmSync } from "../hooks/useRhythmSync";
import { useWakeLock } from "../hooks/useWakeLock";
import type { SessionConfig } from "../types";
import { PulseCircle } from "./PulseCircle";
import { InstrumentAnimation } from "./InstrumentAnimation";
import "./ExerciseScreen.css";

interface ExerciseScreenProps {
  config: SessionConfig;
  onExit: () => void;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ExerciseScreen({ config, onExit }: ExerciseScreenProps) {
  const exerciseDef = useMemo(
    () => EXERCISES.find((ex) => ex.id === config.exercise) ?? EXERCISES[0],
    [config.exercise]
  );

  const [paused, setPaused] = useState(false);
  const [confirmingExit, setConfirmingExit] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(config.durationMinutes * 60);
  const finished = secondsLeft <= 0;
  const running = !paused && !finished;

  useWakeLock(running);

  const { phase, feedback, micError, midiError, midiDevices } = useRhythmSync({
    tempo: config.tempo,
    running,
    listeningMode: config.listeningMode,
  });

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  const connectionNotice = useMemo(() => {
    if (config.listeningMode === "microphone" && micError) return micError;
    if (config.listeningMode === "midi" && midiError) return midiError;
    if (config.listeningMode === "midi" && midiDevices.length === 0) {
      return "En attente d'un périphérique MIDI…";
    }
    return null;
  }, [config.listeningMode, micError, midiError, midiDevices]);

  return (
    <div className="exercise-screen">
      <div className="exercise-screen__topbar">
        <button
          type="button"
          className="exercise-screen__ghost-button"
          onClick={() => (confirmingExit ? onExit() : setConfirmingExit(true))}
          onBlur={() => setConfirmingExit(false)}
        >
          {confirmingExit ? "Confirmer" : "Quitter"}
        </button>

        <button
          type="button"
          className="exercise-screen__ghost-button"
          onClick={() => setPaused((p) => !p)}
          disabled={finished}
        >
          {paused ? "Reprendre" : "Pause"}
        </button>
      </div>

      {finished ? (
        <div className="exercise-screen__center">
          <p className="exercise-screen__eyebrow">Séance terminée</p>
          <h1 className="exercise-screen__formula">Bel échauffement.</h1>
          <button type="button" className="exercise-screen__restart" onClick={onExit}>
            Retour au dashboard
          </button>
        </div>
      ) : (
        <div className="exercise-screen__center">
          <InstrumentAnimation instrument={config.instrument} phase={phase} />

          <h1 className="exercise-screen__formula">{exerciseDef.formula[config.instrument]}</h1>
          <p className="exercise-screen__guidance">{exerciseDef.guidance[config.instrument]}</p>

          <div className="exercise-screen__pulse-wrap">
            <PulseCircle phase={phase} feedback={feedback} />
          </div>

          {connectionNotice && <p className="exercise-screen__notice">{connectionNotice}</p>}
        </div>
      )}

      <div className="exercise-screen__timer" aria-live="off">
        {formatTime(secondsLeft)}
      </div>
    </div>
  );
}
