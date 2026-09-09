"use server";

import { requireAdmin } from "@/lib/auth/authorize";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
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
  const { supabase } = await requireAdmin();
  const id = formData.get("id") as string;
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error("No se pudo eliminar el registro.");
  revalidatePath("/admin/categorias");
}
export async function createCategoryForm(formData: FormData): Promise<void> {
  const result = await createCategory(formData);
  if (result.error) throw new Error("No se pudo crear la categoría.");
}
