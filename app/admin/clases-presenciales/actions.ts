"use server";

import { uploadFlyer, rollbackFlyer } from "@/lib/infrastructure/factories/flyer";
import { requireAdmin } from "@/lib/auth/authorize";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { validateEventDateRange } from "@/lib/event-date-validation";

export async function createClasePresencial(formData: FormData) {
  const { supabase } = await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const start_time = String(formData.get("start_time") ?? "").trim();
  const end_time = String(formData.get("end_time") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const capacity = Number(formData.get("capacity") ?? 0);
  const flyerFile = formData.get("flyer") as File | null;

  if (!title || !start_time || !end_time || !location) {
    redirect("/admin/clases-presenciales/nuevo?error=" + encodeURIComponent("Completa título, fecha, horario y ubicación."));
  }

  try {
    validateEventDateRange(start_time, end_time);
  } catch (error) {
    redirect("/admin/clases-presenciales/nuevo?error=" + encodeURIComponent((error as Error).message));
  }

  if (!Number.isInteger(capacity) || capacity <= 0) {
    redirect("/admin/clases-presenciales/nuevo?error=" + encodeURIComponent("Debe indicar un aforo válido para la clase presencial."));
  }

  const flyer = await uploadFlyer(supabase, flyerFile, "eventos", "eventos");
  const image_url = flyer?.url ?? null;

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .ilike("name", "%presencial%")
    .maybeSingle();

  const { data: createdEvent, error } = await supabase
    .from("events")
    .insert({
      title: `Clase presencial - ${title}`,
      description: description || "Clase presencial programada por Like a Shh.",
      start_time,
      end_time,
      location,
      capacity,
      category_id: category?.id ?? null,
      status: "published",
      image_url,
    })
    .select("id, title")
    .single();

  if (error) {
    await rollbackFlyer(supabase, flyer);
    redirect("/admin/clases-presenciales/nuevo?error=" + encodeURIComponent(error.message));
  }

  const { data: { user } } = await supabase.auth.getUser();
  const { error: auditError } = await supabase.from("audit_log").insert({
    actor_id: user?.id ?? null,
    action: "create_clase_presencial",
    metadata: {
      event_id: createdEvent.id,
      title: createdEvent.title,
      location,
      capacity,
      has_flyer: Boolean(image_url),
    },
  });

  if (auditError) throw new Error("La clase se creó, pero no se pudo registrar su auditoría. Revisa el panel antes de reintentar.");
  revalidatePath("/admin/eventos");
  revalidatePath("/mi-cuenta");
  revalidatePath("/mi-cuenta/explorar");
  revalidatePath("/");
  redirect("/admin/clases-presenciales/nuevo?success=" + encodeURIComponent("Clase presencial creada correctamente."));
}

export async function createPresencialClass(formData: FormData) {
  return createClasePresencial(formData);
}
