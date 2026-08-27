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
      <div className="admin-shell min-h-screen px-4 py-8 pl-20 sm:px-8 sm:pl-24">
        {children}
      </div>
    </div>
  );
}
