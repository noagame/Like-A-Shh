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
    <div className="min-h-screen bg-black text-white">
      <NavBar />
      {/* pl-8 (no pl-64): el nav está "fixed" y colapsado a 1rem de ancho,
          así que el contenido no necesita ceder espacio permanente — el
          nav se expande ENCIMA del contenido (overlay) al hacer hover,
          no lo empuja. Si prefieres que empuje el contenido en vez de
          superponerse, dímelo y cambiamos a un layout con margin dinámico. */}
      <div className="admin-shell min-h-screen px-4 sm:px-8 py-8 pl-8">
        {children}
      </div>
    </div>
  );
}
