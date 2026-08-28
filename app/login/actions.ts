"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { checkLoginRateLimit } from "@/lib/rate-limit";

// Validaciones con Zod
const loginSchema = z.object({
  email: z.string().email("Ingresa un correo electrónico válido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

const signUpSchema = z
  .object({
    full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Correo electrónico inválido"),
    password: z.string().min(8, "La contraseña debe tener mínimo 8 caracteres"),
    confirm_password: z.string().min(8, "Mínimo 8 caracteres"),
    accepted_privacy: z.literal("on", {
      error: "Debes aceptar la política de privacidad",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  });

export async function signIn(formData: FormData): Promise<{ error: string } | void> {
  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";

  try {
    const rateLimit = await checkLoginRateLimit(ip);
    if (!rateLimit.success) {
      return { error: "Demasiados intentos. Por favor espera 1 minuto." };
    }
  } catch (err) {
    console.warn("Rate limit bypass local:", err);
  }

  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.toLowerCase().trim(),
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message === "Invalid login credentials" ? "Credenciales incorrectas" : error.message };
  }

  redirect("/mi-cuenta");
}

export async function signUp(formData: FormData): Promise<{ error: string } | void> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { full_name, email, password } = parsed.data;
  const cleanEmail = email.toLowerCase().trim();
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: { full_name },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "Este correo ya se encuentra registrado." };
    }
    return { error: error.message };
  }

  if (data.user) {
    try {
      const headersList = await headers();
      await supabase.from("consent_logs").insert({
        user_id: data.user.id,
        consent_type: "registro",
        accepted: true,
        policy_version: "privacidad-v1-2026-08",
        ip_address: headersList.get("x-forwarded-for") ?? "unknown",
      });
    } catch (e) {
      console.warn("Consent log warning:", e);
    }
  }

  redirect(`/auth/verificar-email?email=${encodeURIComponent(cleanEmail)}`);
}

export async function resetPassword(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  if (!email || !z.string().email().safeParse(email).success) {
    return { error: "Ingresa un correo electrónico válido." };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/recuperar`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}