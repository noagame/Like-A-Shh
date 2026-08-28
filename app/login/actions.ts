"use server";

import { checkLoginRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";

  try {
    const { success } = await checkLoginRateLimit(ip);
    if (!success) {
    redirect("/login?error=Demasiados intentos, espera un minuto");
    } 
  } catch (error) {
    console.error("Rate limit failed", error);
    redirect("/login?error=Servicio temporalmente no disponible");
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Por favor ingresa tu correo y contraseña." };
  }

  const supabase = await createClient();
 const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/mi-cuenta");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}