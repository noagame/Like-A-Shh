"use client";

import { AnimatePresence, m } from "framer-motion";
import { useState, useTransition } from "react";
import { submitEventReview } from "@/app/mi-cuenta/reviews-actions";

type EventReviewModalProps = {
  eventId: string;
  eventTitle: string;
  existingRating?: number | null;
  existingComment?: string | null;
  existingRecommendation?: string | null;
};

const starLabels = ["Muy mala", "Mala", "Regular", "Buena", "Excelente"];

export default function EventReviewModal({
  eventId,
  eventTitle,
  existingRating,
  existingComment,
  existingRecommendation,
}: EventReviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(existingRating ?? 0);
  const [comment, setComment] = useState(existingComment ?? "");
  const [recommendation, setRecommendation] = useState(existingRecommendation ?? "");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const ratingValue = hoverRating || selectedRating;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!selectedRating) {
      setMessage({ type: "error", text: "Selecciona una puntuación antes de enviar." });
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("event_id", eventId);
      formData.set("rating", String(selectedRating));
      formData.set("comment", comment);
      formData.set("recommendation", recommendation);

      const result = await submitEventReview(formData);

      if (!result.success) {
        setMessage({ type: "error", text: result.error ?? "No pudimos guardar tu reseña." });
        return;
      }

      setMessage({ type: "success", text: "¡Gracias! Tu valoración ya quedó guardada." });
      setTimeout(() => setIsOpen(false), 1100);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gold/30 bg-gold/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300 transition hover:border-gold/50 hover:bg-gold/15"
      >
        <span>⭐</span>
        {existingRating ? "Editar opinión" : "Dejar Opinión"}
      </button>

      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-start justify-center bg-black/70 p-4 pt-16 pb-16 backdrop-blur-sm"
          >
            <m.div
              initial={{ y: 30, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="relative my-8 w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-[#09090b]/90 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl"
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 text-xl text-white/50 transition hover:text-white"
                aria-label="Cerrar reseña"
              >
                ×
              </button>

              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-[0.28em] text-amber-300/80">Reseña</p>
                <h3 className="mt-2 text-2xl font-bold text-white" style={{ fontFamily: "var(--font-serif)" }}>
                  {eventTitle}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">Tu valoración</label>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setSelectedRating(star)}
                        className="text-3xl transition-transform hover:scale-110"
                        aria-label={`Valorar con ${star} estrellas`}
                      >
                        <span className={star <= ratingValue ? "text-amber-400" : "text-white/20"}>★</span>
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-white/60">
                      {ratingValue ? `${ratingValue}/5 · ${starLabels[ratingValue - 1]}` : "Selecciona tu nota"}
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="comment" className="mb-2 block text-sm font-medium text-white/70">
                    Tu experiencia en la clase
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    rows={4}
                    maxLength={500}
                    placeholder="Cuenta cómo te sentiste, qué te gustó y qué mejorarías."
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="recommendation" className="mb-2 block text-sm font-medium text-white/70">
                    Recomendación o tip para otras alumnas
                  </label>
                  <textarea
                    id="recommendation"
                    value={recommendation}
                    onChange={(event) => setRecommendation(event.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Opcional: ayúdanos a recomendarte mejor para futuras sesiones."
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {message && (
                  <div
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      message.type === "success"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-red-500/30 bg-red-500/10 text-red-300"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-xl bg-gradient-to-r from-amber-300 to-yellow-500 px-4 py-2 text-sm font-bold text-black shadow-lg shadow-amber-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isPending ? "Enviando..." : "Guardar opinión"}
                  </button>
                </div>
              </form>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
