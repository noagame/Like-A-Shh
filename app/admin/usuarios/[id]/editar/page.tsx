import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { updateUser } from "../../actions";
import BackButton from "@/app/admin/components/BackButton";
import Link from "next/link";

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: user, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, is_anonymized")
    .eq("id", id)
    .single();

  if (error || !user) {
    notFound();
  }

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateUser(id, formData);
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 text-white">
      <BackButton />

      <div className="p-6 sm:p-8 bg-[#0d0d10] border border-white/10 rounded-2xl shadow-2xl space-y-6">
        <div>
          <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest">
            Ley Nº 21.719
          </span>
          <h1
            className="text-2xl font-bold text-white mt-1"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Configurar Usuario
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Modifica rol y parámetros de acceso del perfil.
          </p>
        </div>

        <form action={handleUpdate} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-medium text-white/70 mb-1.5">
              Nombre Completo
            </label>
            <input
              name="name"
              type="text"
              defaultValue={user.full_name || ""}
              required
              className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-white/70 mb-1.5">
              Teléfono / Contacto (Opcional)
            </label>
            <input
              name="phone"
              type="text"
              defaultValue={user.phone || ""}
              className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-white/70 mb-1.5">
              Rol de Acceso
            </label>
            <select
              name="role"
              defaultValue={user.role || "user"}
              className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:border-amber-400 focus:outline-none cursor-pointer"
            >
              <option value="user" className="bg-neutral-900">user (Alumna)</option>
              <option value="admin" className="bg-neutral-900">admin (Administrador)</option>
            </select>
          </div>

          <div className="flex justify-end items-center gap-3 pt-4 border-t border-white/10">
            <Link
              href="/admin/usuarios"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-xl text-xs shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}