import { useCallback, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { ExerciseScreen } from "./components/ExerciseScreen";
import type { SessionConfig } from "./types";

const STORAGE_KEY = "organum-flow:last-session-config";

function loadStoredConfig(): Partial<SessionConfig> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function App() {
  const [session, setSession] = useState<SessionConfig | null>(null);
  const [initialConfig] = useState<Partial<SessionConfig>>(loadStoredConfig);

  const handleStart = useCallback((config: SessionConfig) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Stockage indisponible (navigation privée, quota) : la session démarre quand même.
    }
    setSession(config);
  }, []);

  const handleExit = useCallback(() => setSession(null), []);

  if (session) {
    return <ExerciseScreen config={session} onExit={handleExit} />;
  }

  return <Dashboard initialConfig={initialConfig} onStart={handleStart} />;
}
