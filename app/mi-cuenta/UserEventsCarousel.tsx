"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import AttendButton from "./explorar/AttendButton"; // Asegúrate de ajustar la ruta según tu estructura

type EventWithCategory = {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  capacity: number | null;
  categories: { name: string; color: string | null } | null;
};

export default function UserEventsCarousel({ 
  events, 
  userAttendances, 
  attendanceCounts 
}: { 
  events: EventWithCategory[];
  userAttendances: Set<string>;
  attendanceCounts: Record<string, number>;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!events || events.length === 0) return null;

  const next = () => setCurrentIndex((prev) => (prev + 1 >= events.length ? 0 : prev + 1));
  const prev = () => setCurrentIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1));

  const currentEvent = events[currentIndex];
  const yaInscrito = userAttendances.has(currentEvent.id);
  const totalReg = attendanceCounts[currentEvent.id] || 0;
  const cupoLleno = currentEvent.capacity ? totalReg >= currentEvent.capacity : false;

  return (
    <div className="relative w-full max-w-3xl mx-auto my-8 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs uppercase tracking-widest text-gold font-bold">
          {currentEvent.categories?.name || "Clase Exclusiva"}
        </span>
        <span className="text-xs text-white/50">
          {currentIndex + 1} de {events.length}
        </span>
      </div>

      <div className="overflow-hidden min-h-[160px]">
        <AnimatePresence mode="wait">
          <m.div
            key={currentEvent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-3"
          >
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-serif)" }}>
              {currentEvent.title}
            </h3>
            <p className="text-sm text-white/70 line-clamp-2">
              {currentEvent.description || "Sin descripción detallada para esta sesión."}
            </p>
            <div className="text-xs text-gold/80 flex gap-4 mt-2">
              <span>📅 {new Date(currentEvent.start_time).toLocaleDateString("es-CL", { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
              {currentEvent.location && <span>📍 {currentEvent.location}</span>}
            </div>
          </m.div>
        </AnimatePresence>
      </div>

      {/* Controles y Botón de Inscripción */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
        <div className="flex gap-2">
          <button 
            onClick={prev}
            className="p-2 bg-black/50 border border-white/10 rounded-full text-gold hover:bg-gold/20 transition-all"
          >
            ←
          </button>
          <button 
            onClick={next}
            className="p-2 bg-black/50 border border-white/10 rounded-full text-gold hover:bg-gold/20 transition-all"
          >
            →
          </button>
        </div>

        <div className="w-48">
          <AttendButton 
            eventId={currentEvent.id} 
            yaInscrito={yaInscrito} 
            cupoLleno={cupoLleno} 
          />
        </div>
      </div>
    </div>
  );
}