import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ShoppingBag, X, Minus, Plus, Trash2, MessageCircle } from "lucide-react";
import { useOrder } from "../lib/order";
import { formatPrice } from "../lib/catalog";
import { buildOrderMessage, buildWhatsAppLink, variantText } from "../lib/whatsapp";
import ProductImage from "./ProductImage";

// Botón flotante con contador. `raised` lo sube en móvil cuando la página
// tiene su propia barra inferior (ficha de producto).
export function OrderFab({ raised = false }) {
  const { count, setOpen } = useOrder();
  if (count === 0) return null;

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={`Ver mi pedido (${count} productos)`}
      className={`fixed right-4 z-40 flex items-center gap-2 h-14 pl-4 pr-5 rounded-full bg-brand text-brand-ink font-semibold shadow-xl shadow-black/40 hover:bg-brand-hover active:scale-95 transition-all animate-fade-in ${
        raised ? "bottom-24 lg:bottom-6" : "bottom-6"
      }`}
    >
      <span className="relative">
        <ShoppingBag size={22} />
        <span
          key={count}
          className="absolute -top-2 -right-2.5 min-w-[20px] h-5 px-1 rounded-full bg-bg text-ink text-[11px] font-bold flex items-center justify-center animate-pop tabular"
        >
          {count}
        </span>
      </span>
      <span className="text-sm">Mi pedido</span>
    </button>
  );
}

export default function OrderDrawer() {
  const { items, total, count, setQty, remove, clear, open, setOpen } = useOrder();
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, setOpen]);

  if (!open) return null;

  const inputCls =
    "w-full h-11 bg-bg border border-line focus:border-brand focus:outline-none rounded-lg px-3 text-sm text-ink placeholder:text-subtle";

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Mi pedido">
      <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={() => setOpen(false)} />

      <aside className="absolute inset-y-0 right-0 w-full sm:max-w-md bg-surface border-l border-line flex flex-col animate-slide-in">
        <header className="flex items-center justify-between px-5 h-16 border-b border-line">
          <h2 className="text-base font-semibold text-ink">
            Mi pedido <span className="text-muted font-normal tabular">({count})</span>
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-11 h-11 -mr-2 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-2"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-3">
            <ShoppingBag size={40} className="text-subtle" strokeWidth={1.25} />
            <p className="text-muted text-sm">Tu pedido está vacío.</p>
            <Link
              to="/productos"
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-brand hover:text-brand-hover"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto divide-y divide-line">
              {items.map((item) => (
                <li key={item.key} className="flex gap-3 p-4">
                  <Link to={item.url} onClick={() => setOpen(false)} className="shrink-0">
                    <ProductImage src={item.image} alt={item.title} className="w-16 h-16 rounded-lg" padding="p-1.5" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={item.url}
                      onClick={() => setOpen(false)}
                      className="text-sm font-medium text-ink line-clamp-2 hover:text-brand"
                    >
                      {item.title}
                    </Link>
                    {variantText(item.variant) && (
                      <p className="text-xs text-muted mt-0.5">{variantText(item.variant)}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center rounded-lg border border-line">
                        <button
                          type="button"
                          onClick={() => setQty(item.key, item.qty - 1)}
                          className="w-9 h-9 flex items-center justify-center text-muted hover:text-ink"
                          aria-label="Quitar uno"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-7 text-center text-sm tabular">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(item.key, item.qty + 1)}
                          className="w-9 h-9 flex items-center justify-center text-muted hover:text-ink"
                          aria-label="Agregar uno"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-ink tabular">
                          {formatPrice(item.price * item.qty)}
                        </span>
                        <button
                          type="button"
                          onClick={() => remove(item.key)}
                          className="w-9 h-9 flex items-center justify-center text-subtle hover:text-red-400"
                          aria-label={`Eliminar ${item.title}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-line p-4 space-y-3 pb-safe">
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre (opcional)"
                  className={inputCls}
                  autoComplete="name"
                />
                <input
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Distrito (opcional)"
                  className={inputCls}
                />
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted">Total referencial</span>
                <span className="text-xl font-semibold text-ink tabular">{formatPrice(total)}</span>
              </div>

              <a
                href={buildWhatsAppLink(buildOrderMessage(items, { name, district }))}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-wa hover:bg-wa-hover text-white font-semibold transition-colors"
              >
                <MessageCircle size={18} />
                Enviar pedido por WhatsApp
              </a>
              <div className="flex items-center justify-between text-xs text-subtle">
                <span>Confirmamos stock y envío por WhatsApp.</span>
                <button type="button" onClick={clear} className="hover:text-muted underline underline-offset-2">
                  Vaciar
                </button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
