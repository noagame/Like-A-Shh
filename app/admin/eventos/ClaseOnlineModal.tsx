"use client";

import { useState } from "react";
import { createClaseOnline } from "@/app/admin/clases-online/actions";

type Category = { id: string; name: string };

export default function ClaseOnlineModal({ categories = [] }: { categories?: Category[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [startValue, setStartValue] = useState("");
  const nowIso = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-white/10 hover:bg-white/15 border border-cyan-400/30 text-cyan-300 font-bold text-[11px] uppercase tracking-[0.18em] px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-cyan-500/5"
      >
        + Clase Particular Online
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto pt-16 pb-16">
          <div className="relative my-8 w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-950/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl md:p-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-xl font-bold text-white/50 transition hover:text-white"
              aria-label="Cerrar modal"
            >
              ×
            </button>

            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/80">Clase online</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Nueva clase particular online</h2>
            </div>

            <form action={async (formData: FormData) => {
              await createClaseOnline(formData);
              setIsOpen(false);
            }} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-white/70">Título</label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="Ej. Flexibilidad Activa en Vivo"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-white placeholder:text-white/30 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/70">Inicio</label>
                  <input
                    name="start_time"
                    type="datetime-local"
                    required
                    min={nowIso}
                    value={startValue}
                    onChange={(event) => setStartValue(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/70">Término</label>
                  <input
                    name="end_time"
                    type="datetime-local"
                    required
                    min={startValue || nowIso}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-white/70">Enlace Zoom / Google Meet</label>
                <input
                  name="meeting_url"
                  type="url"
                  required
                  placeholder="https://meet.google.com/..."
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-white placeholder:text-white/30 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-white/70">Categoría</label>
                <select
                  name="category_id"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
                  defaultValue=""
                >
                  <option value="" className="bg-zinc-900">Selecciona una categoría</option>
                  {(categories.length ? categories : [{ id: "online-default", name: "Clases Online" }]).map((category) => (
                    <option key={category.id} value={category.id} className="bg-zinc-900">
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-white/70">Descripción</label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Detalles de la sesión, nivel y objetivos"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-white placeholder:text-white/30 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/70">Cupos</label>
                  <input
                    name="capacity"
                    type="number"
                    min={1}
                    placeholder="Ej. 8"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-white placeholder:text-white/30 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-white/70">Flyer</label>
                  <input
                    name="flyer"
                    type="file"
                    accept="image/*"
                    className="block w-full rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-2 text-xs text-white/70 file:mr-3 file:rounded file:border-0 file:bg-cyan-400 file:px-3 file:py-2 file:font-semibold file:text-black"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-bold text-black shadow-lg shadow-cyan-500/20 transition hover:brightness-110"
                >
                  Crear clase online
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
