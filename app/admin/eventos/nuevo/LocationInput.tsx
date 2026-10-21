"use client";

import { useEffect, useId, useRef, useState } from "react";

type Place = { place_id: number; display_name: string };

type Props = {
  name: string;
  label: string;
  defaultValue?: string;
  autocomplete?: boolean;
};

export default function LocationInput({
  name, label, defaultValue = "", autocomplete = true,
}: Props) {
  const inputId = useId();
  const [query, setQuery] = useState(defaultValue);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const value = searchQuery.trim();
    const isUrl = /^(?:[a-z][a-z0-9+.-]*:|www\.|maps\.|google\.|goo\.gl|\/\/)/i.test(value);
    if (!autocomplete || value.length < 3 || isUrl) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/maps?q=${encodeURIComponent(value)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("No se pudieron buscar direcciones.");
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error("Respuesta de direcciones inválida.");
        const places = data.filter((item): item is Place =>
          typeof item === "object" && item !== null &&
          typeof item.place_id === "number" && typeof item.display_name === "string"
        );
        if (controller.signal.aborted) return;
        setResults(places);
        setIsOpen(places.length > 0);
      } catch {
        if (controller.signal.aborted) return;
        setResults([]);
        setIsOpen(false);
        setLookupError("No pudimos cargar sugerencias. Puedes escribir la dirección o pegar el enlace de Maps.");
      }
    }, 500);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, autocomplete]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-neutral-400">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        type="text"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setSearchQuery(event.target.value);
          setResults([]);
          setIsOpen(false);
          setLookupError(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            setIsOpen(false);
          }
        }}
        aria-describedby={lookupError ? `${inputId}-error` : undefined}
        placeholder={autocomplete ? "Escribe una dirección o pega un enlace de Maps" : "Enlace o ubicación de la clase"}
        className="w-full rounded border border-neutral-700 bg-neutral-800 p-2 text-white focus:border-blue-500 focus:outline-none"
        autoComplete="off"
      />
      {lookupError && <p id={`${inputId}-error`} role="status" className="mt-1 text-xs text-amber-200">{lookupError}</p>}
      {isOpen && results.length > 0 && (
        <ul aria-label="Direcciones sugeridas" className="absolute z-10 max-h-60 w-full overflow-auto rounded border border-neutral-700 bg-neutral-900 text-white shadow-lg">
          {results.map((place) => (
            <li key={place.place_id}>
              <button
                type="button"
                className="w-full border-b border-neutral-800 p-2 text-left text-sm hover:bg-neutral-800 focus:bg-neutral-800"
                onClick={() => {
                  setQuery(place.display_name);
                  setSearchQuery("");
                  setResults([]);
                  setIsOpen(false);
                }}
              >
                {place.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}