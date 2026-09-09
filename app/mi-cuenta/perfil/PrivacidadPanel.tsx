"use client";

import { useState, useTransition } from "react";
import { anonimizarDatos, eliminarCuentaTotal } from "./actions";

export default function PrivacidadPanel({
  consentLogs,
  isAnonymized,
}: {
  consentLogs: Array<{ consent_type: string; created_at: string; policy_version: string }>;
  isAnonymized: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);

  const handleAnonimizar = () => {
    if (!confirm("¿Deseas ocultar los datos opcionales de tu perfil? Podrás volver a completarlos después.")) return;
    startTransition(async () => {
      const res = await anonimizarDatos();
      if (res?.error) setMensaje(`Error: ${res.error}`);
      else setMensaje("Datos opcionales del perfil ocultados.");
    });
  };

  const handleEliminar = () => {
    if (!confirm("¿ESTÁS SEGURO? Esta acción borrará todas tus inscripciones, historial y cuenta permanentemente.")) return;
    startTransition(async () => {
      const form = new FormData();
      form.set("password", password);
      const result = await eliminarCuentaTotal(form);
      if (result?.error) setMensaje(result.error);
    });
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-lg font-bold text-gold">Privacidad y Derechos ARCO</h2>
        <p className="text-xs text-white/60 mt-1">
          Controla cómo se procesa tu información. Tienes derecho a la rectificación, ocultación del perfil y eliminación de cuenta.
        </p>
      </div>

      {mensaje && (
        <div className="p-3 bg-gold/10 border border-gold/30 rounded-lg text-xs text-gold">
          {mensaje}
        </div>
      )}

      {/* Estado Actual */}
      <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
        <div>
          <p className="text-sm font-semibold text-white">Estado de Identidad</p>
          <p className="text-xs text-white/50 mt-0.5">
            {isAnonymized ? "Datos opcionales ocultos" : "Perfil nominal estándar"}
          </p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-mono ${isAnonymized ? "bg-amber-500/20 text-amber-300" : "bg-green-500/20 text-green-300"}`}>
          {isAnonymized ? "Oculto" : "Activo"}
        </span>
      </div>

      {/* Acciones de Privacidad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Ocultar datos del perfil</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Oculta nombre, teléfono y género del perfil. Conservamos el correo, la fecha de nacimiento para validar edad y los registros asociados a tu cuenta; esto no anonimiza tu identidad.
            </p>
          </div>
          <button
            onClick={handleAnonimizar}
            disabled={isPending || isAnonymized}
            className="mt-4 bg-white/10 text-white hover:bg-white/20 text-xs font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
          >
            {isAnonymized ? "Datos ocultos" : "Ocultar datos"}
          </button>
        </div>

        <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/20 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-red-400 mb-1">Eliminar Cuenta y Datos</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Elimina tu acceso y los datos asociados de la aplicación. Confirma tu contraseña para continuar.
            </p>
          </div>
          <label className="mt-3 text-xs">Contraseña actual
            <input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full rounded border border-white/20 bg-black p-2" />
          </label>
          <button
            onClick={handleEliminar}
            disabled={isPending || !password}
            className="mt-4 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer"
          >
            Eliminar Definitivamente
          </button>
        </div>
      </div>

      {/* Registro de Consentimientos (Trazabilidad) */}
      <div className="pt-4 border-t border-white/10">
        <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider mb-3">
          Historial de Consentimientos Registrados
        </h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {consentLogs.map((log, idx) => (
            <div key={idx} className="flex justify-between items-center text-[11px] p-2 bg-black/30 rounded-lg border border-white/5 text-white/50">
              <span className="font-mono text-white/70">{log.consent_type}</span>
              <span>{new Date(log.created_at).toLocaleDateString("es-CL")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}