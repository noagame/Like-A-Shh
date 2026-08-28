"use client";

import { useState, useTransition } from "react";
import { actualizarPerfil } from "./actions";
import { m, AnimatePresence } from "framer-motion";

type ProfileData = {
  full_name: string | null;
  email?: string | null;
  phone: string | null;
  birth_date: string | null;
  gender: string | null;
  is_anonymized?: boolean | null;
} | null;

interface PerfilFormProps {
  profile: ProfileData;
  userEmail: string;
}

export default function PerfilForm({ profile, userEmail }: PerfilFormProps) {
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusMessage(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await actualizarPerfil(formData);
      if (res?.error) {
        setStatusMessage({ type: "error", text: res.error });
      } else if (res?.success) {
        setStatusMessage({
          type: "success",
          text: "Tus datos han sido actualizados y resguardados correctamente.",
        });
      }
    });
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Indicador superior de edición */}
      <div className="border-b border-white/10 pb-5 mb-6 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2
            className="text-xl font-bold text-white tracking-wide"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Información Personal
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Actualiza tus datos de contacto y registro de alumna.
          </p>
        </div>
        <span className="text-[11px] font-mono uppercase bg-gold/10 text-gold border border-gold/20 px-3 py-1 rounded-full">
          Ley 21.719 Cumplimiento Activo
        </span>
      </div>

      {/* Alertas de Estado (Éxito / Error) */}
      <AnimatePresence>
        {statusMessage && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 p-4 rounded-xl text-xs font-medium border flex items-center gap-3 ${
              statusMessage.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-300"
                : "bg-red-500/10 border-red-500/30 text-red-300"
            }`}
          >
            <span>{statusMessage.type === "success" ? "✓" : "⚠️"}</span>
            <p className="flex-1">{statusMessage.text}</p>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-white/40 hover:text-white transition-colors"
            >
              ✕
            </button>
          </m.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Nombre Completo */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-2">
              Nombre Completo <span className="text-gold">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              required
              defaultValue={profile?.full_name || ""}
              placeholder="Tu nombre y apellido"
              className="w-full p-3 bg-black/60 border border-white/10 rounded-xl text-white text-sm focus:border-gold outline-none transition-all placeholder:text-white/30"
            />
          </div>

          {/* Correo Electrónico (Solo Lectura) */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-2">
              Correo Electrónico (Identificador de Cuenta)
            </label>
            <input
              type="email"
              disabled
              value={userEmail}
              className="w-full p-3 bg-black/30 border border-white/5 rounded-xl text-white/40 text-sm cursor-not-allowed select-none font-mono"
            />
            <p className="text-[10px] text-white/40 mt-1">
              Vinculado a tu sesión principal.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Teléfono / WhatsApp */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-2">
              Teléfono / WhatsApp de Contacto
            </label>
            <input
              type="tel"
              name="phone"
              defaultValue={profile?.phone || ""}
              placeholder="+56 9 1234 5678"
              className="w-full p-3 bg-black/60 border border-white/10 rounded-xl text-white text-sm focus:border-gold outline-none transition-all placeholder:text-white/30"
            />
            <p className="text-[10px] text-white/40 mt-1">
              Para avisos urgentes sobre cambios de horario o cupos.
            </p>
          </div>

          {/* Fecha de Nacimiento */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-2">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              name="birth_date"
              defaultValue={profile?.birth_date || ""}
              className="w-full p-3 bg-black/60 border border-white/10 rounded-xl text-white text-sm focus:border-gold outline-none transition-all [color-scheme:dark]"
            />
            <p className="text-[10px] text-white/40 mt-1">
              Verificación de mayoría de edad (18+).
            </p>
          </div>
        </div>

        {/* Identidad de Género (Dato Sensible Facultativo - Ley 21.719) */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-white/70">
              Identidad de Género (Opcional)
            </label>
            <span className="text-[10px] text-white/40 font-mono">
              Dato protegido y no condicionante
            </span>
          </div>
          <select
            name="gender"
            defaultValue={profile?.gender || "prefiero_no_decir"}
            className="w-full p-3 bg-black/60 border border-white/10 rounded-xl text-white text-sm focus:border-gold outline-none transition-all cursor-pointer"
          >
            <option value="prefiero_no_decir">Prefiero no decir</option>
            <option value="femenino">Femenino</option>
            <option value="masculino">Masculino</option>
            <option value="no_binario">No binario</option>
            <option value="otro">Otro</option>
          </select>
          <p className="text-[10px] text-white/40 mt-1.5 leading-relaxed">
            Conforme a la Ley 21.719, este dato no condiciona tu acceso al estudio ni al contenido de la plataforma.
          </p>
        </div>

        {/* Botón de Guardar Cambios */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto bg-gold text-black text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-gold/10 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Guardando cambios...
              </>
            ) : (
              "Actualizar Mis Datos"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}