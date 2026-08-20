import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import AppRoutes from "./routes.jsx";
import { PrerenderContext } from "./lib/PrerenderContext.js";

function readInitialData() {
  const el = document.getElementById("__PRERENDER_DATA__");
  if (!el) return {};
  try {
    return JSON.parse(el.textContent);
  } catch {
    return {};
  }
}

const rootEl = document.getElementById("root");
const initialData = readInitialData();

const app = (
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <PrerenderContext.Provider value={initialData}>
          <AppRoutes />
        </PrerenderContext.Provider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

// .children cuenta solo nodos Elemento: en `vite dev` #root solo contiene el
// comentario placeholder "<!--app-html-->" (0 children), así que arranca en
// modo cliente puro; en el HTML ya prerenderizado, #root trae el árbol real,
// así que hidrata en vez de repintar desde cero.
rootEl.children.length > 0
  ? ReactDOM.hydrateRoot(rootEl, app)
  : ReactDOM.createRoot(rootEl).render(app);
