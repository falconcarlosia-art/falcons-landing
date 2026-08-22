import { Link, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AdminLayout({ children }) {
  const handleLogout = () => supabase.auth.signOut();
  const { pathname } = useLocation();

  const tabs = [
    {
      label: "Productos",
      to: "/admin",
      active: !pathname.startsWith("/admin/servicios") && !pathname.startsWith("/admin/precios"),
    },
    { label: "Servicios", to: "/admin/servicios", active: pathname.startsWith("/admin/servicios") },
    { label: "Precios internos", to: "/admin/precios", active: pathname.startsWith("/admin/precios") },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-white font-bold">Panel Falcons</h1>
            <nav className="flex items-center gap-1">
              {tabs.map((tab) => (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    tab.active ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
