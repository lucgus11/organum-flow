import { useMemo } from "react";
import type { RhythmFeedback } from "../types";
import "./PulseCircle.css";

interface PulseCircleProps {
  /** Phase du battement, 0 → 1. */
  phase: number;
  feedback: RhythmFeedback;
}

// La respiration suit une courbe sinusoïdale douce plutôt qu'un aller-retour linéaire :
// contraction franche sur le temps, relâchement progressif — proche du geste réel du soufflet.
function scaleForPhase(phase: number): number {
  const eased = (1 - Math.cos(phase * Math.PI * 2)) / 2; // 0 → 1 → 0, lissé
  return 0.86 + eased * 0.14;
}

export function PulseCircle({ phase, feedback }: PulseCircleProps) {
  const scale = useMemo(() => scaleForPhase(phase), [phase]);

  return (
    <div className={`pulse-circle pulse-circle--${feedback}`} role="img" aria-label="Indicateur de tempo">
      <div className="pulse-circle__ring" />
      <div className="pulse-circle__core" style={{ transform: `scale(${scale})` }} />
    </div>
  );
}
