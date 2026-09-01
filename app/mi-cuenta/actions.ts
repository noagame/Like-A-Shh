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
    .select("capacity, title")
    .eq("id", eventId)
    .single();

  const { count } = await supabase
    .from("attendances")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "registered");

  if (event?.capacity && count !== null && count >= event.capacity) {
    return { error: "Lo sentimos, el cupo para esta clase está completo." };
  }

  const { data: existingRecord } = await supabase
    .from("attendances")
    .select("id, status")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingRecord) {
    const { error: updateError } = await supabase
      .from("attendances")
      .update({ status: "registered", created_at: new Date().toISOString() })
      .eq("id", existingRecord.id);

    if (updateError) return { error: updateError.message };
  } else {
    const { error: insertError } = await supabase.from("attendances").insert({
      event_id: eventId,
      user_id: user.id,
      status: "registered",
    });

    if (insertError) return { error: insertError.message };
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