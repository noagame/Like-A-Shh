"use client";

import { useEffect } from "react";

export default function SecurityGuard() {
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === "F12" ||
                (e.ctrlKey && e.shiftKey && e.key === "I") ||
                (e.ctrlKey && e.key === "u") ||
                (e.ctrlKey && e.shiftKey && e.key === "C") // Para bloquear la selección de elementos
            ) {
                e.preventDefault();
            }
        };

        // Usamos 'as any' para evitar problemas estrictos de tipado con los eventos del DOM
        document.addEventListener("contextmenu", handleContextMenu as any);
        document.addEventListener("keydown", handleKeyDown as any);

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu as any);
            document.removeEventListener("keydown", handleKeyDown as any);
        };
    }, []);

    // Este componente es puramente lógico, no renderiza nada en la pantalla
    return null;
}