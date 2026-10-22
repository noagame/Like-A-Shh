"use client";

import { Children, useState, useEffect, useRef, ReactNode } from "react";
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
  const [pageIndex, setPageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const touchStartX = useRef<number | null>(null);

  const items = Children.toArray(children);
  const total = items.length;
  const pageCount = Math.ceil(total / itemsPerPage);
  const currentPage = Math.min(pageIndex, Math.max(0, pageCount - 1));
  const hasMorePages = pageCount > 1;

  // La cantidad de tarjetas por página coincide con las columnas del diseño.
  useEffect(() => {
    const checkViewport = () => {
      setItemsPerPage(window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 4);
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  useEffect(() => {
    if (!hasMorePages || isPaused) return;

    const timer = setInterval(() => {
      setPageIndex((prev) => (Math.min(prev, pageCount - 1) + 1) % pageCount);
    }, interval);

    return () => clearInterval(timer);
  }, [pageCount, hasMorePages, interval, isPaused]);

  if (total === 0) return null;

  const prev = () => setPageIndex((currentPage - 1 + pageCount) % pageCount);
  const next = () => setPageIndex((currentPage + 1) % pageCount);

  // Cada tarjeta pertenece a una sola página; la última no se rellena repitiendo clases.
  const visibleItems = items.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

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

        {hasMorePages && (
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
              {currentPage + 1} / {pageCount}
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
          if (hasMorePages && diff > 40) next();
          if (hasMorePages && diff < -40) prev();
          touchStartX.current = null;
        }}
      >
        <AnimatePresence mode="wait">
          <m.div
            key={`${currentPage}-${itemsPerPage}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4"
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
      {hasMorePages && (
        <div className="mt-4 flex justify-center gap-1.5 sm:mt-5">
          {Array.from({ length: pageCount }, (_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setPageIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentPage === idx ? "w-6 bg-gold" : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Ir a página ${idx + 1}`}
              aria-current={currentPage === idx ? "page" : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
