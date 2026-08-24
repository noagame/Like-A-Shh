"use client";

import { useState, useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import Image from "next/image";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Cursos Online", href: "#cursos" },
  { label: "Galería Mystic", href: "#galeria" },
  { label: "Contacto", href: "#contacto" },
  { label: "Próximos Eventos", href: "#eventos" },
];

export default function Navbar() {
  const [visible, setVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 50);

      const previousY = lastScrollYRef.current;
      if (currentY > previousY && currentY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollYRef.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-6 left-0 w-full flex justify-center z-50 pointer-events-none">
      <AnimatePresence>
        {visible && (
          <m.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`pointer-events-auto w-[92%] max-w-[1000px] rounded-full transition-all duration-300 ${scrolled
              ? "bg-black/90 backdrop-blur-md border border-gold/40"
              : "bg-transparent"
              }`}
          >
            <div className="flex items-center justify-between h-16 md:h-20 px-4 md:px-6">
              {/* Logo */}
              <a href="#inicio" className="flex items-center gap-2">
                <Image
                  src="/assets/logo/logo_likeashh.jpg"
                  alt="Logo Likeash"
                  className="object-contain rounded-full"
                  width={75}
                  height={30}
                />
              </a>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-6 lg:gap-8">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-gold/70 hover:text-gold transition-colors duration-300 tracking-wider uppercase"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {link.label}
                  </a>
                ))}

                {/* Botón de Inicio de Sesión (Desktop) */}
                <a
                  href="/login"
                  className="bg-gold text-black px-6 py-2 rounded-full text-sm font-bold tracking-wider uppercase hover:brightness-110 transition-all duration-300"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Iniciar Sesión
                </a>
              </div>

              {/* Mobile hamburger */}
              <button
                type="button"
                id="nav-mobile-toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden flex flex-col gap-1.5 p-2"
                aria-label="Toggle menu"
              >
                <m.span
                  animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  className="block w-6 h-0.5 bg-gold"
                />
                <m.span
                  animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="block w-6 h-0.5 bg-gold"
                />
                <m.span
                  animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                  className="block w-6 h-0.5 bg-gold"
                />
              </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {mobileOpen && (
                <m.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="md:hidden bg-black/95 backdrop-blur-xl border-t border-gold/10 overflow-hidden rounded-b-3xl"
                >
                  <div className="px-6 py-6 flex flex-col gap-5">
                    {navLinks.map((link, i) => (
                      <m.a
                        key={link.href}
                        href={link.href}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => setMobileOpen(false)}
                        className="text-sm font-medium text-gold/80 hover:text-gold uppercase tracking-wider block"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {link.label}
                      </m.a>
                    ))}

                    {/* Botón de Inicio de Sesión (Mobile) */}
                    <m.a
                      href="/login"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: navLinks.length * 0.1 }}
                      onClick={() => setMobileOpen(false)}
                      className="mt-4 text-center bg-gold text-black py-3 rounded-full text-sm font-bold tracking-wider uppercase hover:brightness-110 transition-all duration-300 shadow-lg shadow-gold/20"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      Iniciar Sesión
                    </m.a>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </m.nav>
        )}
      </AnimatePresence>
    </div>
  );
}