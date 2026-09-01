"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import LocationInput from "./nuevo/LocationInput";
import CategorySelect from "./nuevo/CategorySelect";

type Category = { id: string; name: string };

export default function EventModal({
  createAction,
  categories = [],
}: {
  createAction: (formData: FormData) => Promise<void>;
  categories: Category[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [startValue, setStartValue] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const nowIso = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    await createAction(formData);
    setIsSubmitting(false);
    setIsOpen(false);
  };

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative my-auto w-full max-w-xl rounded-2xl border border-white/10 bg-[#0d0d10] p-5 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto text-white">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 text-xl font-bold text-white/40 hover:text-white transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-[0.28em] text-amber-300/80 font-mono">
            Evento General
          </p>
          <h2 className="mt-1 text-xl sm:text-2xl font-bold text-white">
            Nuevo evento / clase
          </h2>
        </div>

        <form action={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="mb-1 block font-medium text-white/70">Título</label>
            <input
              name="title"
              type="text"
              required
              placeholder="Ej. Gala Anual Like a Shh"
              className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-white/70">Categoría</label>
            <CategorySelect initialCategories={categories} />
          </div>

          <div>
            <label className="mb-1 block font-medium text-white/70">Descripción</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Detalles del evento..."
              className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none resize-none"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium text-white/70">Inicio</label>
              <input
                name="start_time"
                type="datetime-local"
                required
                min={nowIso}
                value={startValue}
                onChange={(e) => setStartValue(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-white focus:border-amber-400 focus:outline-none [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium text-white/70">Término</label>
              <input
                name="end_time"
                type="datetime-local"
                required
                min={startValue || nowIso}
                className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-white focus:border-amber-400 focus:outline-none [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <LocationInput name="location" label="Ubicación" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium text-white/70">Cupo (opcional)</label>
              <input
                name="capacity"
                type="number"
                min={1}
                placeholder="Ej. 15"
                className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium text-white/70">Estado</label>
              <select
                name="status"
                defaultValue="draft"
                className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none cursor-pointer"
              >
                <option value="draft" className="bg-neutral-900">Borrador</option>
                <option value="published" className="bg-neutral-900">Publicado</option>
                <option value="cancelled" className="bg-neutral-900">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 transition hover:bg-white/10 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-amber-400 px-5 py-2 text-xs font-bold text-black shadow-lg shadow-amber-500/20 transition hover:bg-amber-300 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Guardando..." : "Crear evento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto bg-amber-500/15 border border-amber-400/40 text-amber-200 px-3.5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-[0.16em] shadow-lg transition-all hover:bg-amber-500/25 active:scale-95 text-center cursor-pointer"
      >
        + Agregar Evento
      </button>
      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}