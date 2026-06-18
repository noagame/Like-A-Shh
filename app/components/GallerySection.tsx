"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

interface GalleryCarouselProps {
  title: string;
  images: string[];
  id: string;
}

function GalleryCarousel({ title, images, id }: GalleryCarouselProps) {
  const [current, setCurrent] = useState(0);

  const hasImages = images && images.length > 0;
  const itemCount = hasImages ? images.length : 0;

  const prev = () => setCurrent((c) => (c === 0 ? itemCount - 1 : c - 1));
  const next = () => setCurrent((c) => (c === itemCount - 1 ? 0 : c + 1));

  const visibleIndices = hasImages ? [
    current,
    (current + 1) % itemCount,
    (current + 2) % itemCount,
  ]
    : [];

  return (
    <div className="mb-16 md:mb-24" id={id}>
      <h3
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-gold  text-center pb-6"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {title}
      </h3>
      {/* Contenedor Principal (px-12 deja espacio para las flechas laterales) */}
      <div className="relative max-w-[90rem] mx-auto px-12 md:px-16 lg:px-20">

        {hasImages ? (
          /* Grid que muestra 1 columna en móvil y 3 en pantallas medianas/grandes */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {visibleIndices.map((index, i) => (
              <motion.div
                key={`${id}-img-${current}-${i}`} // La key dinámica fuerza la animación al cambiar
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                // En móvil ocultamos la 2da y 3ra foto (i > 0). En desktop se ven las 3.
                // aspect-[4/5] fuerza a todas las tarjetas a tener la misma altura/proporción
                className={`relative aspect-[4/5] rounded-2xl overflow-hidden border border-gold/20 bg-dark-card shadow-lg shadow-gold/5 ${i > 0 ? "hidden md:block" : "block"
                  }`}
              >
                <img
                  src={images[index]}
                  alt={`${title} - Imagen ${index + 1}`}
                  // object-cover es lo que soluciona las dimensiones distintas sin deformarlas
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </motion.div>
            ))}
          </div>
        ) : (
          /* Placeholder por si el arreglo de fotos está vacío */
          <div className="aspect-video rounded-[2rem] border border-gold/20 bg-dark-card flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gold/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-gold/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gold/40 text-sm tracking-wider uppercase">
                Agrega rutas válidas en el arreglo
              </p>
            </div>
          </div>
        )}

        {/* Controles: Solo mostramos flechas si hay más de 3 fotos para que tenga sentido rotar */}
        {itemCount > 3 && (
          <>
            <button
              onClick={prev}
              // absolute left-0 las saca del grid para que floten a los costados
              className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-black/80 backdrop-blur-md border border-gold/40 rounded-full flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all shadow-xl z-10"
              aria-label="Anterior"
            >
              <svg className="w-5 h-5 md:w-7 md:h-7 pr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-black/80 backdrop-blur-md border border-gold/40 rounded-full flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all shadow-xl z-10"
              aria-label="Siguiente"
            >
              <svg className="w-5 h-5 md:w-7 md:h-7 pl-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Puntos de navegación (Dots) */}
            <div className="flex items-center justify-center gap-2 md:gap-3 mt-8 md:mt-12">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`carousel-dot transition-all duration-300 ${idx === current ? "active bg-[#D4AF37] w-8 md:w-10 rounded-md" : "bg-[#D4AF37]/30"
                    }`}
                  aria-label={`Ir a la imagen ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function GallerySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // 2. AQUÍ DEFINES TUS LISTAS DE IMÁGENES
  // Reemplaza estas rutas de ejemplo con las ubicaciones reales de tus fotos en la carpeta public/assets/...

  const workshopImages = [
    "/assets/workshop/Galeria 1/work_1.jpg",
    "/assets/workshop/Galeria 1/work_2.jpg",
    "/assets/workshop/Galeria 1/work_3.jpg",
    "/assets/workshop/Galeria 1/work_4.jpg",
    "/assets/workshop/Galeria 1/work_5.jpg",
    "/assets/workshop/Galeria 1/work_6.png",
    "/assets/workshop/Galeria 1/work_7.jpeg",
    "/assets/workshop/Galeria 1/work_8.jpeg",
    "/assets/workshop/Galeria 1/work_9.jpeg",
    "/assets/workshop/Galeria 1/work_10.jpeg",
    "/assets/workshop/Galeria 1/work_11.jpeg",
    "/assets/workshop/Galeria 1/work_12.jpeg",
  ];

  const mystiqueImages = [
    "/assets/X_Mystique/Galeria_Like_a_Shh_1.jpeg",
    "/assets/X_Mystique/Galeria_Like_a_Shh_2.jpeg",
    "/assets/X_Mystique/Galeria_Like_a_Shh_3.jpeg",
    "/assets/X_Mystique/Galeria_Like_a_Shh_4.jpeg",
    "/assets/X_Mystique/Galeria_Like_a_Shh_5.jpeg",
    "/assets/X_Mystique/Galeria_Like_a_Shh_6.jpeg",
    // Agrega más separadas por comas
  ];

  const bunnysSeasonImages = [
    "/assets/Vol4/foto1.jpeg",
    "/assets/Vol4/foto2.jpeg",
    "/assets/Vol4/foto3.jpeg",
    "/assets/Vol4/foto4.jpeg",
    "/assets/Vol4/foto5.jpeg",
    "/assets/Vol4/foto6.jpeg",
  ];

  return (
    <section
      id="galeria"
      className="py-16 md:py-24 section-spacing"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Título Principal Centrado */}
          <div className="w-full flex justify-center mb-16 md:mb-24">
            <h2
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-gold text-center gold-underline leading-[1.2]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Galerías &amp; Workshops
            </h2>
          </div>

          {/* 3. PASAMOS LOS ARREGLOS AL COMPONENTE */}
          <GalleryCarousel
            title="Sesiones De Workshop"
            images={workshopImages}
            id="gallery-workshops"
          />

          <GalleryCarousel
            title="X Mystique - Castro, Chiloé"
            images={mystiqueImages}
            id="gallery-mystique"
          />

          <GalleryCarousel
            title="Vol.4 - Bunny's Season"
            images={bunnysSeasonImages}
            id="gallery-bunnys"
          />
        </motion.div>
      </div>
    </section>
  );
}
