"use client";

import Image from "next/image";
import { signOut } from "@/app/login/actions";
import { useState } from "react";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/eventos", label: "Gestión de Eventos" },
  { href: "/admin/clases-presenciales", label: "Clases Presenciales" },
  { href: "/admin/clases-online", label: "Clases Online" },
  { href: "/admin/categorias", label: "Gestión de Categorías" },
  { href: "/admin/galeria", label: "Gestión de Galería de Fotos" },
  { href: "/admin/dashboard", label: "Panel Analitico" },
  { href: "/admin/usuarios", label: "Gestión de Usuarios" },
  { href: "/admin/cursos", label: "Gestión de Cursos Online" },
  { href: "/admin/ajustes", label: "Ajustes" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
        {/* Botón flotante con logo */}
            <m.button 
                onClick={() => setIsOpen(!isOpen)} 
                initial={false}
                animate= {{
                    y: isOpen ? 10 : 0,
                    scale: isOpen ? 0.9 : 1
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed top-4 left-4 z-40 p-1 bg-black/50 backdrop-blur-md border border-gold/40 rounded-full shadow-lg hover:border-gold transition-colors focus:outline-none"
                arial-label="Abrir menú de administrador"
                >
                    <Image 
                        src="/favicon.ico"
                        alt="Logo Like a Shh"
                        className="object-contain rounded-full"
                        width={50}
                        height={50}/>
            </m.button>

            
            <AnimatePresence>
                {isOpen && (
                    <>
                    {/* Overley oscuro cuando el menú esta abierto */}
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />
                
                {/* Sidebar despegable con Glassmorphism*/}
                    <m.aside 
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ duration: 0.3, type: "spring", bounce: 0.1 }}
                        className="fixed inset-y-0 left-0 z-40 flex flex-col w-72 bg-black/80 backdrop-blur-xl border-r border-gold/20 text-white p-6 shadow-2xl overflow-hidden"
                    >

                            <div 
                                className="text-xl font-bold text-gold tracking-wide py-18" 
                                style={{ fontFamily: "var(--font-serif)" }}>
                                Barra de navegación
                            </div>

                            {/* Barra de Navegación*/}
                            <nav className=" flex flex-col gap-1 flex-grow overflow-y-auto">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="px-3 py-2 rounded-lg hover:bg-white/10 border border-transparent hover:border-white/5 transition-all text-sm text-white/80 hover:text-white"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                    
                            {/* Cerrar Sesión */}
                            <div className="mt-auto pt-6 pb-2 border-t border-white/10">
                                <form action={signOut}>
                                    <button 
                                    type="submit" 
                                    className="w-full text-left px-3 py-2.5 text-sm text-red-400 font-medium hover:bg-red-500/10 rounded-lg transition-color flex items-center gap-2">
                                        Cerrar sesión
                                    </button>
                                </form>
                            </div>
                        </m.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
