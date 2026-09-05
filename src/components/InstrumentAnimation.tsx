import { useMemo } from "react";
import type { Instrument } from "../types";
import "./InstrumentAnimation.css";

interface InstrumentAnimationProps {
  instrument: Instrument;
  /** Phase du battement, 0 → 1, pour synchroniser le geste illustré au tempo. */
  phase: number;
}

/**
 * Faute de pouvoir garantir des fichiers vidéo lourds en cache hors-ligne, la démonstration
 * du geste est une illustration vectorielle animée légère (quelques Ko, mise en cache par le
 * Service Worker comme le reste de l'app) : mains sur le clavier pour l'orgue, soufflet pour
 * l'accordéon, toutes deux cadencées sur la même horloge que le cercle de pulsation.
 */
export function InstrumentAnimation({ instrument, phase }: InstrumentAnimationProps) {
  const lift = useMemo(() => Math.sin(phase * Math.PI * 2) * 6, [phase]);
  const bellows = useMemo(() => 34 + Math.sin(phase * Math.PI * 2) * 10, [phase]);

  return (
    <div className="instrument-animation" aria-hidden="true">
      {instrument === "orgue" ? (
        <svg viewBox="0 0 220 110" className="instrument-animation__svg">
          <rect x="10" y="70" width="200" height="14" rx="3" fill="var(--walnut-800)" />
          {Array.from({ length: 14 }).map((_, i) => (
            <rect
              key={i}
              x={16 + i * 14}
              y={60}
              width="11"
              height="24"
              rx="1.5"
              fill={i % 4 === 0 ? "var(--brass-dim)" : "var(--walnut-700)"}
            />
          ))}
          {/* Main droite */}
          <g transform={`translate(60 ${34 - lift})`}>
            <ellipse cx="0" cy="0" rx="20" ry="12" fill="var(--parchment-dim)" opacity="0.9" />
          </g>
          {/* Main gauche */}
          <g transform={`translate(150 ${34 + lift})`}>
            <ellipse cx="0" cy="0" rx="20" ry="12" fill="var(--brass-light)" opacity="0.85" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 220 110" className="instrument-animation__svg">
          <rect x="8" y="20" width="30" height="70" rx="6" fill="var(--walnut-700)" />
          <rect x="182" y="20" width="30" height="70" rx="6" fill="var(--brass-dim)" />
          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={i}
              x1={38 + i * ((182 - 38) / 9)}
              y1={55 - bellows / 2}
              x2={38 + i * ((182 - 38) / 9)}
              y2={55 + bellows / 2}
              stroke="var(--walnut-800)"
              strokeWidth="3"
            />
          ))}
          <rect x="30" y={55 - bellows / 2 - 4} width={160} height={bellows + 8} rx="4" fill="none" stroke="var(--brass)" strokeWidth="2" opacity="0.5" />
        </svg>
      )}
    </div>
  );
}
