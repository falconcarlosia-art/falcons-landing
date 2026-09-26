import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { usePrerenderData } from "./PrerenderContext";
import { PRODUCT_SELECT, buildNav, normalizeProduct, toListItem } from "./catalog.js";

// Una sola consulta del catálogo por sesión: Home, Catálogo y el mega menú
// comparten la misma promesa al navegar entre páginas.
let cached = null;

export function loadProducts() {
  if (!cached) {
    cached = supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .order("id")
      .then(({ data, error }) => {
        if (error) {
          cached = null;
          throw new Error(error.message);
        }
        return data.map((p) => normalizeProduct(toListItem(p)));
      });
  }
  return cached;
}

// Arranca con los productos del HTML prerenderizado (si la página los trae)
// y luego refresca desde Supabase.
export function useProducts() {
  const seed = usePrerenderData();
  const seeded = seed?.products?.map(normalizeProduct);
  const [state, setState] = useState(() => ({
    products: seeded ?? [],
    loading: !seeded,
    error: null,
  }));

  useEffect(() => {
    let cancelled = false;
    loadProducts()
      .then((products) => !cancelled && setState({ products, loading: false, error: null }))
      .catch((err) => !cancelled && setState((s) => ({ ...s, loading: false, error: err.message })));
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

// Índice de categorías/ambientes para el mega menú y el footer.
export function useCatalogNav() {
  const seed = usePrerenderData();
  const [nav, setNav] = useState(seed?.nav ?? null);

  useEffect(() => {
    if (nav) return;
    let cancelled = false;
    loadProducts()
      .then((products) => !cancelled && setNav(buildNav(products)))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [nav]);

  return nav;
}
