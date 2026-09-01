"use client";

import { useState } from "react";
import { createPresencialClass } from "./actions";

export default function FormClasePresencial() {
  const [startValue, setStartValue] = useState("");
  const nowIso = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  return (
    <form action={createPresencialClass} className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-white/70">Nombre de la clase</label>
          <input
            name="title"
            required
            type="text"
            placeholder="Ej. Pole Sport Intensivo"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/30 focus:border-gold focus:outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-white/70">Descripción</label>
          <textarea
            name="description"
            rows={4}
            placeholder="Detalles, nivel, objetivos y requisitos"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/30 focus:border-gold focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-white/70">Inicio</label>
          <input
            name="start_time"
            type="datetime-local"
            required
            min={nowIso}
            value={startValue}
            onChange={(event) => setStartValue(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white focus:border-gold focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-white/70">Término</label>
          <input
            name="end_time"
            type="datetime-local"
            required
            min={startValue || nowIso}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white focus:border-gold focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-white/70">Ubicación presencial</label>
          <input
            name="location"
            type="text"
            required
            placeholder="Ej. Calle ... / Estudio Like a Shh"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/30 focus:border-gold focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-white/70">Cupos máximos</label>
          <input
            name="capacity"
            type="number"
            min={1}
            placeholder="Ej. 12"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/30 focus:border-gold focus:outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-white/70">Flyer o imagen</label>
          <input
            name="flyer"
            type="file"
            accept="image/*"
            className="block w-full rounded-lg border border-dashed border-white/15 bg-black/20 p-2 text-sm text-white/70 file:mr-3 file:rounded file:border-0 file:bg-gold file:px-3 file:py-2 file:font-semibold file:text-black"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-black transition hover:bg-gold-light"
        >
          Publicar clase presencial
        </button>
      </div>
    </form>
  );
}
