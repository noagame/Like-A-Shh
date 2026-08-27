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

  if (!isMounted || !isVisible) return null;

  return (
    <div className="relative p-6 mb-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-lg transition-all duration-300">
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
  );
}
