import { useState } from "react";
import { Link } from "react-router";
import { Send, CheckCircle } from "lucide-react";
import { buildWhatsAppLink } from "../lib/whatsapp";
import { trackEvent } from "../lib/analytics";
import { BUSINESS } from "../lib/business";

// Formulario "Agendar visita técnica por WhatsApp" (home y /contacto).
// No guarda nada en servidores: arma un mensaje con los datos y abre
// WhatsApp para que el visitante lo envíe (ver /politica-de-privacidad).
export const DISTRICTS = [...BUSINESS.featuredDistricts, "Otro distrito de Lima"];

function VisitForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    district: "",
    projectType: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // La solicitud se entrega por WhatsApp (el canal que ya atiende el
  // negocio) con los datos prellenados — así no depende de un servicio de
  // formularios externo y el lead llega calificado (distrito + inmueble).
  const handleSubmit = (e) => {
    e.preventDefault();
    const lines = [
      "Hola, quiero agendar una visita técnica gratuita.",
      `Nombre: ${form.name}`,
      `Teléfono: ${form.phone}`,
      `Distrito: ${form.district}`,
      `Tipo de inmueble: ${form.projectType}`,
      form.message && `Detalle: ${form.message}`,
    ].filter(Boolean);
    trackEvent("submit_visita", { district: form.district, project_type: form.projectType });
    window.open(buildWhatsAppLink(lines.join("\n")), "_blank", "noopener,noreferrer");
  };

  const labelCls = "block text-xs font-medium text-muted mb-2";
  const inputCls =
    "w-full h-12 bg-bg border border-line hover:border-subtle focus:border-brand focus:outline-none rounded-xl px-4 text-ink placeholder:text-subtle text-base sm:text-sm transition-colors";

  return (
    <form onSubmit={handleSubmit} className="rounded-card bg-surface border border-line p-5 sm:p-8 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="c-name" className={labelCls}>Nombre</label>
          <input id="c-name" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Tu nombre" autoComplete="name" className={inputCls} required />
        </div>
        <div>
          <label htmlFor="c-phone" className={labelCls}>Teléfono / WhatsApp</label>
          <input id="c-phone" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="999 999 999" autoComplete="tel" inputMode="tel" className={inputCls} required />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="c-district" className={labelCls}>Distrito</label>
          <select id="c-district" name="district" value={form.district} onChange={handleChange} className={`${inputCls} cursor-pointer`} required>
            <option value="" disabled>Selecciona tu distrito…</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="c-type" className={labelCls}>Tipo de inmueble</label>
          <select id="c-type" name="projectType" value={form.projectType} onChange={handleChange} className={`${inputCls} cursor-pointer`} required>
            <option value="" disabled>Selecciona…</option>
            <option value="Casa">Casa</option>
            <option value="Departamento">Departamento</option>
            <option value="Oficina / Comercio">Oficina / Comercio</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="c-msg" className={labelCls}>¿Qué quieres automatizar? (opcional)</label>
        <textarea
          id="c-msg"
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={3}
          placeholder="Ej: departamento de 3 dormitorios, quiero automatizar luces y cortinas…"
          className={`${inputCls} h-auto py-3 resize-none`}
        />
      </div>

      <button
        type="submit"
        className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-wa hover:bg-wa-hover text-white font-semibold transition-colors"
      >
        <Send size={17} />
        Agendar visita técnica por WhatsApp
      </button>
      <p className="text-xs text-subtle text-center">
        Al enviar aceptas nuestra{" "}
        <Link to="/politica-de-privacidad" className="underline underline-offset-2 hover:text-ink">
          política de privacidad
        </Link>
        .
      </p>
    </form>
  );
}

// `withIntro`: sección completa con texto de venta (home). Sin intro solo se
// renderiza la tarjeta del formulario, para páginas que ya tienen su propio
// encabezado (/contacto). `id` mantiene el ancla /#contacto de la home.
export default function ContactForm({ id = "contacto", withIntro = true }) {
  if (!withIntro) {
    return (
      <div id={id} className="scroll-mt-24">
        <VisitForm />
      </div>
    );
  }

  return (
    <section id={id} className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="space-y-6">
          <p className="text-xs font-semibold tracking-wider uppercase text-brand">Visita técnica gratuita</p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-ink tracking-tight leading-tight">
            ¿Quieres automatizar tu casa completa?
          </h2>
          <p className="text-muted leading-relaxed">
            Cuéntanos sobre tu espacio y te enviamos una propuesta a medida. Te respondemos por WhatsApp en menos de 24
            horas.
          </p>
          <ul className="space-y-3 pt-2">
            {["Diagnóstico técnico gratuito", "Propuesta en 24h", "Sin compromiso de contratación"].map((text) => (
              <li key={text} className="flex items-center gap-3 text-sm text-ink">
                <CheckCircle size={17} className="text-wa-hover shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <VisitForm />
      </div>
    </section>
  );
}
