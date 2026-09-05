import { useEffect, useRef } from "react";

/**
 * Demande un verrou d'écran (Screen Wake Lock API) tant que `active` est vrai, pour éviter
 * que l'écran ne s'éteigne en plein exercice sur le pupitre. Échoue silencieusement si l'API
 * n'est pas supportée : ce n'est qu'un confort, pas une fonctionnalité bloquante.
 */
export function useWakeLock(active: boolean) {
  const lockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;

    let released = false;

    const requestLock = async () => {
      try {
        const lock = await (navigator as any).wakeLock.request("screen");
        if (released) {
          lock.release?.();
          return;
        }
        lockRef.current = lock;
      } catch {
        // Refusé (batterie faible, onglet en arrière-plan…) : sans impact fonctionnel.
      }
    };

    requestLock();

    // Certains navigateurs relâchent le verrou quand l'onglet perd le focus ;
    // on le redemande au retour au premier plan.
    const handleVisibility = () => {
      if (document.visibilityState === "visible") requestLock();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      released = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      lockRef.current?.release?.().catch(() => {});
      lockRef.current = null;
    };
  }, [active]);
}
