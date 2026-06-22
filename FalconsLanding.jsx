import { useState, useEffect } from "react";
import productsData from "./products.json";
import {
  Zap,
  Leaf,
  Shield,
  Wifi,
  Menu,
  X,
  ChevronRight,
  MessageCircle,
  Send,
  Sun,
  Moon,
  Radio,
  Globe,
  Activity,
  Star,
  CheckCircle,
  Thermometer,
  ToggleLeft,
  ScanFace,
  DoorOpen,
  Plug,
  LayoutGrid,
} from "lucide-react";

// ─── Navbar ──────────────────────────────────────────────────────────────────

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Soluciones", href: "#soluciones" },
    { label: "Productos", href: "#productos" },
    { label: "Cotizar", href: "#contacto" },
  ];

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-slate-950/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Activity size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Falcons
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200"
              >
                {label}
              </a>
            ))}
          </div>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-3">
            <button className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40">
              Cotizar Proyecto
              <ChevronRight size={14} />
            </button>
            <button
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-slate-950/98 backdrop-blur-md border-t border-slate-800 px-4 pb-4 pt-2">
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm font-medium text-slate-300 hover:text-white border-b border-slate-800/60 last:border-0 transition-colors"
            >
              {label}
            </a>
          ))}
          <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all duration-200">
            Cotizar Proyecto
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </nav>
  );
}

// ─── Smart Dashboard (Hero right side) ───────────────────────────────────────

function SmartDashboard() {
  const [active, setActive] = useState(null);

  const modes = [
    {
      id: "cinema",
      label: "Modo Cine",
      icon: <Sun size={20} />,
      color: "blue",
      status: "Listo",
    },
    {
      id: "night",
      label: "Modo Noche",
      icon: <Moon size={20} />,
      color: "indigo",
      status: "Standby",
    },
    {
      id: "security",
      label: "Seguridad Activa",
      icon: <Shield size={20} />,
      color: "emerald",
      status: "Monitoreando",
    },
  ];

  const colorMap = {
    blue: {
      ring: "ring-blue-500/60",
      glow: "shadow-blue-500/40",
      bg: "bg-blue-600/20",
      icon: "text-blue-400",
      badge: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      dot: "bg-blue-400",
    },
    indigo: {
      ring: "ring-indigo-500/60",
      glow: "shadow-indigo-500/40",
      bg: "bg-indigo-600/20",
      icon: "text-indigo-400",
      badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
      dot: "bg-indigo-400",
    },
    emerald: {
      ring: "ring-emerald-500/60",
      glow: "shadow-emerald-500/40",
      bg: "bg-emerald-600/20",
      icon: "text-emerald-400",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      dot: "bg-emerald-400",
    },
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-blue-600/10 rounded-2xl blur-3xl -z-10" />

      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 shadow-2xl">
        {/* Dashboard header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
              Smart Home
            </p>
            <h3 className="text-white font-semibold text-lg">Panel de Control</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">Online</span>
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Temp.", value: "22°C", icon: <Thermometer size={14} /> },
            { label: "Energía", value: "1.2 kW", icon: <Zap size={14} /> },
            { label: "Dispositivos", value: "12", icon: <Wifi size={14} /> },
          ].map(({ label, value, icon }) => (
            <div
              key={label}
              className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3 text-center"
            >
              <div className="flex items-center justify-center text-slate-400 mb-1">
                {icon}
              </div>
              <p className="text-white text-sm font-bold">{value}</p>
              <p className="text-slate-500 text-xs">{label}</p>
            </div>
          ))}
        </div>

        {/* Mode toggles */}
        <div className="space-y-3">
          {modes.map((mode) => {
            const isActive = active === mode.id;
            const c = colorMap[mode.color];
            return (
              <button
                key={mode.id}
                onClick={() => setActive(isActive ? null : mode.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left
                  ${
                    isActive
                      ? `${c.bg} ${c.ring} ring-1 shadow-lg ${c.glow} border-transparent`
                      : "bg-slate-800/40 border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-800/70"
                  }`}
              >
                {/* Icon with pulse ring */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                    ${isActive ? c.bg : "bg-slate-700/60"}
                    ${c.icon}`}
                  >
                    {mode.icon}
                  </div>
                  {isActive && (
                    <>
                      <span
                        className={`absolute inset-0 rounded-xl ${c.ring} ring-1 animate-ping opacity-50`}
                      />
                      <span
                        className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${c.dot} shadow-sm`}
                      />
                    </>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold transition-colors ${
                      isActive ? "text-white" : "text-slate-300"
                    }`}
                  >
                    {mode.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{mode.status}</p>
                </div>

                <div
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all duration-300
                  ${isActive ? c.badge : "bg-slate-700/40 text-slate-500 border-slate-700/40"}`}
                >
                  {isActive ? "Activo" : "Off"}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div className="mt-5 pt-4 border-t border-slate-700/40 flex items-center justify-between">
          <p className="text-xs text-slate-500">Última sync: hace 2s</p>
          <div className="flex items-center gap-1">
            <Radio size={12} className="text-emerald-500" />
            <span className="text-xs text-emerald-500 font-medium">Zigbee</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-slate-950 overflow-hidden pt-16">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600/8 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Domótica de próxima generación
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white">
              Toma el{" "}
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                control total
              </span>{" "}
              de tus espacios con Falcons
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
              Automatiza tu hogar o empresa con tecnología de precisión. Confort
              inteligente, seguridad reforzada y ahorro energético real — todo
              desde un solo panel de control.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold transition-all duration-200 shadow-xl shadow-blue-600/30 hover:shadow-blue-500/40">
                Ver Productos
                <ChevronRight size={16} />
              </button>
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold transition-all duration-200 hover:bg-slate-800/50 active:scale-95">
                Asesoría Gratuita
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              {[
                { icon: <CheckCircle size={14} />, text: "+200 proyectos" },
                { icon: <Star size={14} />, text: "4.9/5 satisfacción" },
                { icon: <Shield size={14} />, text: "Garantía 2 años" },
              ].map(({ icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-1.5 text-sm text-slate-500"
                >
                  <span className="text-emerald-500">{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Smart Dashboard */}
          <div className="lg:justify-self-end w-full">
            <SmartDashboard />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Value Proposition ────────────────────────────────────────────────────────

function ValueProposition() {
  const features = [
    {
      icon: <Zap size={24} />,
      title: "Ultra-fast Response",
      desc: "Latencia < 50ms en comandos locales para reacción instantánea.",
      color: "blue",
    },
    {
      icon: <Leaf size={24} />,
      title: "Eficiencia Energética",
      desc: "Reduce hasta un 35% el consumo con automatización inteligente.",
      color: "emerald",
    },
    {
      icon: <Shield size={24} />,
      title: "Protocolos Seguros",
      desc: "Compatibilidad nativa con Zigbee 3.0, Wi-Fi 6 y Modbus RTU.",
      color: "blue",
    },
    {
      icon: <Globe size={24} />,
      title: "Control Remoto",
      desc: "Gestiona todo desde cualquier lugar con nuestra app móvil.",
      color: "emerald",
    },
  ];

  const colorMap = {
    blue: "bg-blue-600/10 border-blue-500/20 text-blue-400",
    emerald: "bg-emerald-600/10 border-emerald-500/20 text-emerald-400",
  };

  return (
    <section id="soluciones" className="bg-slate-900 py-24 border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest uppercase text-blue-400 mb-3">
            ¿Por qué Falcons?
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Tecnología que trabaja para ti
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon, title, desc, color }) => (
            <div
              key={title}
              className="group bg-slate-950/50 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/50"
            >
              <div
                className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 ${colorMap[color]}`}
              >
                {icon}
              </div>
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Protocol badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {["Zigbee 3.0", "Wi-Fi 6", "Modbus RTU", "Z-Wave", "BLE 5.0", "MQTT"].map(
            (badge) => (
              <span
                key={badge}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800 border border-slate-700 text-slate-400"
              >
                {badge}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Product Showroom ─────────────────────────────────────────────────────────

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ images, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors"
      >
        <X size={18} />
      </button>

      {/* Image */}
      <img
        src={images[idx]}
        alt={`foto ${idx + 1}`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
      />

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % images.length); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                className={`h-1.5 rounded-full transition-all duration-200 ${i === idx ? "bg-white w-5" : "bg-white/30 w-1.5"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Product Image Carousel ───────────────────────────────────────────────────

function ProductCarousel({ images, icon: IconComponent, iconBg }) {
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const hasImages = images && images.length > 0;

  const prev = (e) => { e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setIdx((i) => (i + 1) % images.length); };

  if (!hasImages) {
    return (
      <div className="relative w-full h-44 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
        />
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${iconBg}`}>
          <IconComponent size={28} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative h-44 overflow-hidden bg-slate-800 select-none">
        <img
          src={images[idx]}
          alt={`foto ${idx + 1}`}
          onClick={() => setLightbox(true)}
          className="w-full h-full object-cover transition-opacity duration-300 cursor-zoom-in"
        />

        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950/70 hover:bg-slate-950/90 flex items-center justify-center text-white transition-all">
              <ChevronRight size={14} className="rotate-180" />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950/70 hover:bg-slate-950/90 flex items-center justify-center text-white transition-all">
              <ChevronRight size={14} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                  className={`h-1.5 rounded-full transition-all duration-200 ${i === idx ? "bg-white w-3" : "bg-white/40 w-1.5"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {lightbox && <Lightbox images={images} startIdx={idx} onClose={() => setLightbox(false)} />}
    </>
  );
}

// Íconos disponibles para usar en products.json (campo "icon")
const ICON_MAP = {
  ToggleLeft,
  LayoutGrid,
  ScanFace,
  DoorOpen,
  Plug,
  Thermometer,
  Zap,
  Shield,
  Wifi,
  Globe,
};

// Colores por categoría — agregar aquí si se añade una categoría nueva
const CATEGORY_STYLES = {
  Interruptores:  "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "Pared Táctil": "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  Sensores:       "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Accesorios:     "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

const ICON_BG = {
  Interruptores:  "bg-blue-600/10 text-blue-400",
  "Pared Táctil": "bg-indigo-600/10 text-indigo-400",
  Sensores:       "bg-emerald-600/10 text-emerald-400",
  Accesorios:     "bg-amber-600/10 text-amber-400",
};

const APP_STYLES = {
  "Tuya Smart": "bg-orange-500/10 border-orange-500/20 text-orange-400",
  eWeLink:      "bg-sky-500/10 border-sky-500/20 text-sky-400",
};

function ProductShowroom() {
  const [active, setActive] = useState("Todos");

  const categories = ["Todos", ...new Set(productsData.map((p) => p.category))];
  const filtered = active === "Todos" ? productsData : productsData.filter((p) => p.category === active);

  return (
    <section id="productos" className="bg-slate-950 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-blue-400 mb-3">
            Catálogo Real
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Nuestros Productos
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Dispositivos WiFi certificados, compatibles con Alexa, Google Home y las apps
            líderes de domótica.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200
                ${
                  active === cat
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => {
            const IconComponent = ICON_MAP[product.icon] ?? Zap;
            return (
            <div
              key={product.title}
              className="group bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-950/80 flex flex-col"
            >
              {/* Carousel */}
              <div className="relative">
                <ProductCarousel
                  images={product.images}
                  icon={IconComponent}
                  iconBg={ICON_BG[product.category] ?? "bg-slate-700/10 text-slate-400"}
                />
                <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full border ${CATEGORY_STYLES[product.category]}`}>
                  {product.category}
                </span>
                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-sm border border-slate-700 rounded-xl px-3 py-1.5 text-center">
                  <p className="text-[10px] text-slate-500 leading-none mb-0.5">precio</p>
                  <p className="text-white font-bold text-base leading-none">S/. {product.price}</p>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-white font-bold text-base leading-snug flex-1">
                    {product.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-500 mb-1">Modelo: {product.model}</p>

                <p className="text-slate-400 text-sm leading-relaxed mb-5 flex-1">
                  {product.desc}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-600/10 border border-blue-500/20 text-blue-400">
                    <Wifi size={10} />
                    Wi-Fi
                  </span>
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-medium border ${APP_STYLES[product.app]}`}
                  >
                    {product.app}
                  </span>
                </div>

                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30">
                  <MessageCircle size={14} />
                  Consultar por WhatsApp
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Contact / Lead Capture ───────────────────────────────────────────────────

function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    projectType: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("¡Solicitud enviada! Te contactaremos pronto.");
  };

  const inputCls =
    "w-full bg-slate-800/60 border border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm transition-all duration-200";

  return (
    <section id="contacto" className="bg-slate-900 py-24 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div className="space-y-6">
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-400">
              Empieza hoy
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Obtén tu{" "}
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                cotización personalizada
              </span>{" "}
              sin costo
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Cuéntanos sobre tu espacio y necesidades. Nuestro equipo de ingenieros
              te contactará en menos de 24 horas con una propuesta técnica a medida.
            </p>

            <div className="space-y-4 pt-2">
              {[
                { icon: <CheckCircle size={16} />, text: "Diagnóstico técnico gratuito" },
                { icon: <CheckCircle size={16} />, text: "Propuesta en 24h" },
                { icon: <CheckCircle size={16} />, text: "Sin compromiso de contratación" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="text-emerald-500 flex-shrink-0">{icon}</span>
                  {text}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {["C", "M", "R"].map((l) => (
                  <div
                    key={l}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {l}
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-400">
                <span className="text-white font-semibold">+200 clientes</span> confían
                en Falcons
              </p>
            </div>
          </div>

          {/* Right — form */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Carlos Falcón"
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+52 55 1234 5678"
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Tipo de Proyecto
                </label>
                <select
                  name="projectType"
                  value={form.projectType}
                  onChange={handleChange}
                  className={`${inputCls} cursor-pointer`}
                  required
                >
                  <option value="" disabled>
                    Selecciona una opción...
                  </option>
                  <option value="residencial">Residencial</option>
                  <option value="comercial">Comercial / Oficinas</option>
                  <option value="industrial">Industrial Ligero</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Cuéntanos sobre tu espacio
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Ej: Casa de 2 pisos, 4 habitaciones, quiero automatizar iluminación, climatización y seguridad..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold text-sm transition-all duration-200 shadow-xl shadow-blue-600/30 hover:shadow-blue-500/40 mt-2"
              >
                <Send size={16} />
                Enviar Solicitud e Iniciar Cotización
              </button>

              <p className="text-center text-xs text-slate-600 pt-1">
                Al enviar aceptas nuestra política de privacidad. Sin spam.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <Activity size={14} className="text-white" />
          </div>
          <span className="text-white font-bold">Falcons</span>
        </div>
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} Falcons Domótica. Todos los derechos reservados.
        </p>
        <div className="flex gap-5">
          {["Privacidad", "Términos", "Contacto"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function FalconsLanding() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased">
      <Navbar />
      <Hero />
      <ValueProposition />
      <ProductShowroom />
      <ContactForm />
      <Footer />
    </div>
  );
}
