import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import "../src/index.css";
import FalconsLanding from "../FalconsLanding.jsx";

const AdminApp = lazy(() => import("./admin/AdminApp.jsx"));
const ProductPage = lazy(() => import("./pages/ProductPage.jsx"));

function PageFallback() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
      Cargando...
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<FalconsLanding />} />
            <Route path="/producto/:id/:slug" element={<ProductPage />} />
            <Route path="/admin/*" element={<AdminApp />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
