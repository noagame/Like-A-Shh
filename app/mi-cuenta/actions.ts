"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function attendEvent(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId)) return { error: "Evento inválido." };
  const { error } = await supabase.rpc("reserve_event", { target_event_id: eventId });
  if (error) return { error: "No se pudo reservar. Comprueba los cupos y que tu perfil esté completo." };

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