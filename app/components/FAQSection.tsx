"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const faqData = [
  {
    id: 1,
    question: "¿Qué formas de pago tenemos?",
    answer:
      "Aceptamos múltiples formas de pago para tu comodidad: tarjetas de crédito y débito (Visa, Mastercard, American Express), transferencias bancarias nacionales, y pagos a través de plataformas digitales. Si necesitas un método de pago alternativo, no dudes en contactarnos y encontraremos la mejor solución para ti.",
  },
  {
    id: 2,
    question: "¿Cómo acceder a nuestros cursos?",
    answer:
      "Una vez realizado el pago, recibirás un enlace de acceso directamente en tu correo electrónico registrado. Este link te dará acceso inmediato a la plataforma de cursos donde podrás ver todo el contenido disponible. Revisa tu bandeja de entrada y carpeta de spam por si acaso.",
  },
  {
    id: 3,
    question: "¿Qué modalidad son las clases?",
    answer:
      "Curso de Flexibilidad: clases grabadas que puedes ver a tu ritmo, las veces que quieras. Clases online: sesiones uno a uno en vivo, personalizadas según tu nivel y objetivos. Online presencial: clases grupales en tiempo real con interacción directa con el instructor.",
  },
  {
    id: 4,
    question: "¿Cuánto tiempo dura mi membresía?",
    answer:
      "La membresía tiene una duración de 1 mes desde la fecha de activación. Durante ese período tendrás acceso completo a todo el contenido incluido en tu plan. Al finalizar el mes, podrás renovar tu suscripción para continuar disfrutando de las clases.",
  },
];

export default function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="py-16 md:py-24 section-spacing" ref={ref}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gold gold-underline"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Preguntas Frecuentes
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqData.map((faq, i) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card-gold overflow-hidden"
              id={`faq-item-${faq.id}`}
            >
              <button
                onClick={() => toggle(faq.id)}
                className="w-full flex items-center justify-between p-5 md:p-6 text-left group"
                aria-expanded={openId === faq.id}
                id={`faq-toggle-${faq.id}`}
              >
                <span
                  className="text-white font-semibold text-base sm:text-lg pr-4 group-hover:text-gold transition-colors"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {faq.question}
                </span>
                <motion.span
                  animate={{ rotate: openId === faq.id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 text-gold"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </motion.span>
              </button>

              <div
                className={`accordion-content ${openId === faq.id ? "open" : ""}`}
              >
                <div className="px-5 pb-5 md:px-6 md:pb-6">
                  <div className="w-full h-px bg-gold/10 mb-4" />
                  <p
                    className="text-white/70 leading-relaxed"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {faq.answer}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
