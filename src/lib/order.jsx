// Lista de pedido: el "carrito" del sitio. No hay checkout — el cierre es un
// único mensaje de WhatsApp con todos los productos (ver buildOrderMessage).
// Se guarda en localStorage solo como comodidad para el visitante.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { trackEvent } from "./analytics.js";
import { productUrl } from "./catalog.js";

const STORAGE_KEY = "falcons-order-v1";
const OrderContext = createContext(null);

const itemKey = (id, variant) => `${id}|${JSON.stringify(variant ?? {})}`;

export function OrderProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Se lee después del montaje (no en useState) para que el HTML
  // prerenderizado y la hidratación coincidan.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(saved)) setItems(saved);
    } catch {
      /* storage bloqueado o corrupto: se empieza vacío */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* sin persistencia en modo privado: la lista vive en memoria */
    }
  }, [items, loaded]);

  const add = useCallback((product, qty = 1, variant = {}) => {
    const key = itemKey(product.id, variant);
    setItems((list) => {
      const existing = list.find((i) => i.key === key);
      if (existing) return list.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      return [
        ...list,
        {
          key,
          id: product.id,
          title: product.title,
          model: product.model,
          price: Number(product.price),
          image: product.images?.[0] ?? null,
          url: productUrl(product),
          variant,
          qty,
        },
      ];
    });
    trackEvent("add_to_order", { item_id: product.id, item_name: product.title, quantity: qty });
  }, []);

  const setQty = useCallback((key, qty) => {
    setItems((list) =>
      qty <= 0 ? list.filter((i) => i.key !== key) : list.map((i) => (i.key === key ? { ...i, qty } : i))
    );
  }, []);

  const remove = useCallback((key) => setItems((list) => list.filter((i) => i.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    return { items, count, total, add, setQty, remove, clear, open, setOpen };
  }, [items, add, setQty, remove, clear, open]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder debe usarse dentro de <OrderProvider>");
  return ctx;
}
