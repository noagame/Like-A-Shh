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

export default function Navbar (){ 
    return (
    <aside className="w-42 bg-gray-800 text-white min-h-screen p-4 flex flex-col gap-4">

        {/* Logo */}
        <a href="/admin" className="flex items-center gap-2">
            <Image
                src="/assets/logo/logo_likeashh.jpg"
                alt="Logo Likeash"
                className="object-contain rounded-full"
                width={75}
                height={30}
            />
        </a>

        {/* Barra de Navegación*/}
        {navLinks.map((link) => (
            <a
                key={link.href}
                href={link.href}
                className="block py-2 px-4 text-sm font-medium text-gold/70 hover:text-gold transition-colors duration-300 tracking-wider uppercase"
                style={{ fontFamily: "var(--font-sans)" }}
            >
                {link.label}
            </a>
        ))}
        
        {/* Cerrar Sesión */}
        <form action={signOut}>
            <button type="submit" className="text-sm text-white/70  hover:text-red-300 transition-colors">
                Cerrar sesión
            </button>
        </form>
          
    </aside>
    );
}
