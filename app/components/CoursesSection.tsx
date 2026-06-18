"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const courses = [
  {
    id: 1,
    title: "Pole Dance Básico",
    description:
      "Aprende las bases del pole dance: giros, figuras y transiciones. Ideal para principiantes sin experiencia previa.",
    level: "Principiante",
  },
  {
    id: 2,
    title: "Exotic Flow",
    description:
      "Desarrolla tu expresión corporal y fluidez con coreografías sensuales y elegantes en tacones.",
    level: "Intermedio",
  },
  {
    id: 3,
    title: "Flexibilidad & Contorsión",
    description:
      "Programa completo de flexibilidad con clases grabadas para mejorar tu rango de movimiento de forma segura.",
    level: "Todos los niveles",
  },
  {
    id: 4,
    title: "Pole Intermedio",
    description:
      "Perfecciona tu técnica con combos avanzados, inversiones y transiciones fluidas en la barra.",
    level: "Intermedio",
  },
  {
    id: 5,
    title: "Exotic Heels",
    description:
      "Domina el arte de bailar en tacones con rutinas de alto impacto visual y expresión artística.",
    level: "Intermedio",
  },
  {
    id: 6,
    title: "Acondicionamiento Corporal",
    description:
      "Fortalece tu cuerpo con ejercicios específicos para pole dance: fuerza, resistencia y control.",
    level: "Todos los niveles",
  },
];

export default function CoursesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="cursos"
      className="py-16 md:py-24 section-spacing"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gold gold-underline"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Nuestros Cursos Online
          </h2>
          <p
            className="text-white/60 mt-8 text-lg max-w-2xl mx-auto"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Accede a nuestro catálogo de cursos y transforma tu cuerpo y mente desde
            cualquier lugar del mundo.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="card-gold overflow-hidden group"
              id={`course-card-${course.id}`}
            >
              {/* Image placeholder */}
              <div className="aspect-video bg-gradient-to-br from-dark-card via-black to-dark-card relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                    <svg
                      className="w-8 h-8 text-gold/50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                {/* Level badge */}
                <span className="absolute top-3 right-3 px-3 py-1 bg-black/80 text-gold text-xs tracking-wider uppercase rounded-full border border-gold/20">
                  {course.level}
                </span>
              </div>

              {/* Content */}
              <div className="p-5 md:p-6">
                <h3
                  className="text-xl font-bold text-white mb-2 group-hover:text-gold transition-colors"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {course.title}
                </h3>
                <p
                  className="text-white/60 text-sm leading-relaxed mb-5"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {course.description}
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 border border-gold text-gold text-sm font-semibold tracking-widest uppercase rounded-lg hover:bg-gold hover:text-black transition-all duration-300"
                  id={`ver-curso-btn-${course.id}`}
                >
                  Ver Curso
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Agendar Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-10 md:mt-14"
        >
          <motion.a
            href="#contacto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 px-10 py-4 bg-gold text-black font-bold text-sm tracking-widest uppercase rounded-full hover:bg-gold-light transition-colors duration-300 shadow-lg shadow-gold/20"
            id="agendar-clases-btn"
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Agendar Clases Online
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
