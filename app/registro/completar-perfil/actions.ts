"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

import { birthDateSchema } from "@/lib/validation/profile";

const perfilSchema = z.object({
  birth_date: birthDateSchema,
  // Opcional a propósito (Ley 21.719 — dato sensible, nunca obligatorio)
  gender: z
    .enum(["femenino", "masculino", "no_binario", "prefiero_no_decir", "otro"])
    .optional(),
  phone: z.string().optional(),
});

export async function completarPerfil(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const parsed = perfilSchema.safeParse({
    birth_date: formData.get("birth_date"),
    gender: formData.get("gender") || undefined,
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0].message;
    redirect(`/registro/completar-perfil?error=${encodeURIComponent(message)}`);
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      birth_date: parsed.data.birth_date,
      gender: parsed.data.gender ?? "prefiero_no_decir",
      phone: parsed.data.phone,
    })
    .eq("id", user.id);

  if (error) {
    redirect(`/registro/completar-perfil?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/mi-cuenta");
}