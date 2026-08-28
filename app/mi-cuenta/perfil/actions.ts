"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

const profileSchema = z.object({
  full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
  gender: z.enum(["femenino", "masculino", "no_binario", "prefiero_no_decir", "otro"]).optional(),
});

// 1. Rectificación de datos personales
export async function actualizarPerfil(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = profileSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone") || undefined,
    birth_date: formData.get("birth_date") || undefined,
    gender: formData.get("gender") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone || null,
      birth_date: parsed.data.birth_date || null,
      gender: parsed.data.gender || "prefiero_no_decir",
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/mi-cuenta");
  revalidatePath("/mi-cuenta/perfil");
  return { success: true };
}

// 2. Anonimización de datos personales (Ley 21.719)
export async function anonimizarDatos() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const anonId = `anon_${user.id.slice(0, 8)}`;

  // Se disocian los datos personales del perfil sin romper métricas agregadas
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: "Usuario Anonimizado",
      phone: null,
      birth_date: null,
      gender: "prefiero_no_decir",
      is_anonymized: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  const headerList = await headers();
  await supabase.from("consent_logs").insert({
    user_id: user.id,
    consent_type: "solicitud_anonimizacion_ley21719",
    accepted: true,
    policy_version: "politica-privacidad-v2-ley21719-2026",
    ip_address: headerList.get("x-forwarded-for") ?? "unknown",
  });

  revalidatePath("/mi-cuenta");
  return { success: true };
}

// 3. Derecho de Supresión Total (Eliminación de cuenta y datos)
export async function eliminarCuentaTotal() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Registro de consentimiento antes de eliminar registros
  const headerList = await headers();
  await supabase.from("consent_logs").insert({
    user_id: user.id,
    consent_type: "supresion_definitiva_cuenta",
    accepted: true,
    policy_version: "politica-privacidad-v2-ley21719-2026",
    ip_address: headerList.get("x-forwarded-for") ?? "unknown",
  });

  // Limpieza de inscripciones y perfil (Auth cascade o RPC en Supabase)
  await supabase.from("attendances").delete().eq("user_id", user.id);
  await supabase.from("profiles").delete().eq("id", user.id);
  await supabase.auth.signOut();

  redirect("/?cuenta_eliminada=1");
}