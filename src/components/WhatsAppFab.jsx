import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "../lib/whatsapp";

export const DEFAULT_WHATSAPP_MESSAGE = "Hola Falcons, quiero cotizar un proyecto de domótica.";

// Botón flotante de WhatsApp. La posición la da el contenedor de SiteShell
// (apilado con el botón "Mi pedido"); aquí solo el círculo y la etiqueta.
export default function WhatsAppFab({ message = DEFAULT_WHATSAPP_MESSAGE }) {
  return (
    <a
      href={buildWhatsAppLink(message || DEFAULT_WHATSAPP_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp (se abre en una pestaña nueva)"
      className="group relative w-14 h-14 rounded-full bg-wa hover:bg-wa-hover text-white flex items-center justify-center shadow-xl shadow-black/40 active:scale-95 transition-all animate-fade-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wa-hover focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      <MessageCircle size={26} aria-hidden="true" />
      {/* Etiqueta solo en desktop, al pasar el mouse o con foco de teclado */}
      <span
        aria-hidden="true"
        className="pointer-events-none hidden lg:block absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap rounded-lg bg-surface-2 border border-line px-3 py-1.5 text-sm font-medium text-ink shadow-lg opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 transition-all"
      >
        Escríbenos por WhatsApp
      </span>
    </a>
  );
}
