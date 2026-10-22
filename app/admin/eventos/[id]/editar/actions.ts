"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/authorize";
import { parseEventLocation, parsePurchaseUrl } from "@/lib/event-links";
import { validateEventDateRange } from "@/lib/event-date-validation";
import { removeUnusedEventFlyer } from "@/lib/event-image";
import { uploadFlyer, rollbackFlyer } from "@/lib/infrastructure/factories/flyer";

export async function updateEvent(id: string, formData: FormData) {
    const { supabase } = await requireAdmin();
    let errorMessage: string | null = null;
    let newFlyer: Awaited<ReturnType<typeof uploadFlyer>> = null;
    let committed = false;
    let previousImage: string | null = null;
    let imageChanged = false;

    try {
        // Leer nuevamente: no confiar en campos ocultos para la imagen anterior.
        const { data: current, error: readError } = await supabase
            .from("events")
            .select("id, image_url, purchase_url, start_time, end_time, categories(name)")
            .eq("id", id)
            .single();
        if (readError || !current) throw new Error("No se encontró el evento.");
        previousImage = current.image_url;

        const title = String(formData.get("title") ?? "").trim();
        const startInput = String(formData.get("start_time") ?? "");
        const endInput = String(formData.get("end_time") ?? "");
        const datesUnchanged = startInput === current.start_time?.slice(0, 16)
            && endInput === current.end_time?.slice(0, 16);
        // Preserve exact timestamps when only editing content, even for past events.
        const start_time = datesUnchanged ? current.start_time : startInput;
        const end_time = datesUnchanged ? current.end_time : endInput;
        const status = String(formData.get("status") ?? "draft");
        const capacityText = String(formData.get("capacity") ?? "").trim();
        const capacity = capacityText ? Number(capacityText) : null;
        if (!title) throw new Error("El título es obligatorio.");
        if (!["draft", "published", "cancelled"].includes(status)) {
            throw new Error("El estado no es válido.");
        }
        if (capacity !== null && (!Number.isInteger(capacity) || capacity < 1)) {
            throw new Error("El cupo debe ser un entero mayor que cero.");
        }
        if (!datesUnchanged) validateEventDateRange(start_time, end_time);

        // El formulario es compartido con clases: no validar una sala online como Maps.
        const categoryValue = current.categories as unknown;
        const category = (Array.isArray(categoryValue) ? categoryValue[0] : categoryValue) as
            { name?: string } | null;
        const online = ["Clase Particular Online", "Clase Online", "Online"]
            .includes(category?.name ?? "");
        const location = online
            ? String(formData.get("location") ?? "").trim()
            : parseEventLocation(formData.get("location"));
        const purchase_url = category?.name === "Evento"
            ? parsePurchaseUrl(formData.get("purchase_url"))
            : current.purchase_url;

        const file = formData.get("flyer");
        const removeImage = formData.get("remove_flyer") === "on";
        if (removeImage && file instanceof File && file.size > 0) {
            throw new Error("Elige reemplazar o quitar la imagen, no ambas opciones a la vez.");
        }
        if (file instanceof File && file.size > 0) {
            newFlyer = await uploadFlyer(supabase, file, "eventos", "flyers");
        }
        imageChanged = Boolean(newFlyer) || (removeImage && Boolean(current.image_url));

        let updateQuery = supabase
            .from("events")
            .update({
                title,
                description: String(formData.get("description") ?? ""),
                start_time,
                end_time,
                location,
                capacity,
                status,
                purchase_url,
                ...(imageChanged ? { image_url: newFlyer?.url ?? null } : {}),
            })
            .eq("id", id);
        if (imageChanged) {
            // A simultaneous edit must not remove or replace a newer image.
            updateQuery = current.image_url
                ? updateQuery.eq("image_url", current.image_url)
                : updateQuery.is("image_url", null);
        }
        const { data: updated, error: updateError } = await updateQuery
            .select("id")
            .single();
        if (updateError || !updated) throw new Error("No se pudo actualizar el evento. Actualiza la página antes de reintentar.");
        committed = true;
    } catch (error) {
        errorMessage = error instanceof Error ? error.message : "No se pudo guardar.";
        if (newFlyer && !committed) {
            try {
                await rollbackFlyer(supabase, newFlyer);
            } catch {
                errorMessage += " No se pudo retirar la imagen recién subida; solicita revisar Storage.";
            }
        }
    }

    // redirect lanza una señal interna: debe quedar fuera del try/catch.
    if (errorMessage) {
        redirect(`/admin/eventos/${id}/editar?error=${encodeURIComponent(errorMessage)}`);
    }
    revalidatePath("/admin/eventos");
    revalidatePath(`/admin/eventos/${id}/editar`);
    revalidatePath("/");
    revalidatePath("/mi-cuenta");
    if (imageChanged && previousImage) {
        try {
            // Only remove the old file after its replacement/removal was persisted.
            await removeUnusedEventFlyer(supabase, previousImage);
        } catch {
            const warning = "Los cambios se guardaron, pero no se pudo retirar el archivo anterior de Storage. Revisa sus permisos antes de limpiar el archivo.";
            redirect(`/admin/eventos/${id}/editar?warning=${encodeURIComponent(warning)}`);
        }
    }
    redirect("/admin/eventos");
}
