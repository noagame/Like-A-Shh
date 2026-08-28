"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function reenviarConfirmacion(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  if (!email) {
    redirect(`/auth/verificar-email?error=${encodeURIComponent("Ingresa un correo válido")}`);
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.likeashh.cl";

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/auth/verificar-email?email=${encodeURIComponent(email)}&error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/auth/verificar-email?email=${encodeURIComponent(email)}&reenviado=1`);
}