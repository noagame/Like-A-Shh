"use client";

import { useState, useTransition } from "react";
import { addUsersToEventWhitelist } from "./whitelist-actions";

export default function EventWhitelistManager({ eventId }: { eventId: string }) {
  const [emails, setEmails] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error" | "idle"; message: string }>(() => ({
    type: "idle",
    message: "",
  }));
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ type: "idle", message: "" });

    startTransition(async () => {
      try {
        const result = await addUsersToEventWhitelist(eventId, emails);
        setStatus({
          type: "success",
          message: `Invitaciones procesadas: ${result.registered} registradas y ${result.pending} pendientes.`,
        });
        setEmails("");
      } catch (error) {
        setStatus({
          type: "error",
          message: error instanceof Error ? error.message : "No se pudo procesar la whitelist.",
        });
      }
    });
  }

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">Whitelist</p>
          <h2 className="mt-1 text-lg font-semibold text-gold">Invitaciones por correo</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={emails}
          onChange={(event) => setEmails(event.target.value)}
          rows={6}
          placeholder="ana@correo.com, bruno@correo.com\ncarla@correo.com"
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold focus:outline-none"
        />

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-white/50">Se aceptan correos separados por coma o salto de línea.</p>
          <button
            type="submit"
            disabled={isPending || emails.trim().length === 0}
            className="rounded-full bg-gold px-4 py-2 text-sm font-bold text-black transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Procesando..." : "Guardar invitaciones"}
          </button>
        </div>
      </form>

      {status.type !== "idle" && (
        <div
          className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
            status.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/40 bg-red-500/10 text-red-200"
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}
