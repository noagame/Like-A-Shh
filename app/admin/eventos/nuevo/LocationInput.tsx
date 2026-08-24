"use client";

import { useState, useRef, useEffect } from "react";

export default function LocationInput({ name, label }: { name: string; label: string }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Busca direcciones en la API local (/api/maps) conectada a OpenStreetMap
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.length > 2) {
                const encodedQuery = encodeURIComponent(query);
                const url = `/api/maps?q=${encodedQuery}`;

                fetch(url)
                    .then((res) => {
                        if (!res.ok) throw new Error("Error en la respuesta de la API");
                        return res.json();
                    })
                    .then((data) => {
                        setResults(data);
                        setIsOpen(true);
                    })
                    .catch((err) => {
                        console.error("Fetch bloqueado o fallido:", err);
                        setResults([]);
                    });
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    // Cierra el menú si haces clic afuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className="relative">
            <label className="block text-sm font-medium text-neutral-400 mb-1">{label}</label>
            <input
                name={name}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Empieza a escribir una dirección..."
                className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-blue-500"
                autoComplete="off"
            />

            {/* Menú desplegable adaptado a diseño oscuro */}
            {isOpen && results.length > 0 && (
                <ul className="absolute z-10 w-full bg-neutral-900 border border-neutral-700 rounded shadow-lg mt-1 max-h-60 overflow-auto text-white">
                    {results.map((place) => (
                        <li
                            key={place.place_id}
                            className="p-2 hover:bg-neutral-800 cursor-pointer text-sm border-b border-neutral-800 last:border-none"
                            onClick={() => {
                                setQuery(place.display_name);
                                setIsOpen(false);
                            }}
                        >
                            {place.display_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}