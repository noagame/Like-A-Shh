"use client";

import Image from "next/image";
import { signOut } from "@/app/login/actions";

const navLinks = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/eventos", label: "Gestión de Eventos" },
  { href: "/admin/categorias", label: "Gestión de Categorías" },
  { href: "/admin/galeria", label: "Gestión de Galería de Fotos" },
  { href: "/admin/dashboard", label: "Panel Analitico" },
  { href: "/admin/usuarios", label: "Gestión de Usuarios" },
  { href: "/admin/ajustes", label: "Ajustes" },
];

export default function Navbar() {
    return (
    <aside className="group fixed inset-y-0 left-0 z-40 w-16 overflow-hidden bg-gray-800 text-white p-3 shadow-xl transition-[width] duration-300 hover:w-64 focus-within:w-64">

        {/* Logo */}
        <a href="/admin" className="flex h-12 items-center gap-3 overflow-hidden whitespace-nowrap">
            <Image
                src="/assets/logo/logo_likeashh.jpg"
                alt="Logo Likeash"
                className="object-contain rounded-full"
                width={40}
                height={40}
            />
            <span className="opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                Like a Shh Admin
            </span>
        </a>

        {/* Barra de Navegación*/}
        <nav className="mt-4 flex flex-col gap-2" aria-label="Navegación del administrador">
          {navLinks.map((link) => (
            <a
                key={link.href}
                href={link.href}
                className="block truncate rounded px-2 py-3 text-sm font-medium text-gold/70 hover:bg-white/10 hover:text-gold transition-colors duration-300 tracking-wider uppercase"
                style={{ fontFamily: "var(--font-sans)" }}
            >
                <span className="opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                    {link.label}
                </span>
            </a>
          ))}
        </nav>
        
        {/* Cerrar Sesión */}
        <form action={signOut} className="mt-4">
            <button type="submit" className="w-full truncate rounded px-2 py-3 text-left text-sm text-white/70 hover:bg-white/10 hover:text-red-300 transition-colors">
                <span className="opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                    Cerrar sesión
                </span>
            </button>
        </form>
          
    </aside>
    );
}
