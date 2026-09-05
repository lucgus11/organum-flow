# Organum Flow

Application d'échauffement pour organistes et accordéonistes — indépendance des mains,
régularité du soufflet, sauts de basses, pédalier & claviers, gammes & arpèges.

Progressive Web App installable, fonctionnant **100% hors-ligne** après la première visite,
avec écoute optionnelle par microphone (Web Audio API) ou instrument MIDI (Web MIDI API).

## Fonctionnalités

- **Dashboard de configuration** : instrument, type d'exercice, tempo (BPM), durée de
  session, mode d'écoute (micro / MIDI / visuel seul).
- **Écran d'exercice** épuré et sombre : formule de l'exercice, illustration animée
  synchronisée au tempo, cercle de pulsation, anneau de feedback (vert = régulier,
  ambre = décalé), minuteur discret, pause/quitter.
- **Analyse audio en temps réel** : détection d'attaques (onsets) par `AnalyserNode`,
  comparées au tempo attendu.
- **Détection MIDI** : événements `noteOn`/`noteOff` d'un instrument branché en USB.
- **Hors-ligne intégral** : Service Worker qui précache l'intégralité de l'application
  (JS, CSS, polices, icônes) dès la première visite en ligne.
- **Écran maintenu allumé** pendant la séance (Screen Wake Lock API, quand disponible).
- Dernière configuration mémorisée localement (`localStorage`).

## Stack technique

- React 19 + TypeScript, bundlé avec Vite.
- Aucune dépendance de police externe : les polices (Fraunces, IBM Plex Sans) sont
  auto-hébergées via `@fontsource`, donc mises en cache avec le reste de l'app —
  pas d'appel à Google Fonts ou tout autre CDN au runtime.
- Service Worker écrit à la main (`public/service-worker.js`) : au build, un plugin Vite
  (`vite.config.ts`) génère `precache-manifest.json` listant tous les fichiers produits
  avec un hash de version ; le Service Worker les précache au premier chargement puis
  sert tout depuis le cache, réseau en secours pour les nouveautés.

## Développement local

```bash
npm install
npm run dev
```

> En développement, le Service Worker n'est pas enregistré (il a besoin du build de
> production pour trouver `precache-manifest.json`). Pour tester le comportement
> hors-ligne réel :

```bash
npm run build
npm run preview
```

Puis ouvrez l'app dans le navigateur, laissez-la charger une fois en ligne, coupez le
réseau (mode avion ou onglet "Offline" des DevTools) et rechargez : elle doit continuer
à fonctionner intégralement.

## Micro et MIDI en local

- Le microphone (`getUserMedia`) et Web MIDI (`requestMIDIAccess`) exigent un contexte
  sécurisé : `https://` en production, ou `http://localhost` en développement (déjà le
  cas avec `npm run dev` / `npm run preview`).
- Le mode MIDI nécessite un navigateur compatible (Chrome, Edge, Opera — Safari et
  Firefox ne supportent pas encore Web MIDI nativement).

## Déploiement

### GitHub

```bash
git init
git add .
git commit -m "Organum Flow"
git branch -M main
git remote add origin <url-de-votre-repo>
git push -u origin main
```

### Vercel

1. Importez le dépôt GitHub sur [vercel.com/new](https://vercel.com/new).
2. Vercel détecte automatiquement Vite : *Build Command* `npm run build`,
   *Output Directory* `dist`. Aucune variable d'environnement n'est nécessaire.
3. Déployez. L'app sera servie en HTTPS, condition requise pour l'installation PWA,
   le microphone et le MIDI.

Le fichier `vercel.json` fourni ajoute les en-têtes de cache adaptés au Service Worker
et au manifest (évite qu'ils restent bloqués en cache navigateur entre deux versions).

## Structure du projet

```
public/
  manifest.json          Manifest PWA (icônes, couleurs, mode standalone)
  service-worker.js       Service Worker : précache + stratégie cache-first
  icons/                  Icônes PNG/SVG (standard + maskable + apple-touch-icon)
src/
  components/             Dashboard, ExerciseScreen, PulseCircle, InstrumentAnimation
  hooks/                  useMetronome, useAudioAnalyser, useMidi, useRhythmSync, useWakeLock
  data/exercises.ts       Catalogue des exercices par instrument
  types.ts                Types partagés
  styles/global.css       Tokens de design (couleurs, typographie)
vite.config.ts            Build Vite + génération du precache-manifest.json
```

## Ajouter un exercice

Ajoutez une entrée dans `src/data/exercises.ts` (formule et consigne pour chaque
instrument concerné) — elle apparaît automatiquement dans le dashboard.

## Limites connues

- La détection de régularité rythmique par micro est volontairement simple (détection
  d'énergie / onset), pensée comme un repère visuel d'entraînement plutôt qu'une mesure
  de précision professionnelle.
- L'illustration animée est un rendu vectoriel léger (pas une vidéo) afin de rester
  intégralement et légèrement cachée pour l'usage hors-ligne.
