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