"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { notifyTelegramEnrollment } from "@/lib/notifications/telegram";

export async function attendEvent(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId)) return { error: "Evento inválido." };

  const { data: existingAttendance } = await supabase
    .from("attendances")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .eq("status", "registered")
    .maybeSingle();

  const { error } = await supabase.rpc("reserve_event", { target_event_id: eventId });
  if (error) return { error: "No se pudo reservar. Comprueba los cupos y que tu perfil esté completo." };

  // Las alertas son accesorias: una indisponibilidad de Telegram no invalida la reserva.
  if (!existingAttendance) {
    const [{ data: event }, { data: profile }] = await Promise.all([
      supabase
        .from("events")
        .select("title, start_time, location")
        .eq("id", eventId)
        .maybeSingle(),
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    ]);

    if (event) {
      await notifyTelegramEnrollment({
        studentName: profile?.full_name?.trim() || "Alumna sin nombre visible",
        eventTitle: event.title,
        startTime: event.start_time,
        location: event.location,
      }).catch(() => undefined);
    }
  }

  revalidatePath("/mi-cuenta");
  revalidatePath("/mi-cuenta/clases");
  revalidatePath("/mi-cuenta/explorar");
  return { error: null, success: true };
}

export async function cancelAttendance(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("attendances")
    .update({ status: "cancelled" })
    .eq("event_id", eventId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/mi-cuenta");
  revalidatePath("/mi-cuenta/clases");
  revalidatePath("/mi-cuenta/explorar");
  return { error: null, success: true };
}
