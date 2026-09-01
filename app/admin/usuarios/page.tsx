import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { deleteUserAction } from "./actions";
import BackButton from "@/app/admin/components/BackButton";

export default async function UsuariosPage() {
  const supabase = await createClient();

  // Consulta tolerante a cualquier esquema existente
  const { data: users, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="w-full space-y-6 text-white">
      <BackButton />

      <div>
        <h1
          className="text-2xl sm:text-3xl font-bold text-amber-400"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Gestión de Usuarios
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
          Error al consultar usuarios: {error.message}
        </div>
      )}

      {users && users.length === 0 && (
        <div className="p-8 text-center text-neutral-400 bg-neutral-900/60 border border-neutral-800 rounded-xl text-xs">
          No hay usuarios registrados todavía.
        </div>
      )}

      {/* VISTA MÓVIL: Tarjetas individuales (< md) */}
      <div className="block md:hidden space-y-3">
        {users?.map((user: any) => {
          const displayName =
            user.full_name ||
            user.name ||
            user.nombre ||
            user.email ||
            (user.id ? `ID: ${user.id.slice(0, 6)}...` : "Sin identificador");
          const displayRole = user.role || user.rol || "user";
          const displayDate = user.created_at || user.fecha_registro;

          return (
            <div
              key={user.id}
              className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl space-y-3 shadow-lg"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-white/40 mt-0.5">
                    Registrado: {displayDate ? new Date(displayDate).toLocaleDateString("es-CL") : "—"}
                  </p>
                </div>
                <span
                  className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                    displayRole === "admin"
                      ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                      : "bg-white/10 text-white/70 border-white/10"
                  }`}
                >
                  {displayRole}
                </span>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-white/40 font-mono">
                  {user.is_anonymized ? "Anonimizado (21.719)" : "Activo"}
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/usuarios/${user.id}/editar`}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-amber-300 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Configurar
                  </Link>
                  <form action={deleteUserAction}>
                    <input type="hidden" name="user_id" value={user.id} />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* VISTA ESCRITORIO: Tabla estructurada (>= md) */}
      <div className="hidden md:block bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400 font-mono uppercase text-[10px]">
              <th className="p-4">Nombre / Identificador</th>
              <th className="p-4">Rol</th>
              <th className="p-4">Fecha de registro</th>
              <th className="p-4">Estado</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {users?.map((user: any) => {
              const displayName =
                user.full_name ||
                user.name ||
                user.nombre ||
                user.email ||
                (user.id ? `ID: ${user.id.slice(0, 8)}...` : "Sin identificador");
              const displayRole = user.role || user.rol || "user";
              const displayDate = user.created_at || user.fecha_registro;

              return (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-medium text-white">{displayName}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${
                        displayRole === "admin"
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          : "bg-neutral-800 text-neutral-300 border-neutral-700"
                      }`}
                    >
                      {displayRole}
                    </span>
                  </td>
                  <td className="p-4 text-neutral-400 font-mono text-[11px]">
                    {displayDate ? new Date(displayDate).toLocaleDateString("es-CL") : "—"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        user.is_anonymized
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-green-500/20 text-green-300"
                      }`}
                    >
                      {user.is_anonymized ? "Anonimizado" : "Activo"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/usuarios/${user.id}/editar`}
                        className="text-amber-400 hover:underline text-xs font-semibold"
                      >
                        Configurar
                      </Link>
                      <form action={deleteUserAction} className="inline">
                        <input type="hidden" name="user_id" value={user.id} />
                        <button
                          type="submit"
                          className="text-red-400 hover:underline text-xs font-semibold bg-transparent border-none cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </form>
                    </div>
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