import Navbar from "./Navbar";
import Footer from "./Footer";
import OrderDrawer, { OrderFab } from "./OrderDrawer";
import WhatsAppFab, { DEFAULT_WHATSAPP_MESSAGE } from "./WhatsAppFab";
import { useOrder } from "../lib/order";

// Botones flotantes abajo a la derecha, apilados ("Mi pedido" encima de
// WhatsApp). z-40: debajo del navbar (z-50) y de los modales (z-[60]).
// Con barra inferior fija (ficha de producto) suben en móvil para no
// taparla; la barra mide ~4.5rem + safe-area. El contenedor no captura
// clics fuera de los botones.
function FloatingActions({ raised, whatsappMessage }) {
  const { open } = useOrder();
  return (
    <div
      className={`fixed right-4 z-40 flex flex-col items-end gap-3 pointer-events-none [&>*]:pointer-events-auto ${
        raised
          ? "bottom-[calc(5.5rem_+_env(safe-area-inset-bottom))] lg:bottom-[calc(1.5rem_+_env(safe-area-inset-bottom))]"
          : "bottom-[calc(1.5rem_+_env(safe-area-inset-bottom))]"
      }`}
    >
      <OrderFab />
      {!open && <WhatsAppFab message={whatsappMessage} />}
    </div>
  );
}

// Marco común de las páginas públicas: navbar, footer, botones flotantes y
// la lista de pedido. `whatsappMessage` precarga el mensaje del botón de
// WhatsApp según la página (contrato con las demás páginas).
export default function SiteShell({ children, hasBottomBar = false, whatsappMessage = DEFAULT_WHATSAPP_MESSAGE }) {
  return (
    <div className="min-h-screen bg-bg text-ink font-sans antialiased">
      <Navbar />
      <main>{children}</main>
      {/* Espacio extra en móvil para que los botones flotantes no tapen el pie */}
      <Footer className={hasBottomBar ? "pb-40 lg:pb-10" : "pb-24 lg:pb-10"} />
      <FloatingActions raised={hasBottomBar} whatsappMessage={whatsappMessage} />
      <OrderDrawer />
    </div>
  );
}
