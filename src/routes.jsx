import { Suspense, lazy } from "react";
// De "react-router" (no "-dom"): ver nota en entry-server.jsx sobre el
// bug de detección de named exports de Vite bajo ssrLoadModule.
import { Routes, Route } from "react-router";
import FalconsLanding from "../FalconsLanding.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import CatalogPage from "./pages/CatalogPage.jsx";
import ServicePage from "./pages/ServicePage.jsx";
import NotFound from "./pages/NotFound.jsx";
import { OrderProvider } from "./lib/order.jsx";

// AdminApp se mantiene lazy: nunca es la ruta que se prerenderiza, así que
// renderToString nunca necesita esperar su promesa de import.
const AdminApp = lazy(() => import("./admin/AdminApp.jsx"));

function PageFallback() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center text-muted">
      Cargando...
    </div>
  );
}

export default function AppRoutes() {
  return (
    <OrderProvider>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<FalconsLanding />} />
          <Route path="/productos" element={<CatalogPage />} />
          <Route path="/productos/:categorySlug" element={<CatalogPage />} />
          <Route path="/producto/:id/:slug" element={<ProductPage />} />
          <Route path="/servicios/:id/:slug" element={<ServicePage />} />
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </OrderProvider>
  );
}
