"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const courses = [
  {
    id: 1,
    image: "/assets/courses/movilidad.jpeg",
    title: "Flexibiliza tu Actitud by Maximiliano Velásquez",
    description_1:
      `Curso diseñado para mejorar tu flexibilidad y bienestar corporal a través de videos guiados paso a paso.`,
    description_2:
      `Accede a rutinas específicas por grupos articulares y a ejercicios globales de movilidad, cuidadosamente estructurados para ayudarte a ganar mayor rango de movimiento, agilidad y control corporal.`,
    url: "https://hotmart.com/es/marketplace/productos/flexibiliza-tu-actitud-by-maximiliano-velasquez/A102579634L",
  },
  {
    id: 2,
    image: "/assets/logo/logo_likeashh.jpg",
    title: "Proximamente",
    description_1:
      "Exotic Pole Tricks",
    url: "#",
  },
  {
    id: 3,
    image: "/assets/logo/logo_likeashh.jpg",
    title: "Proximamente",
    description_1:
      "Exotic Pole Transicion",
    url: "#",
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
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Content */}
              <div className="p-5 md:p-6">
                <h3
                  className="text-xl font-bold text-gold mb-2 group-hover:text-gold transition-colors"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {course.title}
                </h3>
                <p
                  className="text-white/60 text-sm leading-relaxed mb-5 text-justify"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {course.description_1}
                </p>
                <p
                  className="text-white/60 text-sm leading-relaxed mb-5 text-justify"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {course.description_2}
                </p>
                <motion.a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full block text-center py-3 border border-gold text-black bg-gold text-sm font-semibold tracking-widest uppercase rounded-lg hover:bg-gold hover:text-black transition-all duration-300"
                  id={`ver-curso-btn-${course.id}`}
                >
                  Ver Curso
                </motion.a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Agendar Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="pt-10 mt-10 md:mt-14"
        >
          <motion.a
            href="#contacto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="w-full inline-flex items-center justify-center gap-3 px-10 py-4 bg-gold text-black font-bold text-sm tracking-widest uppercase rounded-full hover:bg-gold-light transition-colors duration-300 shadow-lg shadow-gold/20"
            id="agendar-clases-btn"
          >
            <svg
              className="w-10 h-10"
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
