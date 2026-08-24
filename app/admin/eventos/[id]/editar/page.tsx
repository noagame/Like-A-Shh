import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import LocationInput from "../../nuevo/LocationInput"; // <--- Importamos tu componente de mapa

export default async function EditarEventoPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Buscamos el evento actual en la base de datos
    const { data: event, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !event) {
        notFound();
    }

    // 2. Server Action para actualizar el evento
    async function updateEvent(formData: FormData) {
        "use server";
        const supabase = await createClient();

        await supabase
            .from("events")
            .update({
                title: formData.get("title"),
                description: formData.get("description"),
                category_id: formData.get("category_id") || null,
                start_time: formData.get("start_time"),
                end_time: formData.get("end_time"),
                location: formData.get("location"),
                capacity: formData.get("capacity") ? Number(formData.get("capacity")) : null,
                status: formData.get("status") ?? "draft",
            })
            .eq("id", id);

        redirect("/admin/eventos");
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-neutral-900 border border-neutral-800 rounded-lg text-white mt-10">
            <h1 className="text-2xl font-bold mb-6">Editar evento</h1>

            <form action={updateEvent} className="space-y-4">
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
                    <LocationInput name="location" label="Ubicación" />
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
        </div>
    );
}