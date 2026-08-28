"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";

type ClaseHistorial = {
  attendanceId: string;
  title: string;
  start_time: string;
  location: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  status: string;
};

export default function ClasesTomadasCarousel({ clases }: { clases: ClaseHistorial[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (clases.length === 0) {
    return (
      <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl text-center backdrop-blur-xl">
        <p className="text-sm text-white/50">Aún no registras clases completadas o pasadas.</p>
      </div>
    );
  }

  const itemsPerPage = 2;
  const totalPages = Math.ceil(clases.length / itemsPerPage);
  const displayedClases = clases.slice(currentIndex * itemsPerPage, (currentIndex + 1) * itemsPerPage);

  const next = () => setCurrentIndex((prev) => (prev + 1 >= totalPages ? 0 : prev + 1));
  const prev = () => setCurrentIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1));

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-serif)" }}>
            Historial de Clases Tomadas
          </h2>
          <p className="text-xs text-white/50 mt-0.5">Sesiones y workshops completados</p>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="p-2 bg-black/60 border border-white/10 rounded-full text-gold hover:bg-gold/20 transition-all text-xs"
            >
              ←
            </button>
            <span className="text-xs text-white/40 font-mono">
              {currentIndex + 1} / {totalPages}
            </span>
            <button
              onClick={next}
              className="p-2 bg-black/60 border border-white/10 rounded-full text-gold hover:bg-gold/20 transition-all text-xs"
            >
              →
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <m.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {displayedClases.map((clase) => (
            <div
              key={clase.attendanceId}
              className="p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col justify-between hover:border-gold/30 transition-all shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                    style={{
                      color: clase.categoryColor || "#D4AF37",
                      borderColor: `${clase.categoryColor || "#D4AF37"}40`,
                      backgroundColor: `${clase.categoryColor || "#D4AF37"}10`,
                    }}
                  >
                    {clase.categoryName || "Clase"}
                  </span>
                  <span className="text-[11px] text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                    Completada
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white mb-1 line-clamp-1">{clase.title}</h3>
                <p className="text-xs text-white/60">
                  {new Date(clase.start_time).toLocaleDateString("es-CL", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {clase.location && (
                <div className="mt-4 pt-3 border-t border-white/10 text-xs text-white/40 flex items-center gap-1.5">
                  <span>📍</span>
                  <span className="truncate">{clase.location}</span>
                </div>
              )}
            </div>
          ))}
        </m.div>
      </AnimatePresence>
    </div>
  );
}