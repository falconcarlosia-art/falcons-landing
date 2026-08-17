import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import AdminLogin from "./AdminLogin";
import AdminLayout from "./AdminLayout";
import ProductList from "./ProductList";
import ProductForm from "./ProductForm";
import ServiceList from "./ServiceList";
import ServiceForm from "./ServiceForm";

export default function AdminApp() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Cargando...
      </div>
    );
  }

  if (!session) {
    return <AdminLogin />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route index element={<ProductList />} />
        <Route path="productos/nuevo" element={<ProductForm />} />
        <Route path="productos/:id" element={<ProductForm />} />
        <Route path="servicios" element={<ServiceList />} />
        <Route path="servicios/nuevo" element={<ServiceForm />} />
        <Route path="servicios/:id" element={<ServiceForm />} />
      </Routes>
    </AdminLayout>
  );
}
