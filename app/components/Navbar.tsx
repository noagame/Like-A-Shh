"use client";

import { useState, useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Cursos Online", href: "#cursos" },
  { label: "Galería Mystic", href: "#galeria" },
  { label: "Contacto", href: "#contacto" },
  { label: "Próximos Eventos", href: "#eventos" },
];

export default function Navbar() {
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      // 1. Evitar rebotes elásticos de iOS / Android
      if (currentY < 0) return;

      // 2. Estado de fondo desenfocado
      setScrolled(currentY > 30);

      // 3. Umbral para evitar parpadeos con micro-movimientos
      const delta = currentY - lastScrollYRef.current;
      if (Math.abs(delta) < 10) return;

      if (currentY > 120 && delta > 0) {
        // Desplazándose hacia abajo
        setVisible(false);
      } else {
        // Desplazándose hacia arriba o cerca del tope
        setVisible(true);
      }

      lastScrollYRef.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="fixed top-4 sm:top-6 left-0 w-full flex justify-center z-50 pointer-events-none px-3">
        <AnimatePresence>
          {visible && (
            <m.nav
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`pointer-events-auto w-full max-w-[1000px] rounded-full transition-all duration-300 ${
                scrolled
                  ? "bg-black/90 backdrop-blur-md border border-gold/40 shadow-2xl"
                  : "bg-black/60 backdrop-blur-sm border border-white/10"
              }`}
            >
              <div className="flex items-center justify-between h-14 sm:h-16 md:h-20 px-4 md:px-6">
                {/* Logo */}
                <a href="#inicio" className="flex items-center gap-2">
                  <Image
                    src="/assets/logo/logo_likeashh.jpg"
                    alt="Logo Like a Shh"
                    className="object-contain rounded-full"
                    width={45}
                    height={45}
                    priority
                  />
                </a>

                {/* Enlaces de escritorio */}
                <div className="hidden md:flex items-center gap-6">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-xs uppercase tracking-wider text-white/80 hover:text-gold transition-colors font-medium"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>

                {/* Botón Iniciar Sesión / Menú Móvil */}
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="bg-gold text-black text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full hover:bg-gold-light transition-all shadow-md"
                  >
                    Iniciar Sesión
                  </Link>

                  {/* Hamburguesa para celular */}
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 text-gold focus:outline-none"
                    aria-label="Abrir menú"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {mobileMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Menú Desplegable Móvil */}
              {mobileMenuOpen && (
                <div className="md:hidden px-5 pb-5 pt-2 border-t border-white/10 flex flex-col gap-3 text-center">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs uppercase tracking-wider text-white/80 hover:text-gold py-1.5 transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </m.nav>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}