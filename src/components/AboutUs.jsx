import { CheckCircle, Star, Shield } from "lucide-react";

// Copy genérico construido solo con hechos ya publicados en el sitio
// (badges de confianza del Hero, ubicación del JSON-LD). Revisar/
// personalizar con datos reales del negocio (fundación, certificaciones)
// antes de considerarlo contenido final.
export default function AboutUs() {
  const highlights = [
    { icon: <CheckCircle size={16} />, text: "+200 proyectos instalados" },
    { icon: <Star size={16} />, text: "4.9/5 de satisfacción" },
    { icon: <Shield size={16} />, text: "Garantía de 2 años" },
  ];

  return (
    <section id="nosotros" className="bg-slate-900 py-24 border-y border-slate-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">
          Quiénes somos
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">Sobre Falcons</h2>

        <p className="text-slate-400 leading-relaxed mb-5">
          Somos Falcons, una empresa peruana especializada en domótica y
          automatización de espacios residenciales y comerciales. Diseñamos e
          instalamos soluciones de iluminación, seguridad y climatización
          inteligente con dispositivos WiFi compatibles con Alexa y Google
          Home.
        </p>

        <p className="text-slate-400 leading-relaxed mb-10">
          Nuestro equipo de ingenieros acompaña cada proyecto de principio a
          fin: desde el diagnóstico técnico gratuito hasta la instalación,
          configuración y soporte post-venta. Operamos desde Santiago de
          Surco, Lima.
        </p>

        <div className="flex flex-wrap justify-center gap-6">
          {highlights.map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-sm text-slate-300">
              <span className="text-emerald-500">{icon}</span>
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
