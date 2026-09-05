import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Le Service Worker précache l'intégralité de l'app shell (voir public/service-worker.js
// et le plugin de build dans vite.config.ts) pour un fonctionnement 100% hors-ligne
// dès la première visite. On ne l'enregistre qu'en production : en dev, Vite sert les
// fichiers non buildés et precache-manifest.json n'existe pas.
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch((err) => {
      console.error("Échec de l'enregistrement du Service Worker :", err);
    });
  });
}
