import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import AuthGate from "./lib/auth.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthGate />
  </React.StrictMode>
);

// Registra el service worker solo en producción: es lo que permite que el
// navegador ofrezca "instalar" la app en el celular (PWA).
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
