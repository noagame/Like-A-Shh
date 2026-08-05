"use server";
export async function attendEvent(eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: event } = await supabase
    .from("events").select("capacity").eq("id", eventId).single();
  const { count } = await supabase
    .from("attendances")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "registered");

  if (event?.capacity && count && count >= event.capacity) {
    return { error: "Cupo lleno" };
  }

  const { error } = await supabase.from("attendances").insert({
    event_id: eventId,
    user_id: user.id,
  });
  return { error: error?.message ?? null };
}