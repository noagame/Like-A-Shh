"use client";

import { useState } from "react";
import { createCourse } from "./actions";

export default function CourseModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gold text-black text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-gold-light transition-all cursor-pointer shadow-lg shadow-gold/10"
      >
        + Nuevo Curso
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto pt-16 pb-16">
          <div className="bg-black/90 border border-white/10 rounded-2xl text-white max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-auto">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-gold" style={{ fontFamily: "var(--font-serif)" }}>
                Crear Nuevo Curso
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white text-lg">
                ✕
              </button>
            </div>

            <form
              action={async (formData) => {
                setIsSubmitting(true);
                await createCourse(formData);
                setIsSubmitting(false);
                setIsOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Título del Curso *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Ej. Flexibiliza tu Actitud"
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Descripción Completa *</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Explica los beneficios, módulos y enfoque del curso..."
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-gold outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Flyer / Portada (Opcional - Fallback automático a Logo)
                </label>
                <input
                  type="file"
                  name="flyer"
                  accept="image/*"
                  className="w-full text-xs text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gold file:text-black hover:file:bg-gold-light cursor-pointer bg-white/5 border border-white/10 rounded-xl p-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Enlace de Venta / Hotmart (URL)</label>
                <input
                  type="url"
                  name="url"
                  placeholder="https://hotmart.com/..."
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-gold outline-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 text-xs text-white/60 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gold text-black text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl hover:bg-gold-light disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? "Guardando..." : "Publicar Curso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}