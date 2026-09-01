import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "@/app/login/actions";

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

      {/* Header / Navbar Integrado */}
      <header className="sticky top-0 z-40 bg-[#09090b]/80 backdrop-blur-md border-b border-white/[0.06] transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Retorno al Sitio / Identidad */}
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2.5 text-white/60 hover:text-white transition-colors group"
                title="Volver a la página principal"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 group-hover:border-amber-400/40 transition-colors">
                  <Image
                    src="/assets/logo/logo_likeashh.jpg"
                    alt="Logo Like a Shh"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="hidden sm:inline text-xs tracking-wider uppercase text-white/40 group-hover:text-white/70 transition-colors">
                  Sitio Principal
                </span>
              </Link>

              <div className="h-4 w-px bg-white/10 hidden sm:block" />

              <div>
                <p className="text-[11px] text-white/40 leading-none">Mi Espacio</p>
                <p className="text-sm font-medium text-white/90 truncate max-w-[150px] sm:max-w-xs">
                  {userName}
                </p>
              </div>
            </div>

            {/* Navegación Interna */}
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/mi-cuenta"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/[0.04] transition-all"
              >
                Resumen
              </Link>
              <Link
                href="/mi-cuenta/clases"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/[0.04] transition-all"
              >
                Mis Clases
              </Link>
              <Link
                href="/mi-cuenta/galeria"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/[0.04] transition-all"
              >
                Galeria
              </Link>
              <Link
                href="/mi-cuenta/perfil"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/[0.04] transition-all"
              >
                Mi Perfil
              </Link>
              <Link
                href="/mi-cuenta/explorar"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/[0.04] transition-all"
              >
                Explorar
              </Link>
            </nav>

      
            {/* Acción de Salida */}
            <div className="flex items-center">
              <form action={signOut}>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/40 hover:text-red-300 hover:bg-red-500/[0.05] transition-all cursor-pointer"
                >
                  Salir
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal de la Vista */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}