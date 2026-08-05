"use server";
export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("events").insert({
    title: formData.get("title"),
    description: formData.get("description"),
    category_id: formData.get("category_id"),
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time"),
    location: formData.get("location"),
    capacity: Number(formData.get("capacity")),
    status: formData.get("status") ?? "draft",
  });

  // Trazabilidad de acciones administrativas (recomendado, no solo para RRHH interno
  // sino porque la Ley 21.719 exige poder acreditar quién trató qué dato y cuándo)
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("audit_log").insert({
    actor_id: user?.id,
    action: "create_event",
    metadata: { title: formData.get("title") },
  });

  revalidatePath("/admin/eventos");
}