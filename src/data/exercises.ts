import type { ExerciseDefinition } from "../types";

export const EXERCISES: ExerciseDefinition[] = [
  {
    id: "independance",
    label: "Indépendance des mains",
    instruments: ["orgue", "accordeon"],
    description: "Dissocier les deux mains sur des rythmes ou articulations différentes.",
    formula: {
      orgue: "Trille 3-4 main droite / Tenue main gauche",
      accordeon: "Trille 3-4 main droite / Basse tenue main gauche",
    },
    guidance: {
      orgue: "Gardez le poignet souple, la main gauche reste immobile et détendue.",
      accordeon: "Le soufflet ne doit trahir aucun à-coup pendant le trille.",
    },
  },
  {
    id: "soufflet",
    label: "Régularité du soufflet",
    instruments: ["accordeon"],
    description: "Travailler l'ouverture/fermeture du soufflet à volume constant.",
    formula: {
      orgue: "—",
      accordeon: "Notes tenues, changement de soufflet inaudible",
    },
    guidance: {
      orgue: "—",
      accordeon: "Anticipez le changement de sens un temps à l'avance, sans à-coup de pression.",
    },
  },
  {
    id: "sauts-basses",
    label: "Sauts de basses",
    instruments: ["accordeon", "orgue"],
    description: "Précision des déplacements larges de la main gauche / des pieds.",
    formula: {
      orgue: "Sauts de tierce au pédalier, talon-pointe",
      accordeon: "Basse - accord, sauts d'octave main gauche",
    },
    guidance: {
      orgue: "Regardez le pédalier le moins possible, fiez-vous à la mémoire musculaire.",
      accordeon: "Gardez le poignet gauche stable, seul l'avant-bras guide le saut.",
    },
  },
  {
    id: "pedalier-claviers",
    label: "Pédalier & claviers",
    instruments: ["orgue"],
    description: "Coordination entre les claviers manuels et le pédalier.",
    formula: {
      orgue: "Gamme claviers + pédalier en contretemps",
      accordeon: "—",
    },
    guidance: {
      orgue: "Le pédalier reste en retrait dynamique par rapport aux claviers.",
      accordeon: "—",
    },
  },
  {
    id: "gammes-arpeges",
    label: "Gammes & arpèges",
    instruments: ["orgue", "accordeon"],
    description: "Fluidité et régularité sur les mouvements de gammes et d'arpèges.",
    formula: {
      orgue: "Gamme majeure 2 octaves, legato",
      accordeon: "Gamme majeure 2 octaves, main droite",
    },
    guidance: {
      orgue: "Passage du pouce anticipé, aucune accentuation entre les notes.",
      accordeon: "Pression de soufflet constante sur toute la gamme.",
    },
  },
  {
    id: "legato-staccato",
    label: "Legato / Staccato",
    instruments: ["orgue", "accordeon"],
    description: "Contraste d'articulation entre les deux mains.",
    formula: {
      orgue: "Legato main droite / Staccato main gauche",
      accordeon: "Legato main droite / Staccato basses",
    },
    guidance: {
      orgue: "Le staccato reste léger, jamais sec ni percussif.",
      accordeon: "Le soufflet accompagne le staccato sans à-coup de pression.",
    },
  },
];

export function exercisesForInstrument(instrument: ExerciseDefinition["instruments"][number]) {
  return EXERCISES.filter((ex) => ex.instruments.includes(instrument));
}
