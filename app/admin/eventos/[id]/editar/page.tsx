import { revalidatePath } from "next/cache";
import { uploadFlyer, rollbackFlyer } from "@/lib/infrastructure/factories/flyer";
import { parseEventLocation, parsePurchaseUrl } from "@/lib/event-links";
import ActivityPending from "../../ActivityPending";
import { requireAdmin } from "@/lib/auth/authorize";
import { notFound, redirect } from "next/navigation";
import LocationInput from "../../nuevo/LocationInput";
import EventWhitelistManager from "../../EventWhitelistManager";
import { validateEventDateRange } from "@/lib/event-date-validation";

export default async function EditarEventoPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{ error?: string }>;
}) {
    const { id } = await params;
    const { error: searchError } = searchParams ? await searchParams : { error: undefined };
    const { supabase } = await requireAdmin();

    // 1. Buscamos el evento actual en la base de datos
    const { data: event, error: fetchError } = await supabase
        .from("events")
        .select("*, categories(name)")
        .eq("id", id)
        .single();

    if (fetchError || !event) {
        notFound();
    }


    async function updateEvent(formData: FormData) {
        "use server";
        const { supabase } = await requireAdmin();
        let errorMessage: string | null = null;
        let newFlyer: Awaited<ReturnType<typeof uploadFlyer>> = null;
        let committed = false;

        try {
            // Leer nuevamente: no confiar en campos ocultos para la imagen anterior.
            const { data: current, error: readError } = await supabase
                .from("events")
                .select("id, image_url, purchase_url, categories(name)")
                .eq("id", id)
                .single();
            if (readError || !current) throw new Error("No se encontró el evento.");

            const title = String(formData.get("title") ?? "").trim();
            const start_time = String(formData.get("start_time") ?? "");
            const end_time = String(formData.get("end_time") ?? "");
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
            validateEventDateRange(start_time, end_time);

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
            if (file instanceof File && file.size > 0) {
                newFlyer = await uploadFlyer(supabase, file, "eventos", "flyers");
            }

            const { data: updated, error: updateError } = await supabase
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
                    ...(newFlyer ? { image_url: newFlyer.url } : {}),
                })
                .eq("id", id)
                .select("id")
                .single();
            if (updateError || !updated) throw new Error("No se pudo actualizar el evento.");
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
        redirect("/admin/eventos");
    }

    return (
        <div className="max-w-3xl mx-auto p-6 bg-neutral-900 border border-neutral-800 rounded-lg text-white mt-10">
            <h1 className="text-2xl font-bold mb-6">Editar evento</h1>

            {searchError ? (
                <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {searchError}
                </div>
            ) : null}

            <form action={updateEvent} className="space-y-4">
                <ActivityPending message="Espera, estamos guardando los cambios" />
                <div>
                    <p className="text-sm text-neutral-400">Flyer actual</p>
                    {event.image_url ? (
                        <a href={event.image_url} target="_blank" rel="noopener noreferrer" className="text-amber-300 underline">Ver imagen actual ↗</a>
                    ) : <p className="text-sm text-neutral-500">Sin imagen</p>}
                    <label htmlFor="edit-flyer" className="mt-3 block text-sm text-neutral-400">Reemplazar flyer (PNG, JPEG o WebP; máximo 5 MB)</label>
                    <input id="edit-flyer" name="flyer" type="file" accept="image/png,image/jpeg,image/webp" className="mt-2 block w-full" />
                    <p className="mt-1 text-xs text-neutral-500">Sin un archivo nuevo se conserva la imagen actual.</p>
                </div>
                {event.categories?.name === "Evento" && (
                    <div>
                        <label htmlFor="edit-purchase-url" className="block text-sm text-neutral-400">Enlace de compra (opcional)</label>
                        <input id="edit-purchase-url" name="purchase_url" type="url" defaultValue={event.purchase_url ?? ""} placeholder="https://..."
                            className="w-full rounded border border-neutral-700 bg-neutral-800 p-2 text-white" />
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1">Título</label>
                    <input
                        name="title"
                        type="text"
                        defaultValue={event.title}
                        required
                        className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1">Descripción</label>
                    <textarea
                        name="description"
                        defaultValue={event.description || ""}
                        className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-white h-24 focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Inicio</label>
                        <input
                            name="start_time"
                            type="datetime-local"
                            defaultValue={event.start_time ? event.start_time.slice(0, 16) : ""}
                            required
                            className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Término</label>
                        <input
                            name="end_time"
                            type="datetime-local"
                            defaultValue={event.end_time ? event.end_time.slice(0, 16) : ""}
                            required
                            className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div>
                    {/* Usamos tu LocationInput que ya tiene integrado el autocompletado y el backend local */}
                    <LocationInput name="location" label="Ubicación" defaultValue={event.location ?? ""}
                        autocomplete={!["Clase Particular Online", "Clase Online", "Online"].includes(event.categories?.name ?? "")} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Cupo (opcional)</label>
                        <input
                            name="capacity"
                            type="number"
                            defaultValue={event.capacity || ""}
                            className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Estado</label>
                        <select
                            name="status"
                            defaultValue={event.status}
                            className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="draft">Borrador</option>
                            <option value="published">Publicado</option>
                            <option value="cancelled">Cancelado</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <a
                        href="/admin/eventos"
                        className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded text-sm text-white transition"
                    >
                        Cancelar
                    </a>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-white text-black font-medium hover:bg-gray-200 rounded text-sm transition"
                    >
                        Guardar cambios
                    </button>
                </div>
            </form>

            <EventWhitelistManager eventId={id} />
        </div>
    );
}