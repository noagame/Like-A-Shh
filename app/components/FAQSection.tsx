"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const faqData = [
  {
    id: 1,
    question: "¿Qué formas de pago tenemos?",
    answer:
      `Nuestros cursos se gestionan a través de la plataforma Hotmart. Desde la misma te llevará a opciones de pago (tarjeta de crédito o debido).`,
    moreInfo: "Tu suscripción dura un mes a partir de la compra.",
  },
  {
    id: 2,
    question: "¿Cómo acceder a nuestros cursos?",
    answer:
      "Al ingresar a un curso te redireccionará a nuestra plataforma Hotmart donde podrás comprar nuestros cursos Online.",
  },
  {
    id: 3,
    question: "¿Qué modalidad son las clases?",
    answer: [
      "Cursos Online: Clases pregabadas",
      "Clases Particulares Online: Clases sincrónicas uno a uno. 1 hora",
      "Clases Particulares Presenciales: Organiza tus horarios de manera flexible y entrena presencial. 1 hora."
    ],
    moreInfo: "Valores sujetos a planes mensuales."
  },
  {
    id: 4,
    question: "¿Qué tipo de clases particulares puedo agendar ?",
    answer: [
      "Exotic Pole",
      "Pole Sport",
      "Flexibilidad",
      "Chair Dance",
      "Fortalecimiento Musuclar",
      "Floorwork"
    ],
    moreInfo: ""
  },
  {
    id: 5,
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
                    {Array.isArray(faq.answer) ? (
                      <ul>
                        {faq.answer.map((item, index) => (
                          <li key={index}>
                            • {item}
                            <br />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>{faq.answer}</p>
                    )}
                    {faq.moreInfo && (
                      <>
                        <br />
                        <p>{faq.moreInfo}</p>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section >
  );
}
