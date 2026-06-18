"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Cursos Online", href: "#cursos" },
  { label: "Galería Mystic", href: "#galeria" },
  { label: "Contacto", href: "#contacto" },
  { label: "Próximos Eventos", href: "#eventos" },
];

export default function Navbar() {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 50);

      if (currentY > lastScrollY && currentY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className="fixed top-6 left-0 w-full flex justify-center z-50 pointer-events-none">
      <AnimatePresence>
        {visible && (
          <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`pointer-events-auto w-[92%] max-w-[1000px] rounded-full transition-all duration-300 ${scrolled
              ? "bg-black/90 backdrop-blur-md border border-gold/40"
              : "bg-transparent"
              }`}
          >
            <div className="flex items-center justify-between h-16 md:h-20">
              {/* Logo */}
              <a href="#inicio" className="flex items-center gap-2">
                <img
                  src="/assets/logo/logo_likeashh.jpg"
                  alt="Logo Likeash"
                  className="w-19 h-19 object-contain rounded-full"
                />
              </a>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-8">
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
              </div>

              {/* Mobile hamburger */}
              <button
                id="nav-mobile-toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden flex flex-col gap-1.5 p-2"
                aria-label="Toggle menu"
              >
                <motion.span
                  animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  className="block w-6 h-0.5 bg-gold"
                />
                <motion.span
                  animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="block w-6 h-0.5 bg-gold"
                />
                <motion.span
                  animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                  className="block w-6 h-0.5 bg-gold"
                />
              </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {mobileOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="md:hidden bg-black/95 backdrop-blur-xl border-t border-gold/10 overflow-hidden"
                >
                  <div className="px-4 py-4 flex flex-col gap-4">
                    {navLinks.map((link, i) => (
                      <motion.a
                        key={link.href}
                        href={link.href}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => setMobileOpen(false)}
                        className="md:hidden bg-black/95 backdrop-blur-xl border-t border-gold/20 overflow-hidden rounded-b-3xl" style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {link.label}
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
