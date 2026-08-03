import { supabase } from "../lib/supabaseClient";

export default function AdminLayout({ children }) {
  const handleLogout = () => supabase.auth.signOut();

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-white font-bold">Panel de Productos — Falcons</h1>
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
