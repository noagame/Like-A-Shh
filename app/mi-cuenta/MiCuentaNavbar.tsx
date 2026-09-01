"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/app/login/actions";
import { m, AnimatePresence } from "framer-motion";

interface MiCuentaNavbarProps {
  userName: string;
}

const navLinks = [
  { href: "/mi-cuenta", label: "Resumen" },
  { href: "/mi-cuenta/clases", label: "Mis Clases" },
  { href: "/mi-cuenta/galeria", label: "Galeria" },
  { href: "/mi-cuenta/perfil", label: "Mi Perfil" },
  { href: "/mi-cuenta/explorar", label: "Explorar" },
];

export default function MiCuentaNavbar({ userName }: MiCuentaNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/85 backdrop-blur-md border-b border-white/[0.06] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Retorno al Sitio / Identidad */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-white/60 hover:text-white transition-colors group"
              title="Volver a la página principal"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 group-hover:border-amber-400/40 transition-colors">
                <Image
                  src="/assets/logo/logo_likeashh.jpg"
                  alt="Logo Like a Shh"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="hidden sm:inline text-xs tracking-wider uppercase text-white/40 group-hover:text-white/70 transition-colors">
                Sitio Principal
              </span>
            </Link>

            <div className="h-4 w-px bg-white/10 hidden sm:block" />

            <div>
              <p className="text-[11px] text-white/40 leading-none">Mi Espacio</p>
              <p className="text-xs sm:text-sm font-medium text-white/90 truncate max-w-[130px] sm:max-w-xs">
                {userName}
              </p>
            </div>
          </div>

          {/* Navegación Escritorio (md en adelante) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/[0.04] transition-all"
              >
                {link.label}
              </Link>
            ))}

            <div className="h-4 w-px bg-white/10 mx-1" />

            <form action={signOut}>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/40 hover:text-red-300 hover:bg-red-500/[0.05] transition-all cursor-pointer"
              >
                Salir
              </button>
            </form>
          </nav>

          {/* Botón Menú Hamburguesa Móvil */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-white/70 hover:text-amber-300 hover:bg-white/5 rounded-xl border border-white/10 transition-colors focus:outline-none"
              aria-label="Abrir menú de navegación"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden border-t border-white/[0.06] bg-[#09090b]/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-amber-300 hover:bg-white/5 transition-all"
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-2 mt-1 border-t border-white/10">
                <form action={signOut}>
                  <button
                    type="submit"
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Cerrar Sesión</span>
                    <span className="text-xs text-red-400/50">→</span>
                  </button>
                </form>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}