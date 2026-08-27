"use client";

import { useState, useTransition } from "react";
import { attendEvent, cancelAttendance } from "@/app/mi-cuenta/actions";

export default function AttendButton({
  eventId,
  yaInscrito,
  cupoLleno,
}: {
  eventId: string;
  yaInscrito: boolean;
  cupoLleno: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [inscrito, setInscrito] = useState(yaInscrito);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = inscrito ? await cancelAttendance(eventId) : await attendEvent(eventId);

      if (result?.error) {
        setError(result.error);
        return;
      }
      setInscrito(!inscrito);
    });
  }

  if (!inscrito && cupoLleno) {
    return (
      <button
        disabled
        className="w-full py-2.5 rounded-full text-xs uppercase tracking-widest font-bold bg-white/10 text-white/40 cursor-not-allowed"
      >
        Cupo lleno
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`w-full py-2.5 rounded-full text-xs uppercase tracking-widest font-bold transition-colors disabled:opacity-50 ${
          inscrito
            ? "bg-transparent border border-white/20 text-white/70 hover:border-red-400 hover:text-red-400"
            : "bg-gold text-black hover:bg-gold-light"
        }`}
      >
        {isPending ? "Procesando..." : inscrito ? "Cancelar asistencia" : "Quiero asistir"}
      </button>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}