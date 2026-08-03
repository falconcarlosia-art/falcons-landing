import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Correo o contraseña incorrectos.");
    }
    setLoading(false);
  };

  const inputCls =
    "w-full bg-slate-800/60 border border-slate-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/40 rounded-xl px-4 py-3 text-white text-sm";

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-5">
        <h1 className="text-xl font-bold text-white text-center">Panel Falcons</h1>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Correo</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputCls}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white font-semibold text-sm transition-colors"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
