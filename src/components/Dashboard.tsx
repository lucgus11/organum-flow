import { useMemo, useState } from "react";
import { exercisesForInstrument } from "../data/exercises";
import type {
  ExerciseCategory,
  Instrument,
  ListeningMode,
  SessionConfig,
  SessionDurationMinutes,
} from "../types";
import "./Dashboard.css";

interface DashboardProps {
  initialConfig: Partial<SessionConfig>;
  onStart: (config: SessionConfig) => void;
}

const DURATIONS: SessionDurationMinutes[] = [3, 5, 10, 15, 20];

const LISTENING_MODES: { id: ListeningMode; label: string; description: string }[] = [
  {
    id: "microphone",
    label: "Microphone",
    description: "Analyse le son en temps réel pour évaluer la régularité du jeu.",
  },
  {
    id: "midi",
    label: "MIDI",
    description: "Détecte les notes d'un orgue ou accordéon MIDI branché en USB.",
  },
  {
    id: "visuel",
    label: "Visuel seul",
    description: "Aucune écoute : uniquement le repère visuel de tempo.",
  },
];

function firstValidExercise(instrument: Instrument, preferred?: ExerciseCategory): ExerciseCategory {
  const available = exercisesForInstrument(instrument);
  if (preferred && available.some((ex) => ex.id === preferred)) return preferred;
  return available[0].id;
}

export function Dashboard({ initialConfig, onStart }: DashboardProps) {
  const [instrument, setInstrument] = useState<Instrument>(initialConfig.instrument ?? "orgue");
  const [exercise, setExercise] = useState<ExerciseCategory>(
    firstValidExercise(initialConfig.instrument ?? "orgue", initialConfig.exercise)
  );
  const [tempo, setTempo] = useState(initialConfig.tempo ?? 76);
  const [durationMinutes, setDurationMinutes] = useState<SessionDurationMinutes>(
    initialConfig.durationMinutes ?? 5
  );
  const [listeningMode, setListeningMode] = useState<ListeningMode>(
    initialConfig.listeningMode ?? "visuel"
  );

  const availableExercises = useMemo(() => exercisesForInstrument(instrument), [instrument]);

  function handleInstrumentChange(next: Instrument) {
    setInstrument(next);
    setExercise((current) => firstValidExercise(next, current));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onStart({ instrument, exercise, tempo, durationMinutes, listeningMode });
  }

  return (
    <div className="dashboard">
      <main className="dashboard__card">
        <header className="dashboard__header">
          <p className="dashboard__eyebrow">Échauffement guidé</p>
          <h1 className="dashboard__title">Organum Flow</h1>
          <p className="dashboard__subtitle">
            Réglez votre séance, puis jouez — tout se passe hors-ligne, sur pupitre.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="dashboard__form">
          <section className="dashboard__section">
            <h2 className="dashboard__section-title">Instrument</h2>
            <div className="segmented" role="radiogroup" aria-label="Instrument">
              {(["orgue", "accordeon"] as const).map((id) => (
                <button
                  type="button"
                  key={id}
                  role="radio"
                  aria-checked={instrument === id}
                  className={`segmented__option ${instrument === id ? "is-active" : ""}`}
                  onClick={() => handleInstrumentChange(id)}
                >
                  {id === "orgue" ? "Orgue" : "Accordéon"}
                </button>
              ))}
            </div>
          </section>

          <section className="dashboard__section">
            <h2 className="dashboard__section-title">Type d'exercice</h2>
            <div className="exercise-grid" role="radiogroup" aria-label="Type d'exercice">
              {availableExercises.map((ex) => (
                <button
                  type="button"
                  key={ex.id}
                  role="radio"
                  aria-checked={exercise === ex.id}
                  className={`exercise-card ${exercise === ex.id ? "is-active" : ""}`}
                  onClick={() => setExercise(ex.id)}
                >
                  <span className="exercise-card__label">{ex.label}</span>
                  <span className="exercise-card__description">{ex.description}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="dashboard__section">
            <h2 className="dashboard__section-title">Tempo</h2>
            <div className="tempo-control">
              <input
                type="range"
                min={30}
                max={168}
                step={1}
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                aria-label="Tempo en battements par minute"
              />
              <span className="tempo-control__value">
                <strong>{tempo}</strong> BPM
              </span>
            </div>
          </section>

          <section className="dashboard__section">
            <h2 className="dashboard__section-title">Durée de la session</h2>
            <div className="segmented" role="radiogroup" aria-label="Durée de la session">
              {DURATIONS.map((d) => (
                <button
                  type="button"
                  key={d}
                  role="radio"
                  aria-checked={durationMinutes === d}
                  className={`segmented__option ${durationMinutes === d ? "is-active" : ""}`}
                  onClick={() => setDurationMinutes(d)}
                >
                  {d} min
                </button>
              ))}
            </div>
          </section>

          <section className="dashboard__section">
            <h2 className="dashboard__section-title">Mode d'écoute</h2>
            <div className="listening-options" role="radiogroup" aria-label="Mode d'écoute">
              {LISTENING_MODES.map((mode) => (
                <button
                  type="button"
                  key={mode.id}
                  role="radio"
                  aria-checked={listeningMode === mode.id}
                  className={`listening-option ${listeningMode === mode.id ? "is-active" : ""}`}
                  onClick={() => setListeningMode(mode.id)}
                >
                  <span className="listening-option__label">{mode.label}</span>
                  <span className="listening-option__description">{mode.description}</span>
                </button>
              ))}
            </div>
          </section>

          <button type="submit" className="dashboard__start-button">
            Lancer l'échauffement
          </button>
        </form>
      </main>
    </div>
  );
}
