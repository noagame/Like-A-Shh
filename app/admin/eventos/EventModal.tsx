"use client";

import { useState } from "react";
import LocationInput from "./nuevo/LocationInput";
import CategorySelect from "./nuevo/CategorySelect";

type Category = { id: string; name: string };

export default function EventModal({ createAction, categories = [] }: { createAction: (formData: FormData) => Promise<void>, categories: Category[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [startValue, setStartValue] = useState("");
    const nowIso = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        await createAction(formData);
        setIsSubmitting(false);
        setIsOpen(false);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="bg-white/10 text-yellow-200 border-amber-500 px-4 py-2.5 rounded-xl border border-amber-300/40 text-[11px] font-bold uppercase tracking-[0.18em] text-white/10 shadow-lg shadow-amber-500/10 transition-all hover:brightness-110 active:scale-95"
            >
                + Agregar Evento
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
                            <p className="text-[10px] uppercase tracking-[0.28em] text-amber-300/80">Evento</p>
                            <h2 className="mt-2 text-2xl font-bold text-white">Nuevo evento / clase / workshop</h2>
                        </div>

                        <form action={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-white/70">Título</label>
                                <input
                                    name="title"
                                    type="text"
                                    required
                                    placeholder="Ej. Clase de Pole Dance"
                                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
                                />
                            </div>

                            <div className="z-10 relative">
                                <label className="mb-1 block text-sm text-white/70">Categoría</label>
                                <CategorySelect initialCategories={categories || []} />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-white/70">Descripción</label>
                                <textarea
                                    name="description"
                                    rows={4}
                                    placeholder="Detalles de la clase..."
                                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
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
                                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-white/70">Término</label>
                                    <input
                                        name="end_time"
                                        type="datetime-local"
                                        required
                                        min={startValue || nowIso}
                                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <LocationInput name="location" label="Ubicación" />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-white/70">Cupo (opcional)</label>
                                    <input
                                        name="capacity"
                                        type="number"
                                        min={1}
                                        placeholder="Ej. 20"
                                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-white/70">Estado</label>
                                    <select
                                        name="status"
                                        defaultValue="draft"
                                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                                    >
                                        <option value="draft">Borrador</option>
                                        <option value="published">Publicado</option>
                                        <option value="cancelled">Cancelado</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-1 block text-sm font-medium text-white/70">
                                        Flyer / Afiche del evento
                                    </label>
                                    <input
                                        name="flyer"
                                        type="file"
                                        accept="image/*"
                                        className="block w-full rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-2 text-xs text-white/70 file:mr-3 file:rounded file:border-0 file:bg-amber-400 file:px-3 file:py-2 file:font-semibold file:text-black"
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
                                    disabled={isSubmitting}
                                    className="rounded-xl bg-gradient-to-r from-amber-300 to-yellow-500 px-4 py-2 text-sm font-bold text-black shadow-lg shadow-amber-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isSubmitting ? "Creando..." : "Crear evento"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}