"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { validateEventDateRange } from "@/lib/event-date-validation";

export async function createClasePresencial(formData: FormData) {
  const supabase = await createClient();

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

  if (capacity <= 0) {
    redirect("/admin/clases-presenciales/nuevo?error=" + encodeURIComponent("Debe indicar un aforo válido para la clase presencial."));
  }

  let image_url: string | null = null;

  if (flyerFile && flyerFile.size > 0 && flyerFile.name !== "undefined") {
    try {
      const fileExt = flyerFile.name.split(".").pop() ?? "jpg";
      const fileName = `clase-presencial-${crypto.randomUUID()}.${fileExt}`;
      const filePath = `eventos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("eventos")
        .upload(filePath, flyerFile, { contentType: flyerFile.type });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from("eventos").getPublicUrl(filePath);
        image_url = publicUrlData.publicUrl;
      }
    } catch {
      image_url = null;
    }
  }

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
    redirect("/admin/clases-presenciales/nuevo?error=" + encodeURIComponent(error.message));
  }

  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("audit_log").insert({
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

  revalidatePath("/admin/eventos");
  revalidatePath("/mi-cuenta");
  revalidatePath("/mi-cuenta/explorar");
  revalidatePath("/");
  redirect("/admin/clases-presenciales/nuevo?success=" + encodeURIComponent("Clase presencial creada correctamente."));
}

export async function createPresencialClass(formData: FormData) {
  return createClasePresencial(formData);
}
