import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

/**
 * Après le build, liste tous les fichiers produits dans dist/ et écrit
 * dist/precache-manifest.json : { version, files }.
 * Le Service Worker (public/service-worker.js) va chercher ce fichier au démarrage
 * pour précacher l'intégralité de l'app shell — sans dépendre d'une liste codée en dur
 * qui deviendrait fausse au moindre changement de nom de fichier hashé par Vite.
 */
function precacheManifestPlugin(): Plugin {
  return {
    name: "organum-flow-precache-manifest",
    apply: "build",
    closeBundle() {
      const distDir = join(__dirname, "dist");
      const files: string[] = [];

      function walk(dir: string) {
        for (const entry of readdirSync(dir)) {
          const fullPath = join(dir, entry);
          const rel = "/" + fullPath.slice(distDir.length + 1).split("\\").join("/");
          if (statSync(fullPath).isDirectory()) {
            walk(fullPath);
          } else if (rel !== "/precache-manifest.json") {
            files.push(rel);
          }
        }
      }

      walk(distDir);

      // Racine de navigation explicitement incluse même si déjà présente via index.html.
      if (!files.includes("/")) files.push("/");

      const hash = createHash("sha256");
      for (const file of files.sort()) {
        try {
          hash.update(file);
          hash.update(readFileSync(join(distDir, file === "/" ? "index.html" : file)));
        } catch {
          // Fichier virtuel (ex: "/") : ignoré pour le hash de contenu.
        }
      }

      const manifest = {
        version: hash.digest("hex").slice(0, 16),
        generatedAt: new Date().toISOString(),
        files,
      };

      writeFileSync(join(distDir, "precache-manifest.json"), JSON.stringify(manifest, null, 2));
      console.log(`[precache-manifest] ${files.length} fichiers, version ${manifest.version}`);
    },
  };
}

export default defineConfig({
  plugins: [react(), precacheManifestPlugin()],
});
