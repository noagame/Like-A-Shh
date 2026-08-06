"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const EDAD_MINIMA = 18;

const perfilSchema = z.object({
  birth_date: z.string().refine((val) => {
    const fecha = new Date(val);
    if (Number.isNaN(fecha.getTime())) return false;
    const hoy = new Date();
    const edad = hoy.getFullYear() - fecha.getFullYear();
    const cumplioEsteAno =
      hoy.getMonth() > fecha.getMonth() ||
      (hoy.getMonth() === fecha.getMonth() && hoy.getDate() >= fecha.getDate());
    return (cumplioEsteAno ? edad : edad - 1) >= EDAD_MINIMA;
  }, `Debes ser mayor de ${EDAD_MINIMA} años para registrarte`),
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