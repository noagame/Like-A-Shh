"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getSiteUrl } from "@/lib/auth/site-url";
import { allowAuthRequest } from "@/lib/auth/request-limit";

// Validaciones con Zod
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Ingresa un correo electrónico válido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

const signUpSchema = z
  .object({
    full_name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
    email: z.string().trim().toLowerCase().email("Correo electrónico inválido"),
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
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  if (!await allowAuthRequest("login", parsed.data.email)) return { error: "Acceso temporalmente limitado. Intenta más tarde." };
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
  const siteUrl = getSiteUrl();

  if (!await allowAuthRequest("signup", cleanEmail)) return { error: "Acceso temporalmente limitado. Intenta más tarde." };
  const { error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: { full_name, accepted_privacy: true, privacy_policy_version: "privacidad-v3-2026-09" },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      redirect(`/auth/verificar-email?email=${encodeURIComponent(cleanEmail)}`);
    }
    return { error: error.message };
  }

  redirect(`/auth/verificar-email?email=${encodeURIComponent(cleanEmail)}`);
}

export async function resetPassword(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const parsedEmail = z.string().trim().toLowerCase().email().safeParse(formData.get("email"));
  if (!parsedEmail.success) {
    return { error: "Ingresa un correo electrónico válido." };
  }

  const email = parsedEmail.data;
  const supabase = await createClient();
  const siteUrl = getSiteUrl();

  if (!await allowAuthRequest("recovery", email)) return { error: "Acceso temporalmente limitado. Intenta más tarde." };
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/auth/actualizar-password`,
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