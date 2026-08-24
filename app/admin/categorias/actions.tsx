"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const color = (formData.get("color") as string) || "#D4AF37";

  // Agregamos .select().single() para que devuelva la fila recién creada
  const { data, error } = await supabase
    .from("categories")
    .insert({ name, color })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/categorias");
  // Retornamos la data para que el cliente la pueda usar inmediatamente
  return { error: null, category: data };
}

export async function deleteCategory(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categorias");
}