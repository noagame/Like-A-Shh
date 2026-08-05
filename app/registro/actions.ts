"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

const signUpSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  full_name: z.string().min(2, "Nombre demasiado corto"),
  accepted_privacy: z.literal("on", {
    errorMap: () => ({ message: "Debes aceptar la política de privacidad" }),
  }),
});

export async function signUp(formData: FormData) {
  const dataEntries = Object.fromEntries(formData);
  const parsed = signUpSchema.safeParse(dataEntries);

  if (!parsed.success) {
    const message = parsed.error.issues[0].message;
    redirect(`/registro?error=${encodeURIComponent(message)}`);
  }

  const { email, password, full_name } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/registro?error=${encodeURIComponent(error.message)}`);
  }

  // Evidencia de consentimiento explícito (Ley 21.719)
  if (data.user) {
    const headersList = await headers();
    const { error: consentError } = await supabase.from("consent_logs").insert({
      user_id: data.user.id,
      consent_type: "registro",
      accepted: true,
      policy_version: "privacidad-v1-2026-08",
      ip_address: headersList.get("x-forwarded-for") ?? "unknown",
    });

    if (consentError) {
      console.error("Error saving consent log:", consentError);
      // We might not want to block the whole flow if only consent logging fails, 
      // but for compliance it might be critical.
    }
  }

  redirect("/registro/completar-perfil");
}
