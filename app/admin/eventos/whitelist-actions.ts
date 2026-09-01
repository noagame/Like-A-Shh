"use server";

import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();

  if (!eventId) {
    throw new Error("Falta el identificador del evento.");
  }

  const emails = parseEmails(emailsRaw);

  if (emails.length === 0) {
    throw new Error("Debes ingresar al menos un correo válido.");
  }

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, email")
    .in("email", emails);

  if (profileError) {
    throw new Error(profileError.message);
  }

  const registeredProfiles = new Map((profiles ?? []).map((profile) => [profile.email, profile.id]));
  const pendingEmails = emails.filter((email) => !registeredProfiles.has(email));

  const attendeesToUpsert = (profiles ?? []).map((profile) => ({
    user_id: profile.id,
    event_id: eventId,
    status: "registered",
    created_at: new Date().toISOString(),
  }));

  if (attendeesToUpsert.length > 0) {
    const { error: attendanceError } = await supabase.from("attendances").upsert(attendeesToUpsert, {
      onConflict: "user_id,event_id",
      ignoreDuplicates: false,
    });

    if (attendanceError) {
      throw new Error(attendanceError.message);
    }
  }

  if (pendingEmails.length > 0) {
    const invitationRows = pendingEmails.map((email) => ({
      event_id: eventId,
      email,
      status: "pending",
      created_at: new Date().toISOString(),
    }));

    const { error: invitationError } = await supabase.from("event_invitations").upsert(invitationRows, {
      onConflict: "event_id,email",
      ignoreDuplicates: false,
    });

    if (invitationError) {
      throw new Error(invitationError.message);
    }
  }

  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("audit_log").insert({
    actor_id: user?.id ?? null,
    action: "add_event_whitelist",
    metadata: {
      event_id: eventId,
      emails,
      registered_count: attendeesToUpsert.length,
      pending_count: pendingEmails.length,
    },
  });

  revalidatePath("/admin/eventos");
  revalidatePath("/mi-cuenta");
  revalidatePath("/mi-cuenta/explorar");
  return {
    success: true,
    registered: attendeesToUpsert.length,
    pending: pendingEmails.length,
  };
}
