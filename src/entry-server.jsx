import React from "react";
import { renderToString } from "react-dom/server";
// Se importa de "react-router" (no "react-router-dom"): bajo vite.ssrLoadModule
// (Node), react-router-dom se resuelve por su condición "node" (CJS), y el
// análisis estático de named exports de Vite no detecta símbolos reexportados
// vía `export * from "react-router"` — StaticRouter está definido
// directamente en "react-router", donde sí se detecta bien.
import { StaticRouter } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import AppRoutes from "./routes.jsx";
import { PrerenderContext } from "./lib/PrerenderContext.js";

export function render(url, data = {}) {
  // helmetContext se crea por llamada — react-helmet-async v3 muta este
  // objeto durante el render; reusar uno solo entre rutas mezclaría los
  // head tags de una página con los de otra.
  const helmetContext = {};

  const appHtml = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <PrerenderContext.Provider value={data}>
          <AppRoutes />
        </PrerenderContext.Provider>
      </StaticRouter>
    </HelmetProvider>
  );

  return { appHtml, helmet: helmetContext.helmet, data };
}
