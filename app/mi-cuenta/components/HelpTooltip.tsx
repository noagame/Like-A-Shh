"use client";

import { useId, useState } from "react";
import { m } from "framer-motion";

export default function HelpTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex align-middle">
      <m.button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen((value) => !value)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-grid size-6 place-items-center rounded-full border border-white/15 bg-white/5 text-xs font-bold text-[#48CAE4] backdrop-blur-xl transition hover:border-[#48CAE4]/60 hover:bg-[#48CAE4]/10"
      >
        i
      </m.button>
      {open && (
        <span id={id} role="tooltip" className="absolute left-0 top-8 z-30 w-64 rounded-xl border border-white/10 bg-[#16131a]/95 p-3 text-left text-xs font-normal leading-relaxed text-white/75 shadow-2xl backdrop-blur-xl sm:left-auto sm:right-0">
          {children}
        </span>
      )}
    </span>
  );
}
