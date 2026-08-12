"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createEvent(formData: FormData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .insert({
      title: formData.get("title"),
      description: formData.get("description"),
      category_id: formData.get("category_id") || null,
      start_time: formData.get("start_time"),
      end_time: formData.get("end_time"),
      location: formData.get("location"),
      capacity: formData.get("capacity") ? Number(formData.get("capacity")) : null,
      status: formData.get("status") ?? "draft",
    })
    .select()
    .single();

  if (error) {
    redirect(`/admin/eventos/nuevo?error=${encodeURIComponent(error.message)}`);
  }

  // Trazabilidad de acciones administrativas (Ley 21.719 — poder acreditar
  // quién trató qué dato y cuándo)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.from("audit_log").insert({
    actor_id: user?.id,
    action: "create_event",
    metadata: { event_id: data.id, title: data.title },
  });

  revalidatePath("/admin/eventos");
  redirect("/admin/eventos");
}

export async function changeEventStatus(formData: FormData) {
  const supabase = await createClient();
  const event_id = formData.get("event_id") as string;
  const status = formData.get("status") as string;

  if (!event_id || !status) return;

  const { error } = await supabase
    .from("events")
    .update({ status })
    .eq("id", event_id);

  if (error) {
    console.error("Error al actualizar estado:", error.message);
    return;
  }

  // Trazabilidad de la acción
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("audit_log").insert({
    actor_id: user?.id,
    action: "change_event_status",
    metadata: { event_id, status },
  });

  revalidatePath("/admin/eventos");
}

export async function deleteEvent(formData: FormData) {
  const supabase = await createClient();
  const event_id = formData.get("event_id") as string;

  if (!event_id) return;

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", event_id);

  if (error) {
    console.error("Error al eliminar evento:", error.message);
    return;
  }

  // Trazabilidad de la acción
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("audit_log").insert({
    actor_id: user?.id,
    action: "delete_event",
    metadata: { event_id },
  });

  revalidatePath("/admin/eventos");
}