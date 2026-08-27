/**
 * Caja de contexto que va arriba de cada panel de admin, explicando en
 * lenguaje simple qué hace esa sección. Es un Server Component (sin
 * "use client") porque no tiene interactividad — solo texto estático.
 *
 * Uso:
 * <PanelInfo
 *   title="Categorías"
 *   description="Organiza tus eventos por tipo (Workshop, Sesión, etc.)..."
 * />
 */
"use client"; // Convertido a Client Component

import { useState, useEffect } from "react";

export default function PanelInfo({
  title,
  description,
}: {
  title: string;
  description: string;
}) { //[cite: 3]
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Evita errores de hidratación asegurando que localStorage solo se lea en el cliente
    setIsMounted(true);
    const savedState = localStorage.getItem(`hide-panel-${title}`);
    if (savedState === "true") {
      setIsVisible(false);
    }
  }, [title]);

  const handleHide = () => {
    setIsVisible(false);
    localStorage.setItem(`hide-panel-${title}`, "true");
  };
  
  const handleShow = () => {
    setIsVisible(true);
    localStorage.setItem(`hide-panel-${title}`, "false");
  };

  if (!isMounted) return null;

  return (
    <div className="mb-8 transition-all duration-300">
      {isVisible ? (
        <div className="relative p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-lg">
          {/* Botón de cierre */}
          <button
            onClick={handleHide}
            className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors p-1"
            aria-label="Ocultar panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h2 className="text-lg font-semibold text-gold mb-2">{title}</h2>
          <p className="text-sm text-white/70 leading-relaxed">{description}</p>
        </div>
      ) : (
        /* Estado Minimizado */
        <button
          onClick={handleShow}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-sm text-white/50 hover:text-gold hover:border-gold/30 transition-all text-sm"
          aria-label="Mostrar ayuda"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Mostrar info de {title}
        </button>
      )}
    </div>
  );
}
