"use client";

import { useState } from "react";
import LocationInput from "./nuevo/LocationInput";

export default function EventModal({ createAction }: { createAction: (formData: FormData) => Promise<void> }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-gold text-black font-bold px-4 py-2 rounded hover:bg-gold-light transition-colors text-sm cursor-pointer"
            >
                + Nuevo evento
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg text-white max-w-2xl w-full p-6 relative shadow-2xl my-8">

                        {/* Botón de cierre X */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-white text-xl font-bold cursor-pointer"
                        >
                            ✕
                        </button>

                        <h1 className="text-2xl font-bold mb-6">Nuevo evento / Clase / Workshop</h1>

                        <form action={async (formData) => {
                            await createAction(formData);
                            setIsOpen(false);
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Título</label>
                                <input
                                    name="title"
                                    type="text"
                                    required
                                    placeholder="Ej. Clase de Pole Dance"
                                    className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Descripción</label>
                                <textarea
                                    name="description"
                                    placeholder="Detalles de la clase..."
                                    className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-white h-24 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Inicio</label>
                                    <input
                                        name="start_time"
                                        type="datetime-local"
                                        required
                                        className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Término</label>
                                    <input
                                        name="end_time"
                                        type="datetime-local"
                                        required
                                        className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <LocationInput name="location" label="Ubicación" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Cupo (opcional)</label>
                                    <input
                                        name="capacity"
                                        type="number"
                                        placeholder="Ej. 20"
                                        className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Estado</label>
                                    <select
                                        name="status"
                                        defaultValue="draft"
                                        className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="draft">Borrador</option>
                                        <option value="published">Publicado</option>
                                        <option value="cancelled">Cancelado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded text-sm text-white transition cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-white text-black font-medium hover:bg-gray-200 rounded text-sm transition cursor-pointer"
                                >
                                    Crear evento
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}