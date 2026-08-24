import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { deleteUser } from "./actions";

export default async function UsuariosPage() {
    const supabase = await createClient();

    const { data: users, error } = await supabase
        .from("profiles")
        .select("*");

    return (
        <div className="p-6 text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-neutral-800 text-neutral-400 text-sm">
                            <th className="p-4">Nombre / Email</th>
                            <th className="p-4">Rol</th>
                            <th className="p-4">Fecha de registro</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {error && (
                            <tr>
                                <td colSpan={4} className="p-4 text-red-400 text-center">
                                    Error al cargar los usuarios: {error.message}
                                </td>
                            </tr>
                        )}

                        {users && users.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-4 text-neutral-400 text-center">
                                    No hay usuarios registrados todavía.
                                </td>
                            </tr>
                        )}

                        {users?.map((user) => {
                            const displayName =
                                user.name ||
                                user.nombre ||
                                user.email ||
                                user.correo ||
                                user.full_name ||
                                (user.id ? `ID: ${user.id.slice(0, 8)}...` : "Sin identificador");

                            const displayRole = user.role || user.rol || "user";
                            const displayDate = user.created_at || user.fecha_registro;

                            async function handleDelete() {
                                "use server";
                                await deleteUser(user.id);
                            }

                            return (
                                <tr key={user.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 text-sm">
                                    <td className="p-4 font-medium">{displayName}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-neutral-800 rounded text-xs text-neutral-300">
                                            {displayRole}
                                        </span>
                                    </td>
                                    <td className="p-4 text-neutral-400">
                                        {displayDate ? new Date(displayDate).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="p-4 text-right space-x-3">
                                        <Link
                                            href={`/admin/usuarios/${user.id}/editar`}
                                            className="text-amber-400 hover:underline text-sm font-medium"
                                        >
                                            Editar
                                        </Link>
                                        <form action={handleDelete} className="inline">
                                            <button
                                                type="submit"
                                                className="text-red-400 hover:underline text-sm font-medium bg-transparent border-none cursor-pointer"
                                            >
                                                Eliminar
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}