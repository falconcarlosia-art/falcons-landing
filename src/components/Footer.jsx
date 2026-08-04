export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <img src="/logo-falcons.png" alt="Falcons" className="h-7 w-auto" />
          <span className="text-white text-sm font-semibold tracking-widest uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            ALCONS
          </span>
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
