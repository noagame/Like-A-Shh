"use server";

import { parseEventLocation, parsePurchaseUrl } from "@/lib/event-links";
import { uploadFlyer, rollbackFlyer } from "@/lib/infrastructure/factories/flyer";
import { requireAdmin } from "@/lib/auth/authorize";
import { revalidatePath } from "next/cache";
import { validateEventDateRange } from "@/lib/event-date-validation";
import { CommandInvoker } from "@/lib/application/commands/CommandInvoker";

export type CreateActivityResult = { success: true } | { success: false; error: string };

type ActivityKind = "event" | "online" | "presential";

const ACTIVITY_CATEGORIES: Record<ActivityKind, { name: string; aliases: string[]; color: string }> = {
  event: { name: "Evento", aliases: ["Evento"], color: "#D4AF37" },
  online: { name: "Clase Particular Online", aliases: ["Clase Particular Online", "Clase Online", "Online"], color: "#48CAE4" },
  presential: { name: "Clase Particular Presencial", aliases: ["Clase Particular Presencial", "Clase Presencial", "Presencial"], color: "#E0218A" },
};

async function resolveCategoryId(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  kind: ActivityKind,
) {
  const category = ACTIVITY_CATEGORIES[kind];

  for (const name of category.aliases) {
    const { data } = await supabase.from("categories").select("id").ilike("name", name).maybeSingle();
    if (data?.id) return data.id;
  }

  // Las categorías de sistema son necesarias para que la agenda tenga una
  // clasificación consistente. El administrador no debe crearlas a mano.
  const { data, error } = await supabase
    .from("categories")
    .insert({ name: category.name, color: category.color })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error("No se pudo preparar la categoría de esta actividad. Intenta nuevamente.");
  }

  return data.id;
}

async function createActivity(formData: FormData, kind: ActivityKind): Promise<CreateActivityResult> {
  const { supabase } = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const start_time = formData.get("start_time") as string;
  const end_time = formData.get("end_time") as string;
  let location: string;
  let purchase_url: string | null;
  try {
    location = kind === "online"
      ? String(formData.get("location") ?? "").trim()
      : parseEventLocation(formData.get("location"));
    purchase_url = kind === "event" ? parsePurchaseUrl(formData.get("purchase_url")) : null;
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Revisa los enlaces ingresados." };
  }
  const capacity = formData.get("capacity") ? Number(formData.get("capacity")) : null;
  let category_id: string;
  try {
    category_id = await resolveCategoryId(supabase, kind);
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
  const status = (formData.get("status") as string) || "published";
  const fileValue = formData.get("flyer");
  const flyerFile = fileValue instanceof File ? fileValue : null;
  if (!["draft", "published", "cancelled"].includes(status)) {
    return { success: false, error: "El estado no es válido." };
  }

  if (!title || !start_time || !end_time || (kind !== "event" && !location)) {
    return { success: false, error: "Completa todos los campos obligatorios." };
  }
  if (capacity !== null && (!Number.isInteger(capacity) || capacity < 1)) {
    return { success: false, error: "El cupo debe ser un número entero mayor que cero." };
  }
  try {
    validateEventDateRange(start_time, end_time);
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }

  let flyer: Awaited<ReturnType<typeof uploadFlyer>> = null;
  try {
    flyer = await uploadFlyer(supabase, flyerFile, "eventos", "flyers");
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
  const image_url = flyer?.url ?? null;

  const commandInvoker = new CommandInvoker(supabase);

  let persisted = false;
  let result: Awaited<ReturnType<CommandInvoker["execute"]>>;
  try {
    result = await commandInvoker.execute({
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
        purchase_url,
      }).select("id, title").single();

      if (error) {
        await rollbackFlyer(supabase, flyer);
        return { success: false, error: "No se pudo guardar la actividad." };
      }

      persisted = true;
      return {
        success: true,
        data: { event_id: data.id, title: data.title, has_flyer: Boolean(image_url) },
      };
    },
    });
  } catch (error) {
    if (persisted) {
      revalidatePath("/admin/eventos");
      revalidatePath("/");
      revalidatePath("/mi-cuenta");
      return { success: false, error: "La actividad se guardó, pero no se confirmó la auditoría. Actualiza la lista antes de reintentar." };
    }
    return { success: false, error: error instanceof Error ? error.message : "No se pudo guardar. Revisa la lista antes de reintentar." };
  }

  // Un error de auditoría no revierte un registro ya insertado.
  if (persisted) {
    revalidatePath("/admin/eventos");
    revalidatePath("/");
    revalidatePath("/mi-cuenta");
  }
  if (!result.success) {
    return { success: false, error: result.error ?? "No se pudo crear la actividad." };
  }

  return { success: true };
}

export async function createEvent(formData: FormData) {
  return createActivity(formData, "event");
}

export async function createOnlineClass(formData: FormData) {
  return createActivity(formData, "online");
}

export async function createPresentialClass(formData: FormData) {
  return createActivity(formData, "presential");
}

export async function changeEventStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const event_id = formData.get("event_id") as string;
  const status = formData.get("status") as string;

  if (!event_id || !["draft", "published", "cancelled"].includes(status)) {
    throw new Error("El evento o su estado no es válido.");
  }

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

  revalidatePath("/admin/eventos");
  revalidatePath("/");
  revalidatePath("/mi-cuenta");
  if (auditError) throw new Error("La operación se completó, pero no se pudo registrar su auditoría. Revisa el resultado antes de reintentar.");
}

export async function deleteEvent(formData: FormData) {
  const { supabase } = await requireAdmin();
  const event_id = formData.get("event_id") as string;

  if (!event_id) throw new Error("Falta el identificador de la actividad.");

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

  revalidatePath("/admin/eventos");
  revalidatePath("/");
  revalidatePath("/mi-cuenta");
  if (auditError) throw new Error("La operación se completó, pero no se pudo registrar su auditoría. Revisa el resultado antes de reintentar.");
}
