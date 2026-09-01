"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ClassCard, ClassScheduleItem } from "./ClassCard";

export default function ClassesCarousel({
  title = "Clases y Workshops Disponibles",
  subtitle = "Selecciona tus próximas sesiones con el profesor",
  items,
}: {
  title?: string;
  subtitle?: string;
  items: ClassScheduleItem[];
}) {
  const [page, setPage] = useState(0);

  if (!items || items.length === 0) {
    return (
      <div className="my-8 p-8 bg-white/5 border border-white/10 rounded-3xl text-center backdrop-blur-xl">
        <p className="text-sm text-white/50">No hay clases o workshops programados para los próximos días.</p>
      </div>
    );
  }

  const itemsPerPage = 3;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const displayedItems = items.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const prev = () => setPage((p) => (p === 0 ? totalPages - 1 : p - 1));
  const next = () => setPage((p) => (p + 1 >= totalPages ? 0 : p + 1));

  return (
    <div className="my-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2
            className="text-2xl sm:text-3xl font-bold text-white tracking-wide"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {title}
          </h2>
          <p className="text-xs text-white/50 mt-1">{subtitle}</p>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="p-2.5 bg-black/60 border border-white/10 rounded-full text-gold hover:bg-gold/20 hover:border-gold/40 transition-all cursor-pointer text-xs"
              aria-label="Anterior"
            >
              ←
            </button>
            <span className="text-xs text-white/40 font-mono px-2">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={next}
              className="p-2.5 bg-black/60 border border-white/10 rounded-full text-gold hover:bg-gold/20 hover:border-gold/40 transition-all cursor-pointer text-xs"
              aria-label="Siguiente"
            >
              →
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <m.div
          key={page}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
        >
          {displayedItems.map((clase) => (
            <ClassCard key={clase.id} item={clase} />
          ))}
        </m.div>
      </AnimatePresence>
    </div>
  );
}
