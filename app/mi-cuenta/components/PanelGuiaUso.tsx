"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, m } from "framer-motion";

const guideItems = [
  ["¿Cómo reservo una clase?", "En Explorar, elige una actividad disponible y pulsa Inscribirme. El botón mostrará tu inscripción y el cupo se actualizará."],
  ["¿Cómo cancelo o reprogramo?", "En Mis Clases podrás revisar cada reserva. Si necesitas cambiarla, cancela con la anticipación indicada por la actividad y reserva otra sesión disponible."],
  ["¿Dónde veo el enlace o la dirección?", "Tu enlace de Zoom o Meet, o la dirección del estudio, aparece en Mis Clases y en el detalle de la actividad una vez inscrita."],
  ["Tus datos y privacidad", "En Mi Perfil puedes rectificar tus datos, ocultar los opcionales o solicitar eliminación. Estos controles se alinean con los derechos ARCO de la Ley N.º 21.719."],
] as const;

export default function PanelGuiaUso() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(0);

  useEffect(() => {
    const restoreOpenState = window.setTimeout(() => {
      setOpen(localStorage.getItem("likeashh-guide-open") === "true");
    }, 0);
    return () => window.clearTimeout(restoreOpenState);
  }, []);
  const toggle = () => setOpen((value) => {
    localStorage.setItem("likeashh-guide-open", String(!value));
    return !value;
  });

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)]">
      <AnimatePresence initial={false}>
        {open && (
          <m.section initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }} className="mb-3 w-[min(23rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-[#17121b]/95 p-4 shadow-2xl backdrop-blur-xl">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div><p className="text-[10px] uppercase tracking-[0.22em] text-[#48CAE4]">Like a Shh</p><h2 className="text-base font-bold text-white">Guía rápida</h2></div>
              <button type="button" onClick={toggle} aria-label="Minimizar guía" className="rounded-lg px-2 py-1 text-white/50 hover:bg-white/10 hover:text-white">−</button>
            </div>
            <div className="space-y-1">
              {guideItems.map(([title, content], index) => (
                <div key={title} className="rounded-xl border border-white/8 bg-white/[0.03]">
                  <button type="button" onClick={() => setExpanded(expanded === index ? null : index)} className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-xs font-semibold text-white/85">
                    {title}<span className="text-[#D4AF37]">{expanded === index ? "−" : "+"}</span>
                  </button>
                  {expanded === index && <p className="px-3 pb-3 text-xs leading-relaxed text-white/60">{content}</p>}
                </div>
              ))}
            </div>
          </m.section>
        )}
      </AnimatePresence>
      <m.button type="button" whileTap={{ scale: 0.98 }} onClick={toggle} className="ml-auto flex items-center gap-2 rounded-full border border-[#48CAE4]/35 bg-[#48CAE4]/15 px-4 py-2.5 text-xs font-bold text-[#c8f5ff] shadow-lg shadow-black/30 backdrop-blur-xl hover:bg-[#48CAE4]/25">
        <span aria-hidden>?</span>{open ? "Minimizar guía" : "Guía de uso"}
      </m.button>
    </div>
  );
}
