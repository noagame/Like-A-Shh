import { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MiCuentaNavbar from "./MiCuentaNavbar";

export default async function MiCuentaLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const userName = profile?.full_name || user.email?.split("@")[0] || "Alumna";

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col selection:bg-amber-400/20 selection:text-amber-200">
      {/* Fondo ambiental suave */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/[0.02] blur-[150px] rounded-full" />
      </div>

      {/* Navbar con menú hamburguesa responsivo */}
      <MiCuentaNavbar userName={userName} />

      {/* Contenido Principal de la Vista */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}