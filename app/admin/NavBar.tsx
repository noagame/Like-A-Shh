"use client";

import Image from "next/image";
import { signOut } from "@/app/login/actions";

const navLinks = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/eventos", label: "Gestión de Eventos" },
  { href: "/admin/categorias", label: "Gestión de Categorías" },
  { href: "/admin/galeria", label: "Gestión de Galería de Fotos" },
  { href: "/admin/medios", label: "Gestión de Medios" },
  { href: "/admin/dashboard", label: "Panel Analítico" },
  { href: "/admin/usuarios", label: "Gestión de Usuarios" },
  { href: "/admin/ajustes", label: "Ajustes" },
];

/**
 * Comportamiento: por defecto el nav queda colapsado a una franja angosta
 * (w-4) — solo un borde visible pegado a la izquierda. Al pasar el mouse
 * por encima (`group-hover`), se expande a su ancho completo y el texto
 * aparece con un fundido (`opacity`).
 *
 * Por qué "group-hover" de Tailwind y no un useState con onMouseEnter:
 * para este caso (mostrar/ocultar un bloque entero al hacer hover) no hace
 * falta JavaScript — CSS puro con :hover es más simple, no depende de
 * useState/useEffect, y no tiene el problema de "flicker" que a veces da
 * togglear estado de React en eventos de mouse muy frecuentes.
 *
 * El "use client" sigue siendo necesario igual, porque el botón de
 * cerrar sesión usa una Server Action dentro de un <form>, y ese patrón
 * requiere que el árbol donde vive sea un Client Component boundary
 * consistente con el resto del admin.
 */
export default function NavBar() {
  return (
    <aside
      className="
        group
        fixed left-0 top-0 z-50 flex h-screen flex-col gap-1
        overflow-hidden bg-gray-900/95 backdrop-blur-sm
        border-r border-white/10
        transition-[width] duration-300 ease-in-out
        w-4 hover:w-64
        py-6
      "
    >
      {/* Indicador visual de que hay un nav escondido (una línea sutil) */}
      <div className="absolute left-0 top-0 h-full w-1 bg-gold/40 group-hover:opacity-0 transition-opacity" />

      <div className="flex flex-col gap-1 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 whitespace-nowrap">
        {/* Logo */}
        <a href="/admin" className="flex items-center gap-2 mb-4">
          <Image
            src="/assets/logo/logo_likeashh.jpg"
            alt="Logo Likeash"
            className="object-contain rounded-full"
            width={56}
            height={56}
          />
        </a>

        {/* Links */}
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="block py-2 px-3 rounded-md text-sm font-medium text-gold/70 hover:text-gold hover:bg-white/5 transition-colors duration-200 tracking-wider uppercase"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {link.label}
          </a>
        ))}

        {/* Cerrar Sesión */}
        <form action={signOut} className="mt-4 px-3">
          <button
            type="submit"
            className="text-sm text-white/70 hover:text-red-300 transition-colors"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
