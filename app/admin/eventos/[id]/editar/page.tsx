import ActivityPending from "../../ActivityPending";
import { requireAdmin } from "@/lib/auth/authorize";
import { notFound } from "next/navigation";
import LocationInput from "../../nuevo/LocationInput";
import EventWhitelistManager from "../../EventWhitelistManager";
import EventImageField from "./EventImageField";
import { updateEvent } from "./actions";

export default async function EditarEventoPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{ error?: string; warning?: string }>;
}) {
    const { id } = await params;
    const { error: searchError, warning } = searchParams ? await searchParams : { error: undefined, warning: undefined };
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


    const updateEventWithId = updateEvent.bind(null, id);

    return (
        <div className="max-w-3xl mx-auto p-6 bg-neutral-900 border border-neutral-800 rounded-lg text-white mt-10">
            <h1 className="text-2xl font-bold mb-6">Editar evento</h1>

            {searchError ? (
                <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {searchError}
                </div>
            ) : null}

            {warning ? (
                <div role="status" className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                    {warning}
                </div>
            ) : null}

            <form action={updateEventWithId} className="space-y-4">
                <ActivityPending message="Espera, estamos guardando los cambios" />
                <EventImageField key={event.image_url ?? "no-image"} imageUrl={event.image_url ?? null} />
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
