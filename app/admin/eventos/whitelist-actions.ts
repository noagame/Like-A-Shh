"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/authorize";
import { revalidatePath } from "next/cache";

function parseEmails(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[\n,;]+/)
        .map((value) => value.trim().toLowerCase())
        .filter((value) => value.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    )
  );
}

export async function addUsersToEventWhitelist(eventId: string, emailsRaw: string) {
  const { supabase } = await requireAdmin();

  if (!eventId) {
    throw new Error("Falta el identificador del evento.");
  }

  const emails = parseEmails(emailsRaw);

  if (emails.length === 0) {
    throw new Error("Debes ingresar al menos un correo válido.");
  }

  z.uuid().parse(eventId);
  if (emails.length > 100) throw new Error("Agrega como máximo 100 correos por operación.");
  const { data, error } = await supabase.rpc("add_event_whitelist", { target_event_id: eventId, invited_emails: emails });
  if (error) throw new Error("No se pudo guardar la lista. Comprueba cupos y perfiles antes de reintentar.");

  revalidatePath("/admin/eventos");
  revalidatePath("/mi-cuenta");
  revalidatePath("/mi-cuenta/explorar");
  return {
    success: true,
    registered: Number(data?.registered ?? 0),
    pending: Number(data?.pending ?? 0),
  };
}
