import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NavBar from "./NavBar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user?.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return(
    <div className="admin-shell px-4 sm:px-8 py-8">
      {children}
      <div className="admin-header">
        <p className="text-sm text-white/50">Panel Administrador</p>
      </div>
      
      <span className="text-lg font-semibold text-gold">Bienvenido { profile?.full_name}</span>
      
      <div >
        Apartado de administración
      </div>

      <div>
        Abrir modal sobre el uso del panel de administración y sus funciones
      </div>
      
      <div className="admin-warning">
        <span className="text-red-500">
          Estamos Trabajando en el panel de administración. Por ahora, solo los administradores pueden acceder a esta sección.
        </span>
      </div>

    </div>
  );
}