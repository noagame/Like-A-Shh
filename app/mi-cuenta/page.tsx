import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "@/app/login/actions";
import Link from "next/link";

export default async function MiCuentaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-white/50">Hola,</p>
          <p className="text-lg font-semibold text-gold">
            {profile?.full_name ?? user.email}
          </p>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-sm text-white/70 underline hover:text-gold transition-colors">
            Cerrar sesión
          </button>
        </form>
      </header>

      <nav className="flex gap-6 px-4 sm:px-8 py-3 border-b border-white/10 text-sm">
        <Link href="/mi-cuenta/clases" className="hover:text-gold transition-colors">Mis clases</Link>
        <Link href="/mi-cuenta/perfil" className="hover:text-gold transition-colors">Perfil</Link>
        <Link href="/mi-cuenta/privacidad" className="hover:text-gold transition-colors">Mis datos</Link>
      </nav>

      <main className="px-4 sm:px-8 py-8">{children}</main>
    </div>
  );
}