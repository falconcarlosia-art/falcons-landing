import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Check, Plus, ChevronRight } from "lucide-react";
import { formatPrice, labelOf, productUrl, PROTOCOLS } from "../lib/catalog";
import { useOrder } from "../lib/order";
import ProductImage from "./ProductImage";

// Botón "+" redondo de 44px: agrega sin salir del listado y confirma con ✓.
// Si el producto tiene variantes, lleva a la ficha para elegirlas.
export function QuickAddButton({ product }) {
  const { add } = useOrder();
  const [done, setDone] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);

  const base =
    "shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand";

  if (!product.in_stock) return null;

  if (product.variants?.length) {
    return (
      <Link
        to={productUrl(product)}
        aria-label={`Elegir opciones de ${product.title}`}
        className={`${base} bg-surface-2 text-ink hover:bg-brand hover:text-brand-ink`}
      >
        <ChevronRight size={18} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        add(product);
        setDone(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setDone(false), 1500);
      }}
      aria-label={`Agregar ${product.title} a mi pedido`}
      className={`${base} ${done ? "bg-wa text-white" : "bg-brand text-brand-ink hover:bg-brand-hover"}`}
    >
      {done ? <Check size={18} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} />}
    </button>
  );
}

export default function ProductCard({ product }) {
  const url = productUrl(product);

  return (
    <article className="group relative flex flex-col rounded-card bg-surface border border-line hover:border-subtle/60 overflow-hidden transition-colors duration-200">
      <Link to={url} className="relative block" tabIndex={-1} aria-hidden="true">
        <ProductImage
          src={product.images[0]}
          alt=""
          className="aspect-square"
          imgClassName="group-hover:scale-105"
        />
        {!product.in_stock && (
          <span className="absolute top-2.5 left-2.5 text-[11px] font-semibold px-2 py-1 rounded-md bg-bg/90 text-muted">
            Agotado
          </span>
        )}
      </Link>

      <div className="flex flex-col flex-1 p-3 sm:p-4 gap-1.5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-subtle truncate">
          {product.category}
        </p>
        <h3 className="text-sm sm:text-[15px] font-medium leading-snug text-ink line-clamp-2 min-h-[2.5em]">
          <Link to={url} className="hover:text-brand transition-colors after:absolute after:inset-0 after:content-['']">
            {product.title}
          </Link>
        </h3>

        <div className="hidden sm:flex flex-wrap gap-1.5 mt-0.5">
          <span className="px-1.5 py-0.5 rounded text-[11px] font-mono text-muted bg-surface-2">
            {labelOf(PROTOCOLS, product.protocol)}
          </span>
          {product.app && (
            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono text-muted bg-surface-2">
              {product.app}
            </span>
          )}
        </div>

        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <p className="text-base sm:text-lg font-semibold text-ink tabular">{formatPrice(product.price)}</p>
          {/* z-10 para quedar sobre el link que cubre toda la tarjeta */}
          <div className="relative z-10">
            <QuickAddButton product={product} />
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-card bg-surface border border-line overflow-hidden animate-pulse">
      <div className="aspect-square bg-surface-2" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-1/3 bg-surface-2 rounded" />
        <div className="h-4 w-4/5 bg-surface-2 rounded" />
        <div className="h-5 w-1/4 bg-surface-2 rounded mt-4" />
      </div>
    </div>
  );
}
