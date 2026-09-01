"use client";

import { useState, useTransition } from "react";
import { m } from "framer-motion";
import { attendEvent, cancelAttendance } from "@/app/mi-cuenta/actions";

export interface ClassScheduleItem {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  capacity: number | null;
  registeredCount: number;
  isRegistered: boolean;
  categoryName: string | null;
  categoryColor: string | null;
}

export function ClassCard({ item }: { item: ClassScheduleItem }) {
  const [isPending, startTransition] = useTransition();
  const [registered, setRegistered] = useState(item.isRegistered);
  const [count, setCount] = useState(item.registeredCount);
  const [error, setError] = useState<string | null>(null);

  const startDate = new Date(item.start_time);
  const endDate = new Date(item.end_time);
  const isFull = item.capacity !== null && count >= item.capacity && !registered;
  const accentColor = item.categoryColor || "#D4AF37";

  const handleToggleAttendance = () => {
    setError(null);
    const nextState = !registered;
    setRegistered(nextState);
    setCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    startTransition(async () => {
      const result = nextState ? await attendEvent(item.id) : await cancelAttendance(item.id);

      if (result?.error) {
        setRegistered(!nextState);
        setCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
        setError(result.error);
      }
    });
  };

  return (
    <div className="bg-gradient-to-b from-white/10 via-black/40 to-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between h-full shadow-2xl hover:border-gold/40 transition-all duration-300 relative group overflow-hidden">
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"
        style={{ backgroundColor: accentColor }}
      />

      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border"
            style={{
              color: accentColor,
              borderColor: `${accentColor}40`,
              backgroundColor: `${accentColor}15`,
            }}
          >
            {item.categoryName || "Clase Especial"}
          </span>

          <span className="text-xs text-white/50 font-mono">
            {item.capacity ? `${count}/${item.capacity} cupos` : `${count} inscritas`}
          </span>
        </div>

        <h3
          className="text-xl font-bold text-white mb-3 line-clamp-1 group-hover:text-gold transition-colors"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {item.title}
        </h3>

        {item.description && (
          <p className="text-xs text-white/60 line-clamp-2 mb-4 leading-relaxed">{item.description}</p>
        )}

        <div className="space-y-2.5 py-4 border-t border-b border-white/10 text-xs">
          <div className="flex items-center gap-2.5 text-white/80">
            <span className="text-[#48CAE4]">📅</span>
            <span className="capitalize font-medium">
              {startDate.toLocaleDateString("es-CL", {
                weekday: "long",
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-white/80">
            <span className="text-[#E0218A]">⏰</span>
            <span className="font-mono">
              {startDate.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })} -{" "}
              {endDate.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-white/70">
            <span className="text-gold">📍</span>
            <span className="truncate">{item.location || "Estudio Particular Like a Shh"}</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {error && <p className="text-[11px] text-red-400 mb-2 font-mono">{error}</p>}

        {isFull ? (
          <button
            disabled
            className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-white/40 cursor-not-allowed"
          >
            Cupo Lleno
          </button>
        ) : (
          <m.button
            whileTap={{ scale: 0.98 }}
            onClick={handleToggleAttendance}
            disabled={isPending}
            className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-lg ${
              registered
                ? "bg-transparent border border-red-500/40 text-red-400 hover:bg-red-500/20 hover:border-red-500 shadow-red-500/10"
                : "bg-gold text-black hover:bg-gold-light shadow-gold/20 font-semibold"
            } disabled:opacity-50`}
          >
            {isPending ? "Procesando..." : registered ? "✕ Cancelar Asistencia" : "✓ Quiero Asistir"}
          </m.button>
        )}
      </div>
    </div>
  );
}
