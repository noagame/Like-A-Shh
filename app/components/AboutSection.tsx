"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";

const instructorImages = [
  { id: 1, alt: "Maximiliano en sesión de pole" },
  { id: 2, alt: "Workshop presencial" },
  { id: 3, alt: "Competencia de exotic" },
  { id: 4, alt: "Clase grupal" },
];

export default function AboutSection() {
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const isInView1 = useInView(ref1, { once: true, margin: "-100px" });
  const isInView2 = useInView(ref2, { once: true, margin: "-100px" });
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <section className="py-16 md:py-24 section-spacing">
      {/* Sobre Nosotros */}
      <div
        ref={ref1}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 md:mb-24"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView1 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-gold mb-6 gold-underline"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Sobre Nosotros
            </h2>
            <div className="mt-10 space-y-4">
              <p
                className="text-white/80 leading-relaxed text-base sm:text-lg"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                En <strong className="text-gold">Like a SHH</strong> creemos que el
                movimiento es una forma de expresión, libertad y empoderamiento. Somos
                una academia especializada en pole dance, danza exotic y bienestar
                corporal, donde cada persona encuentra su propio ritmo y fuerza interior.
              </p>
              <p
                className="text-white/60 leading-relaxed text-base sm:text-lg"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Nuestra misión es crear un espacio seguro e inclusivo donde la danza se
                convierte en una herramienta de transformación personal. Con más de 5
                años de trayectoria, hemos acompañado a cientos de alumnos en su viaje
                hacia la confianza y el autoconocimiento a través del arte del movimiento.
              </p>
              <p
                className="text-white/60 leading-relaxed text-base sm:text-lg"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Ofrecemos clases presenciales, cursos online y eventos exclusivos que
                celebran la sensualidad, la fuerza y la disciplina artística.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView1 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-gold/20 bg-dark-card">
              <div className="w-full h-full bg-gradient-to-br from-dark-card to-black flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gold/40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gold/40 text-sm tracking-wider uppercase">
                    Foto del equipo
                  </p>
                </div>
              </div>
            </div>
            {/* Decorative gold corner */}
            <div className="absolute -top-3 -right-3 w-16 h-16 border-t-2 border-r-2 border-gold/30 rounded-tr-2xl" />
            <div className="absolute -bottom-3 -left-3 w-16 h-16 border-b-2 border-l-2 border-gold/30 rounded-bl-2xl" />
          </motion.div>
        </div>
      </div>

      {/* Instructor */}
      <div
        ref={ref2}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Carousel */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView2 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-gold/20 bg-dark-card">
              <div className="w-full h-full bg-gradient-to-br from-dark-card to-black flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gold/40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <p className="text-gold/40 text-sm tracking-wider uppercase">
                    {instructorImages[currentSlide].alt}
                  </p>
                </div>
              </div>
            </div>

            {/* Carousel controls */}
            <div className="flex items-center justify-center gap-3 mt-4">
              {instructorImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`carousel-dot ${idx === currentSlide ? "active" : ""}`}
                  aria-label={`Slide ${idx + 1}`}
                  id={`instructor-carousel-dot-${idx}`}
                />
              ))}
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView2 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-gold mb-6 gold-underline"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Maximiliano Velásquez
            </h2>
            <div className="mt-10 space-y-4">
              <p
                className="text-white/80 leading-relaxed text-base sm:text-lg"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Instructor certificado y fundador de{" "}
                <strong className="text-gold">Like a SHH</strong>. Con más de 5 años
                de experiencia en pole dance y danza exotic, Maximiliano ha dedicado su
                carrera a transformar vidas a través del movimiento.
              </p>
              <p
                className="text-white/60 leading-relaxed text-base sm:text-lg"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Su enfoque único combina técnica, expresión artística y bienestar
                corporal, creando una experiencia de aprendizaje que va más allá de la
                danza. Ha organizado múltiples eventos y workshops a nivel nacional,
                incluyendo las famosas &quot;Noches de Exotic&quot; que se han convertido en
                referente del circuito artístico.
              </p>
              <p
                className="text-white/60 leading-relaxed text-base sm:text-lg"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Apasionado por la enseñanza y el empoderamiento, Maximiliano trabaja
                incansablemente para hacer que el arte del pole dance sea accesible para
                todos, sin importar su nivel de experiencia.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
