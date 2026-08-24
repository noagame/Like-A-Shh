import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { updateUser } from "../../actions";

export default async function EditarUsuarioPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    // Buscamos los datos actuales del usuario por ID
    const { data: user, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !user) {
        notFound();
    }

    // Enlazamos la Server Action pasándole el ID específico
    async function handleUpdate(formData: FormData) {
        "use server";
        await updateUser(id, formData);
    }

    return (
        <div className="max-w-xl mx-auto p-6 bg-neutral-900 border border-neutral-800 rounded-lg text-white mt-10">
            <h1 className="text-2xl font-bold mb-6">Editar usuario</h1>

            <form action={handleUpdate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1">Nombre</label>
                    <input
                        name="name"
                        type="text"
                        defaultValue={user.name || user.nombre || ""}
                        required
                        className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1">Correo electrónico</label>
                    <input
                        name="email"
                        type="email"
                        defaultValue={user.email || user.correo || ""}
                        required
                        className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1">Rol</label>
                    <select
                        name="role"
                        defaultValue={user.role || user.rol || "user"}
                        className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                    </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <a
                        href="/admin/usuarios"
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