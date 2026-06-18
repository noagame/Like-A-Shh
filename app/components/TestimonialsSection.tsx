"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const testimonials = [
  {
    id: 1,
    name: "Valentina R.",
    text: "Las clases con Maxi cambiaron mi vida. Encontré una forma de expresarme que nunca imaginé. La confianza que gané en mí misma es invaluable.",
  },
  {
    id: 2,
    name: "Carolina M.",
    text: "El ambiente es increíble, cero juicio y mucho apoyo. Los cursos online son súper completos y puedo practicar a mi ritmo. ¡Totalmente recomendado!",
  },
  {
    id: 3,
    name: "Francisca L.",
    text: "Empecé sin saber nada de pole y hoy me siento más fuerte que nunca. La comunidad Like a SHH es como una familia. Las noches de exotic son mágicas.",
  },
  {
    id: 4,
    name: "Daniela S.",
    text: "El curso de flexibilidad me ayudó enormemente con mi postura y bienestar. Max es un instructor excepcional que realmente se preocupa por sus alumnos.",
  },
];

export default function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-16 md:py-24 section-spacing" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Testimonios
          </h2>
          <p
            className="text-white/60 mt-8 text-lg max-w-2xl mx-auto"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Lo que dicen nuestras alumnas sobre su experiencia en Like a SHH
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="card-gold p-6 text-center"
              id={`testimonial-card-${testimonial.id}`}
            >
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-3">
                {[...Array(5)].map((_, idx) => (
                  <svg
                    key={idx}
                    className="w-4 h-4 text-gold"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p
                className="text-white/70 text-sm leading-relaxed italic mb-4"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                &ldquo;{testimonial.text}&rdquo;
              </p>

              <p
                className="text-gold text-sm font-semibold tracking-wider"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {testimonial.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
