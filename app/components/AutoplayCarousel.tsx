"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { m, AnimatePresence } from "framer-motion";

interface AutoplayCarouselProps {
  title: string;
  subtitle?: string;
  children: ReactNode[];
  interval?: number;
}

export default function AutoplayCarousel({
  title,
  subtitle,
  children,
  interval = 4000,
}: AutoplayCarouselProps) {
  const [startIndex, setStartIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const items = Array.isArray(children) ? children : [children];
  const total = items.length;

  // Detectar vista móvil para mostrar 1 tarjeta en celular o 4 en escritorio
  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  const itemsPerPage = isMobile ? 1 : 4;

  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setStartIndex((prev) => (prev + 1 >= total ? 0 : prev + 1));
    }, interval);

    return () => clearInterval(timer);
  }, [total, interval, isPaused]);

  if (!items || total === 0) return null;

  const prev = () => setStartIndex((c) => (c === 0 ? total - 1 : c - 1));
  const next = () => setStartIndex((c) => (c + 1 >= total ? 0 : c + 1));

  // Generar las tarjetas visibles
  const visibleItems = Array.from({ length: Math.min(total, itemsPerPage) }, (_, idx) => {
    return items[(startIndex + idx) % total];
  });

  return (
    <div
      className="my-8 sm:my-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Encabezado */}
      <div className="mb-4 flex flex-col gap-3 px-1 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3
            className="text-2xl font-bold tracking-wide text-gold sm:text-2xl md:text-3xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {title}
          </h3>
          {subtitle && <p className="mt-1 text-[11px] text-white/50 sm:text-xs">{subtitle}</p>}
        </div>

        {total > 1 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={prev}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/60 text-sm text-gold transition-all hover:border-gold/40 hover:bg-gold/10"
              aria-label="Anterior"
            >
              ←
            </button>
            <span className="min-w-10 text-center text-[10px] text-white/40 font-mono sm:text-xs">
              {startIndex + 1} / {total}
            </span>
            <button
              type="button"
              onClick={next}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/60 text-sm text-gold transition-all hover:border-gold/40 hover:bg-gold/10"
              aria-label="Siguiente"
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* Contenedor del Carrusel (Swipe táctil en móvil) */}
      <div
        className="relative w-full overflow-hidden touch-pan-y"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (diff > 40) next();
          if (diff < -40) prev();
          touchStartX.current = null;
        }}
      >
        <AnimatePresence mode="wait">
          <m.div
            key={startIndex + (isMobile ? "-mob" : "-desk")}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`grid gap-3 sm:gap-5 ${isMobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`}
          >
            {visibleItems.map((item, idx) => (
              <div key={idx} className="h-full w-full">
                {item}
              </div>
            ))}
          </m.div>
        </AnimatePresence>
      </div>

      {/* Indicadores inferiores */}
      {total > 1 && (
        <div className="mt-4 flex justify-center gap-1.5 sm:mt-5">
          {items.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setStartIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                startIndex === idx ? "w-6 bg-gold" : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Ir a tarjeta ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}