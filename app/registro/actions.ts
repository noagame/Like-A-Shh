"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

const signUpSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  full_name: z.string().min(2, "Nombre demasiado corto"),
  accepted_privacy: z.literal("on", { error: "Debes aceptar la política de privacidad" }),
});

// Función para verificar disponibilidad del correo
export async function checkEmailAvailable(email: string): Promise<{ available: boolean; error?: string }> {
  const emailParsed = z.string().email().safeParse(email);
  if (!emailParsed.success) {
    return { available: false, error: "Formato de correo inválido" };
  }

  const supabase = await createClient();

  // Consulta en la tabla profiles pública vinculada a auth.users
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (error) {
    return { available: true }; // Fallback tolerante ante fallos de lectura
  }

  return { available: !data };
}

export async function signUp(formData: FormData): Promise<{ error: string } | void> {
  const dataEntries = Object.fromEntries(formData);
  const parsed = signUpSchema.safeParse(dataEntries);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password, full_name } = parsed.data;
  const cleanEmail = email.toLowerCase().trim();
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.likeashh.cl";

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: { full_name },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered") || error.status === 422) {
      return { error: "Este correo ya se encuentra registrado. Inicia sesión o recupera tu clave." };
    }
    return { error: error.message };
  }

  // Detección de usuario existente cuando Supabase enmascara el error
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return { error: "Este correo electrónico ya está en uso. Por favor inicia sesión." };
  }

  // Registro de consentimiento explícito y trazabilidad (Ley 21.719)
  if (data.user) {
    try {
      const headersList = await headers();
      await supabase.from("consent_logs").insert({
        user_id: data.user.id,
        consent_type: "registro_y_privacidad",
        accepted: true,
        policy_version: "politica-privacidad-v2-ley21719-2026",
        ip_address: headersList.get("x-forwarded-for") ?? "unknown",
      });
    } catch (e) {
      console.warn("No se pudo registrar log de consentimiento:", e);
    }
  }

  redirect("/registro/completar-perfil");
}