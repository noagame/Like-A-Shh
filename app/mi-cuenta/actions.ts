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

  const { data: event } = await supabase
    .from("events")
    .select("capacity")
    .eq("id", eventId)
    .single();

  const { count } = await supabase
    .from("attendances")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "registered");

  if (event?.capacity && count !== null && count >= event.capacity) {
    return { error: "Cupo lleno" };
  }

  const { error } = await supabase.from("attendances").insert({
    event_id: eventId,
    user_id: user.id,
  });

  revalidatePath("/mi-cuenta/clases");
  return { error: error?.message ?? null };
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

  revalidatePath("/mi-cuenta/clases");
  return { error: error?.message ?? null };
}