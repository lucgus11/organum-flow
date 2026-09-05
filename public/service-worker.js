// Organum Flow — Service Worker
// Stratégie : précache de l'intégralité de l'app shell au build (voir precache-manifest.json,
// généré par vite.config.ts), puis "cache-first, réseau en secours" pour toutes les requêtes GET.
// Objectif : une fois l'app ouverte une première fois (avec réseau), elle doit fonctionner
// à 100% hors-ligne, y compris après un rechargement complet ou un redémarrage du navigateur.

const CACHE_PREFIX = "organum-flow-";
const MANIFEST_URL = "/precache-manifest.json";
const OFFLINE_FALLBACK = "/index.html";

// Récupère la liste des fichiers à mettre en cache + la version de build.
async function readPrecacheManifest() {
  const res = await fetch(MANIFEST_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("precache-manifest.json introuvable");
  return res.json();
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const { version, files } = await readPrecacheManifest();
        const cacheName = CACHE_PREFIX + version;
        const cache = await caches.open(cacheName);

        // On ajoute chaque fichier individuellement : une seule ressource manquante
        // ne doit pas faire échouer l'installation complète du Service Worker.
        await Promise.all(
          files.map(async (url) => {
            try {
              const response = await fetch(url, { cache: "no-store" });
              if (response.ok) await cache.put(url, response);
            } catch (err) {
              console.warn("[SW] Échec précache:", url, err);
            }
          })
        );
      } catch (err) {
        console.error("[SW] Précache impossible, fonctionnement hors-ligne non garanti:", err);
      }
      // Active immédiatement le nouveau SW sans attendre la fermeture des onglets ouverts.
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX))
          .filter(async (key) => {
            const { version } = await readPrecacheManifest().catch(() => ({ version: null }));
            return key !== CACHE_PREFIX + version;
          })
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // On ne gère que les requêtes GET same-origin ; le reste (POST, cross-origin API tierces
  // éventuelles, etc.) part directement au réseau sans passer par le cache.
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(request, { ignoreSearch: true });
      if (cached) return cached;

      try {
        const response = await fetch(request);
        // Mise en cache opportuniste de toute nouvelle ressource same-origin réussie.
        if (response.ok) {
          const cache = await caches.open(await currentCacheName());
          cache.put(request, response.clone());
        }
        return response;
      } catch (err) {
        // Hors-ligne et absent du cache : pour une navigation, on retombe sur l'app shell
        // (utile pour un rafraîchissement sur une URL profonde jamais visitée hors-ligne).
        if (request.mode === "navigate") {
          const fallback = await caches.match(OFFLINE_FALLBACK);
          if (fallback) return fallback;
        }
        throw err;
      }
    })()
  );
});

async function currentCacheName() {
  const keys = await caches.keys();
  const match = keys.find((key) => key.startsWith(CACHE_PREFIX));
  return match ?? CACHE_PREFIX + "runtime";
}

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
