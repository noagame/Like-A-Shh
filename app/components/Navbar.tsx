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
      <div className="fixed top-3 sm:top-5 left-0 w-full flex justify-center z-50 pointer-events-none px-2 sm:px-3">
        <AnimatePresence>
          {visible && (
            <m.nav
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`pointer-events-auto w-full max-w-[980px] rounded-[28px] transition-all duration-300 ${
                scrolled
                  ? "bg-black/90 backdrop-blur-md border border-gold/40 shadow-[0_14px_40px_rgba(0,0,0,0.45)]"
                  : "bg-black/60 backdrop-blur-sm border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
              }`}
            >
              <div className="flex items-center justify-between h-12 sm:h-14 md:h-20 px-2.5 sm:px-4 md:px-6">
                {/* Logo */}
                <a href="#inicio" className="flex items-center gap-2 shrink-0">
                  <Image
                    src="/assets/logo/logo_likeashh.jpg"
                    alt="Logo Like a Shh"
                    className="object-contain rounded-full"
                    width={38}
                    height={38}
                    priority
                  />
                </a>

                {/* Enlaces de escritorio */}
                <div className="hidden md:flex items-center gap-6">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-[10px] xl:text-xs uppercase tracking-[0.18em] text-white/80 hover:text-gold transition-colors font-medium"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>

                {/* Botón Iniciar Sesión / Menú Móvil */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <Link
                    href="/login"
                    className="hidden sm:inline-flex bg-gold text-black text-[10px] font-bold uppercase tracking-[0.14em] px-3 py-2.5 rounded-full hover:bg-[#f4d57a] transition-all shadow-md"
                  >
                    Iniciar Sesión
                  </Link>

                  <Link
                    href="/login"
                    className="inline-flex sm:hidden bg-gold text-black text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-2 rounded-full hover:bg-[#f4d57a] transition-all shadow-md"
                  >
                    Entrar
                  </Link>

                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gold transition-colors hover:bg-gold/10 focus:outline-none"
                    aria-label="Abrir menú"
                    aria-expanded={mobileMenuOpen}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="md:hidden border-t border-white/10 bg-black/80 px-3 pb-3 pt-2">
                  <div className="flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-2">
                    {navLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-xl px-3 py-2.5 text-left text-[10px] uppercase tracking-[0.18em] text-white/80 hover:bg-gold/10 hover:text-gold transition-colors"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </m.nav>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}