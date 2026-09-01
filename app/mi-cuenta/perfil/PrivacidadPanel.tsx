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
  const [mensaje, setMensaje] = useState<string | null>(null);

  const handleAnonimizar = () => {
    if (!confirm("¿Deseas anonimizar tus datos? Tu nombre y datos sensibles serán sustituidos de forma irreversible.")) return;
    startTransition(async () => {
      const res = await anonimizarDatos();
      if (res?.error) setMensaje(`Error: ${res.error}`);
      else setMensaje("Datos anonimizados exitosamente.");
    });
  };

  const handleEliminar = () => {
    if (!confirm("¿ESTÁS SEGURO? Esta acción borrará todas tus inscripciones, historial y cuenta permanentemente.")) return;
    startTransition(async () => {
      await eliminarCuentaTotal();
    });
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-lg font-bold text-gold">Privacidad y Derechos ARCO</h2>
        <p className="text-xs text-white/60 mt-1">
          Controla cómo se procesa tu información. Tienes derecho a la rectificación, anonimización y supresión permanente.
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
            {isAnonymized ? "Perfil disociado / anónimo para reportes" : "Perfil nominal estándar"}
          </p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-mono ${isAnonymized ? "bg-amber-500/20 text-amber-300" : "bg-green-500/20 text-green-300"}`}>
          {isAnonymized ? "Anonimizado" : "Activo"}
        </span>
      </div>

      {/* Acciones de Privacidad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Anonimizar Mis Datos</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Oculta tu nombre e información de contacto en métricas y tablas históricas manteniendo tu acceso.
            </p>
          </div>
          <button
            onClick={handleAnonimizar}
            disabled={isPending || isAnonymized}
            className="mt-4 bg-white/10 text-white hover:bg-white/20 text-xs font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
          >
            {isAnonymized ? "Ya anonimizado" : "Solicitar Anonimización"}
          </button>
        </div>

        <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/20 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-red-400 mb-1">Eliminar Cuenta y Datos</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Borra completamente tu cuenta, historial de clases y registros personales de los servidores.
            </p>
          </div>
          <button
            onClick={handleEliminar}
            disabled={isPending}
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