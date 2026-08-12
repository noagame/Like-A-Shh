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
  <div className="flex">
    <NavBar />
    <div className="admin-shell min-h-screen px-4 sm:px-8 py-8 bg-black text-white">
      {children}
    </div>
  </div>);
}