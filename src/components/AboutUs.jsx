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
    <section id="nosotros" className="py-16 lg:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-semibold tracking-wider uppercase text-brand mb-2">
          Quiénes somos
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight mb-6">Sobre Falcons</h2>

        <p className="text-muted leading-relaxed mb-5">
          Somos Falcons, una empresa peruana especializada en domótica y
          automatización de espacios residenciales y comerciales. Diseñamos e
          instalamos soluciones de iluminación, seguridad y climatización
          inteligente con dispositivos WiFi compatibles con Alexa y Google
          Home.
        </p>

        <p className="text-muted leading-relaxed mb-10">
          Nuestro equipo de ingenieros acompaña cada proyecto de principio a
          fin: desde el diagnóstico técnico gratuito hasta la instalación,
          configuración y soporte post-venta. Operamos desde Santiago de
          Surco, Lima.
        </p>

        <div className="flex flex-wrap justify-center gap-6">
          {highlights.map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-sm text-ink">
              <span className="text-wa-hover">{icon}</span>
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
