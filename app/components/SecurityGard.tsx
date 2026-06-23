"use client";

import { useEffect, useCallback } from "react";

/**
 * SecurityGuard — Capa de protección frontend contra inspección casual.
 *
 * Capas implementadas:
 * 1. Bloqueo de menú contextual (click derecho)
 * 2. Bloqueo de atajos de DevTools (F12, Ctrl+Shift+I/J/C/U, Cmd+Option+I/J/C/U)
 * 3. Bloqueo de Ctrl+U / Cmd+U (ver código fuente)
 * 4. Bloqueo de Ctrl+S / Cmd+S (guardar página)
 * 5. Bloqueo de Ctrl+P / Cmd+P (imprimir/exportar)
 * 6. Bloqueo de arrastrar imágenes (drag & drop)
 * 7. Bloqueo de selección de texto (CSS + JS)
 * 8. Detección de DevTools abierto (truco de debugger + medición de ventana)
 * 9. Bloqueo de Ctrl+A (seleccionar todo)
 * 10. Protección contra copy/paste del contenido
 *
 * NOTA IMPORTANTE PARA EL DESARROLLADOR:
 * Estas medidas disuaden al usuario casual pero NO son infalibles.
 * Un usuario técnico avanzado siempre puede acceder al código fuente
 * desde la pestaña Network del navegador o deshabilitando JavaScript.
 * Para protección real de assets, considera watermarking y DRM del lado del servidor.
 */
export default function SecurityGuard() {
  // ─── Bloqueo de atajos de teclado ───
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

    // F12 — Abrir DevTools
    if (e.key === "F12") {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl/Cmd + Shift + combinaciones de DevTools
    if (ctrlKey && e.shiftKey) {
      const blockedKeys = [
        "I", "i", // Inspeccionar elemento
        "J", "j", // Consola
        "C", "c", // Inspeccionar elemento (alternativo)
        "U", "u", // Ver código fuente (Firefox)
        "M", "m", // Responsive design mode (Firefox)
      ];
      if (blockedKeys.includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }

    // Ctrl/Cmd + U — Ver código fuente
    if (ctrlKey && (e.key === "u" || e.key === "U") && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl/Cmd + S — Guardar página
    if (ctrlKey && (e.key === "s" || e.key === "S") && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl/Cmd + P — Imprimir / Exportar PDF
    if (ctrlKey && (e.key === "p" || e.key === "P") && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl/Cmd + A — Seleccionar todo
    if (ctrlKey && (e.key === "a" || e.key === "A") && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl/Cmd + C — Copiar (bloquear copia del contenido)
    if (ctrlKey && (e.key === "c" || e.key === "C") && !e.shiftKey) {
      // Permitir en inputs y textareas para UX del formulario
      const target = e.target as HTMLElement;
      const isFormElement =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (!isFormElement) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }

    return true;
  }, []);

  // ─── Bloqueo de menú contextual ───
  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, []);

  // ─── Bloqueo de arrastre de imágenes y elementos ───
  const handleDragStart = useCallback((e: DragEvent) => {
    e.preventDefault();
    return false;
  }, []);

  // ─── Bloqueo de selección de texto ───
  const handleSelectStart = useCallback((e: Event) => {
    // Permitir selección en inputs y textareas
    const target = e.target as HTMLElement;
    const isFormElement =
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable;
    if (!isFormElement) {
      e.preventDefault();
      return false;
    }
    return true;
  }, []);

  // ─── Bloqueo de copiar contenido ───
  const handleCopy = useCallback((e: ClipboardEvent) => {
    const target = e.target as HTMLElement;
    const isFormElement =
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable;
    if (!isFormElement) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    return true;
  }, []);

  // ─── Detección de DevTools (medición de ventana) ───
  const detectDevTools = useCallback(() => {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;

    if (widthThreshold || heightThreshold) {
      // Limpiar el contenido o redirigir — opción sutil: difuminar
      document.body.style.filter = "blur(12px)";
      document.body.style.pointerEvents = "none";
    } else {
      document.body.style.filter = "";
      document.body.style.pointerEvents = "";
    }
  }, []);

  useEffect(() => {
    // Aplicar estilos CSS de protección al documento
    const style = document.createElement("style");
    style.id = "security-guard-styles";
    style.textContent = `
      /* Bloquear selección de texto en toda la página */
      body {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }

      /* Permitir selección en campos de formulario */
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }

      /* Desactivar arrastre de imágenes */
      img {
        -webkit-user-drag: none !important;
        user-drag: none !important;
        pointer-events: none !important;
      }

      /* Evitar que el contenido se imprima */
      @media print {
        body {
          display: none !important;
        }
        html::after {
          content: "Contenido protegido — Like a SHH © ${new Date().getFullYear()}";
          display: block;
          text-align: center;
          padding: 2rem;
          font-size: 1.5rem;
          color: #333;
        }
      }
    `;
    document.head.appendChild(style);

    // Registrar todos los event listeners
    document.addEventListener("contextmenu", handleContextMenu as unknown as EventListener, true);
    document.addEventListener("keydown", handleKeyDown as unknown as EventListener, true);
    document.addEventListener("dragstart", handleDragStart as unknown as EventListener, true);
    document.addEventListener("selectstart", handleSelectStart as unknown as EventListener, true);
    document.addEventListener("copy", handleCopy as unknown as EventListener, true);

    // Detección de DevTools periódica
    const devToolsInterval = setInterval(detectDevTools, 1000);
    window.addEventListener("resize", detectDevTools);

    // Cleanup al desmontar
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu as unknown as EventListener, true);
      document.removeEventListener("keydown", handleKeyDown as unknown as EventListener, true);
      document.removeEventListener("dragstart", handleDragStart as unknown as EventListener, true);
      document.removeEventListener("selectstart", handleSelectStart as unknown as EventListener, true);
      document.removeEventListener("copy", handleCopy as unknown as EventListener, true);
      clearInterval(devToolsInterval);
      window.removeEventListener("resize", detectDevTools);

      // Remover estilos inyectados
      const injectedStyle = document.getElementById("security-guard-styles");
      if (injectedStyle) injectedStyle.remove();
    };
  }, [handleKeyDown, handleContextMenu, handleDragStart, handleSelectStart, handleCopy, detectDevTools]);

  return null;
}