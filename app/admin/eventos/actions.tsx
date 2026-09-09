"use server";

import { uploadFlyer, rollbackFlyer } from "@/lib/infrastructure/factories/flyer";
import { requireAdmin } from "@/lib/auth/authorize";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { validateEventDateRange } from "@/lib/event-date-validation";
import { CommandInvoker } from "@/lib/application/commands/CommandInvoker";

export async function createEvent(formData: FormData) {
  const { supabase } = await requireAdmin();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const start_time = formData.get("start_time") as string;
  const end_time = formData.get("end_time") as string;
  const location = formData.get("location") as string;
  const capacity = formData.get("capacity") ? Number(formData.get("capacity")) : null;
  const category_id = formData.get("category_id") as string || null;
  const status = (formData.get("status") as string) || "published";
  const flyerFile = formData.get("flyer") as File | null;

  try {
    validateEventDateRange(start_time, end_time);
  } catch (error) {
    redirect(`/admin/eventos?error=${encodeURIComponent((error as Error).message)}`);
  }

  const flyer = await uploadFlyer(supabase, flyerFile, "eventos", "flyers");
  const image_url = flyer?.url ?? null;

  const commandInvoker = new CommandInvoker(supabase);

  const result = await commandInvoker.execute({
    actionName: "create_event",
    execute: async () => {
      const { data, error } = await supabase.from("events").insert({
        title,
        description,
        start_time,
        end_time,
        location,
        capacity,
        category_id,
        status,
        image_url,
      }).select("id, title").single();

      if (error) {
        await rollbackFlyer(supabase, flyer);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: { event_id: data.id, title: data.title, has_flyer: Boolean(image_url) },
      };
    },
  });

  if (!result.success) {
    redirect(`/admin/eventos?error=${encodeURIComponent(result.error ?? "No se pudo crear el evento.")}`);
  }

  revalidatePath("/admin/eventos");
  revalidatePath("/");
  redirect("/admin/eventos");
}

export async function changeEventStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const event_id = formData.get("event_id") as string;
  const status = formData.get("status") as string;

  if (!event_id || !status) return;

  const { error } = await supabase
    .from("events")
    .update({ status })
    .eq("id", event_id);

  if (error) {
    throw new Error("No se pudo actualizar el estado.");
  }

  // Trazabilidad de la acción
  const { data: { user } } = await supabase.auth.getUser();
  const { error: auditError } = await supabase.from("audit_log").insert({
    actor_id: user?.id,
    action: "change_event_status",
    metadata: { event_id, status },
  });

  if (auditError) throw new Error("La operación se completó, pero no se pudo registrar su auditoría. Revisa el resultado antes de reintentar.");
  revalidatePath("/admin/eventos");
}

export async function deleteEvent(formData: FormData) {
  const { supabase } = await requireAdmin();
  const event_id = formData.get("event_id") as string;

  if (!event_id) return;

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", event_id);

  if (error) {
    throw new Error("No se pudo eliminar el evento.");
  }

  // Trazabilidad de la acción
  const { data: { user } } = await supabase.auth.getUser();
  const { error: auditError } = await supabase.from("audit_log").insert({
    actor_id: user?.id,
    action: "delete_event",
    metadata: { event_id },
  });

  if (auditError) throw new Error("La operación se completó, pero no se pudo registrar su auditoría. Revisa el resultado antes de reintentar.");
  revalidatePath("/admin/eventos");
}