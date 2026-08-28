import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PerfilForm from "./PerfilForm";
import PrivacidadPanel from "./PrivacidadPanel";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone, birth_date, gender, is_anonymized")
    .eq("id", user.id)
    .single();

  const { data: consentLogs } = await supabase
    .from("consent_logs")
    .select("consent_type, created_at, policy_version")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gold" style={{ fontFamily: "var(--font-serif)" }}>
          Perfil y Mis Datos
        </h1>
        <p className="text-white/50 text-sm mt-1">
          Administra tu identidad y la protección de tus datos personales según la Ley Nº 21.719.
        </p>
      </div>

      {/* Formulario de Rectificación */}
      <PerfilForm profile={profile} userEmail={user.email || ""} />

      {/* Panel de Privacidad, Anonimización y Supresión */}
      <PrivacidadPanel consentLogs={consentLogs || []} isAnonymized={Boolean(profile?.is_anonymized)} />
    </div>
  );
}