"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const color = (formData.get("color") as string) || "#D4AF37";

  const { error } = await supabase.from("categories").insert({ name, color });
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/admin/categorias");
  return { error: null };
}

export async function deleteCategory(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  // No se puede borrar si hay eventos usándola (FK sin cascade) — se deja
  // que Postgres tire el error para no borrar categorías "en uso" sin querer.
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categorias");
}