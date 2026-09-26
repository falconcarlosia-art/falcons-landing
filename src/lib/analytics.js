// GA4 opcional: solo se carga si existe VITE_GA_ID (p. ej. "G-XXXXXXX") en
// el entorno del build. Sin ID, trackEvent es un no-op.
const GA_ID = import.meta.env.VITE_GA_ID;

export function initAnalytics() {
  if (!GA_ID || typeof window === "undefined") return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID);

  // Un solo listener para todos los CTAs de contacto del sitio, en vez de
  // instrumentar cada botón: cualquier link a WhatsApp o teléfono cuenta.
  document.addEventListener("click", (e) => {
    const link = e.target.closest?.("a[href]");
    if (!link) return;
    const href = link.getAttribute("href");
    if (href.startsWith("https://wa.me/")) {
      trackEvent("click_whatsapp", { link_text: link.textContent.trim() });
    } else if (href.startsWith("tel:")) {
      trackEvent("click_telefono");
    }
  });
}

export function trackEvent(name, params = {}) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, { page_path: window.location.pathname, ...params });
}
