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

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 selection:bg-amber-500/20 selection:text-amber-300 overflow-x-hidden">
      {/* Luces ambientales de fondo */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -left-16 top-0 h-72 w-72 rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-amber-500/5 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-violet-500/5 blur-[140px]" />
      </div>

      {/* Botón flotante / Barra lateral de navegación */}
      <NavBar />

      {/* Contenedor principal: En móvil pt-20 px-4 (centrado bajo el botón), en escritorio sm:pl-24 sm:pt-8 */}
      <div className="admin-shell relative z-10 min-h-screen w-full max-w-7xl mx-auto px-4 pt-20 pb-12 sm:px-8 sm:pt-8 sm:pl-24">
        {children}
      </div>
    </div>
  );
}