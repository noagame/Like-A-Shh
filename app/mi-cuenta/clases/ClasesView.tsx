"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { cancelAttendance } from "@/app/mi-cuenta/actions";

// QA ARQUITECTURA: Importamos dinámicamente NUESTRO wrapper, 
// aislando por completo las clases de FullCalendar del servidor de Next.js
const CalendarDynamic = dynamic(() => import("./CalendarWrapper"), {
  ssr: false,
  loading: () => <div className="p-10 text-center text-white/50 animate-pulse">Cargando calendario...</div>
});

type Clase = {
  attendanceId: string;
  eventId: string;
  title: string;
  start: string;
  end: string;
  location: string | null;
  categoryName: string | null;
  categoryColor: string | null;
};

function formatFecha(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-CL", {
    timeZone: "America/Santiago",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ClasesView({ clases }: { clases: Clase[] }) {
  const [vista, setVista] = useState<"tabla" | "calendario">("tabla");
  const [seleccionada, setSeleccionada] = useState<Clase | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCancelar(eventId: string) {
    setError(null);
    startTransition(async () => {
      const result = await cancelAttendance(eventId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div>
      {/* --- Encabezado y Controles (Igual que antes) --- */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
            Mis clases
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {clases.length} {clases.length === 1 ? "clase activa" : "clases activas"}
          </p>
        </div>

        <div className="flex gap-2 p-1 rounded-full border border-white/10 w-fit bg-neutral-900/50">
          <button
            onClick={() => setVista("tabla")}
            className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wide transition-colors ${vista === "tabla" ? "bg-gold text-black font-semibold" : "text-white/60 hover:text-white"
              }`}
          >
            Tabla
          </button>
          <button
            onClick={() => setVista("calendario")}
            className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wide transition-colors ${vista === "calendario" ? "bg-gold text-black font-semibold" : "text-white/60 hover:text-white"
              }`}
          >
            Calendario
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {/* --- Vistas --- */}
      {vista === "tabla" ? (
        clases.length === 0 ? (
          <div className="card-gold p-10 text-center text-white/50 rounded-2xl border border-white/10">
            No tienes clases activas. Ve a{" "}
            <a href="/mi-cuenta/explorar" className="text-gold hover:underline font-medium">
              Explorar
            </a>{" "}
            para inscribirte en una.
          </div>
        ) : (
          <div className="card-gold overflow-x-auto rounded-2xl border border-white/10 bg-neutral-900/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/50 uppercase text-xs tracking-wide">
                  <th className="text-left px-4 py-4 font-semibold">Actividad</th>
                  <th className="text-left px-4 py-4 font-semibold">Categoría</th>
                  <th className="text-left px-4 py-4 font-semibold">Fecha</th>
                  <th className="text-left px-4 py-4 font-semibold">Ubicación</th>
                  <th className="text-left px-4 py-4 font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody>
                {clases.map((clase) => (
                  <tr key={clase.attendanceId} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4 text-white font-medium">{clase.title}</td>
                    <td className="px-4 py-4">
                      {clase.categoryName ? (
                        <span
                          className="px-2 py-1 rounded-full text-xs"
                          style={{
                            color: clase.categoryColor ?? "#D4AF37",
                            backgroundColor: `${clase.categoryColor ?? "#D4AF37"}1A`,
                          }}
                        >
                          {clase.categoryName}
                        </span>
                      ) : (
                        <span>---</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/70">{formatFecha(clase.start)}</td>

                    {/* Celda de Ubicación con detección de links de Maps */}
                    <td className="px-4 py-3 text-white/70">
                      {clase.location && (clase.location.includes("http") || clase.location.includes("maps") || clase.location.includes("goo.gl")) ? (
                        <a
                          href={clase.location.startsWith("http") ? clase.location : `https://${clase.location.trim()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white py-1.5 px-3 rounded-lg transition-colors border border-white/10 font-medium"
                        >
                          Ver ubicación ↗
                        </a>
                      ) : (
                        clase.location ?? "—"
                      )}
                    </td>

                    <td className="px-4 py-4 text-left">
                      <button
                        onClick={() => handleCancelar(clase.eventId)}
                        disabled={isPending}
                        className="text-xs text-white/50 underline hover:text-red-400 disabled:opacity-50 transition-colors"
                      >
                        {isPending ? "Cancelando..." : "Cancelar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="card-gold p-4 sm:p-6 rounded-2xl border border-white/10 bg-neutral-900/60">
          <div className="fc-theme-gold">
            {/* Aquí usamos el wrapper dinámico */}
            <CalendarDynamic
              events={clases.map((c) => ({
                id: c.attendanceId,
                title: c.title,
                start: c.start,
                end: c.end,
                backgroundColor: c.categoryColor ?? "#D4AF37",
                borderColor: c.categoryColor ?? "#D4AF37",
              }))}
              onEventClick={(info) => {
                const clase = clases.find((c) => c.attendanceId === info.event.id);
                setSeleccionada(clase ?? null);
              }}
            />
          </div>

          {seleccionada && (
            <div className="mt-6 pt-6 border-t border-white/10 bg-black/20 p-4 rounded-xl">
              <span className="text-[10px] uppercase tracking-widest text-gold mb-2 block">Clase Seleccionada</span>
              <h4 className="text-white font-bold text-lg mb-1">{seleccionada.title}</h4>
              <p className="text-white/70 text-sm mb-2">{formatFecha(seleccionada.start)}</p>
              {seleccionada.location && (
                <div>
                  {seleccionada.location.includes("http") || seleccionada.location.includes("maps") || seleccionada.location.includes("goo.gl") ? (
                    <a
                      href={seleccionada.location.startsWith("http") ? seleccionada.location : `https://${seleccionada.location.trim()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white py-1.5 px-3 rounded-lg transition-colors border border-white/10 font-medium"
                    >
                      Ver ubicación ↗
                    </a>
                  ) : (
                    <p className="text-white/50 text-sm">Ubicación: {seleccionada.location}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}