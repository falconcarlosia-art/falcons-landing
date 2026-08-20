import { Helmet } from "react-helmet-async";
import { ChevronDown } from "lucide-react";

// Única fuente de verdad para el texto visible y el JSON-LD FAQPage — deben
// coincidir 1:1 (schema.org exige paridad entre contenido visible y datos
// estructurados).
const FAQS = [
  {
    q: "¿Cómo es el proceso de instalación?",
    a: "Empezamos con un diagnóstico técnico gratuito de tu espacio, te enviamos una propuesta personalizada en menos de 24 horas y, una vez aprobada, nuestro equipo de ingenieros realiza la instalación y configuración completa de tus dispositivos WiFi.",
  },
  {
    q: "¿Qué garantía tienen los productos y servicios?",
    a: "Todos nuestros productos y servicios de instalación cuentan con 2 años de garantía, cubriendo defectos de fabricación y fallas en la configuración realizada por nuestro equipo.",
  },
  {
    q: "¿Los dispositivos son compatibles con Alexa y Google Home?",
    a: "Sí. Todos nuestros interruptores, paneles táctiles, sensores y accesorios son compatibles con Alexa y Google Home, además de las apps Tuya Smart y eWeLink.",
  },
  {
    q: "¿Cuánto demora en llegar mi cotización?",
    a: "Nuestro equipo te contacta con una propuesta técnica a medida en menos de 24 horas después de enviar tu solicitud, sin costo y sin compromiso de contratación.",
  },
  {
    q: "¿En qué zonas de Perú brindan servicio de instalación?",
    a: "Actualmente brindamos instalación y soporte técnico en Lima Metropolitana, con base de operaciones en Santiago de Surco. Escríbenos por WhatsApp para confirmar cobertura en tu distrito.",
  },
  {
    q: "¿Necesito internet o un hub especial para usar los dispositivos?",
    a: "Solo necesitas una red WiFi estable en tu hogar o negocio. Nuestros dispositivos se conectan directamente a tu router.",
  },
  {
    q: "¿Puedo automatizar solo una habitación o debo instalar todo el sistema completo?",
    a: "Puedes empezar con un solo dispositivo e ir ampliando tu sistema poco a poco. Nuestras soluciones son modulares y se adaptan a tu presupuesto y necesidades.",
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function Faq() {
  return (
    <section id="faq" className="bg-slate-950 py-24">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(FAQ_JSON_LD)}</script>
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3">
            Dudas frecuentes
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Preguntas frecuentes</h2>
        </div>

        <div className="space-y-3">
          {FAQS.map(({ q, a }) => (
            <details
              key={q}
              className="group bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4"
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-white font-semibold text-sm sm:text-base">
                {q}
                <ChevronDown
                  size={18}
                  className="flex-shrink-0 text-slate-500 transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <p className="text-slate-400 text-sm leading-relaxed mt-3">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
