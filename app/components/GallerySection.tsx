"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

interface GalleryCarouselProps {
  title: string;
  itemCount: number;
  id: string;
}

function GalleryCarousel({ title, itemCount, id }: GalleryCarouselProps) {
  const [current, setCurrent] = useState(0);
  const items = Array.from({ length: itemCount }, (_, i) => i);

  const prev = () => setCurrent((c) => (c === 0 ? itemCount - 1 : c - 1));
  const next = () => setCurrent((c) => (c === itemCount - 1 ? 0 : c + 1));

  return (
    <div className="mb-12 md:mb-16" id={id}>
      <h3
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-gold mb-6 md:mb-8 text-center gold-underline"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {title}
      </h3>

      <div className="relative max-w-4xl mx-auto">
        {/* Main image */}
        <div className="aspect-video rounded-2xl overflow-hidden border border-gold/20 bg-dark-card relative">
          <div className="w-full h-full bg-gradient-to-br from-dark-card to-black flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gold/10 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-gold/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-gold/40 text-sm tracking-wider uppercase">
                Imagen {current + 1} de {itemCount}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/70 border border-gold/30 rounded-full flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all"
          aria-label="Anterior"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/70 border border-gold/30 rounded-full flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all"
          aria-label="Siguiente"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`carousel-dot ${idx === current ? "active" : ""}`}
              aria-label={`Imagen ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GallerySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gold text-center mb-12 md:mb-16 gold-underline"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Galerías &amp; Workshops
          </h2>

          <GalleryCarousel
            title="Sesiones De Workshop"
            itemCount={5}
            id="gallery-workshops"
          />

          <GalleryCarousel
            title="X Mystique - Castro, Chiloé"
            itemCount={4}
            id="gallery-mystique"
          />

          <GalleryCarousel
            title="Vol.4 - Bunny's Season"
            itemCount={4}
            id="gallery-bunnys"
          />
        </motion.div>
      </div>
    </section>
  );
}
