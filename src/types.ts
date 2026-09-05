export type Instrument = "orgue" | "accordeon";

export type ListeningMode = "microphone" | "midi" | "visuel";

export type ExerciseCategory =
  | "independance"
  | "soufflet"
  | "sauts-basses"
  | "pedalier-claviers"
  | "gammes-arpeges"
  | "legato-staccato";

export interface ExerciseDefinition {
  id: ExerciseCategory;
  label: string;
  /** Instruments pour lesquels cet exercice a du sens. */
  instruments: Instrument[];
  /** Courte description affichée dans le dashboard. */
  description: string;
  /** Formule affichée en grand pendant l'exercice, peut dépendre de l'instrument. */
  formula: Record<Instrument, string>;
  /** Sous-titre / consigne complémentaire affichée sous la formule. */
  guidance: Record<Instrument, string>;
}

export type SessionDurationMinutes = 3 | 5 | 10 | 15 | 20;

export interface SessionConfig {
  instrument: Instrument;
  exercise: ExerciseCategory;
  tempo: number; // BPM
  durationMinutes: SessionDurationMinutes;
  listeningMode: ListeningMode;
}

/** Qualité du rythme perçue par l'analyse audio/MIDI, utilisée pour le feedback visuel. */
export type RhythmFeedback = "neutral" | "steady" | "off";
