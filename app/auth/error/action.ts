"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function reenviarConfirmacion(formData: FormData) {
  const email = formData.get("email") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/auth/error?message=${encodeURIComponent(error.message)}&reenviado=0`);
  }

  redirect(`/auth/error?reenviado=1`);
}