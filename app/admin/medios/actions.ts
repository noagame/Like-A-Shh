"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// 1. Subir imagen a Supabase Storage
export async function uploadMedia(galleryId: string, formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File;
  
  if (!file) return { error: "No se encontró el archivo" };

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${galleryId}/${fileName}`; // Lo guardamos dentro de un folder con el ID de la galería

  // Subir al bucket "galerias"
  const { error: uploadError } = await supabase.storage
    .from("galerias")
    .upload(filePath, file);

  if (uploadError) return { error: uploadError.message };

  // Obtener URL pública
  const { data: publicUrlData } = supabase.storage
    .from("galerias")
    .getPublicUrl(filePath);

  // Guardar registro en la base de datos
  const { error: dbError } = await supabase.from("media").insert({
    gallery_id: galleryId,
    url: publicUrlData.publicUrl,
    storage_path: filePath,
    alt_text: file.name
  });

  if (dbError) return { error: dbError.message };
  
  revalidatePath(`/admin/galeria/${galleryId}`);
  return { success: true };
}

// 2. Eliminar imagen de Storage y DB
export async function deleteMedia(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const storagePath = formData.get("storage_path") as string; 

  if (storagePath) {
    // Borrar del bucket
    await supabase.storage.from("galerias").remove([storagePath]);
  }

  // Borrar de la tabla
  await supabase.from("media").delete().eq("id", id);
  revalidatePath("/admin/galeria");
}
export async function createGallery(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  const { error } = await supabase
    .from("galleries")
    .insert({ name, description });

  if (error) {
    console.error("Error al crear galería:", error.message);
    return { error: error.message };
  }

  revalidatePath("/admin/galeria");
  return { success: true };
}

export async function updateGallery(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  const { error } = await supabase
    .from("galleries")
    .update({ name, description })
    .eq("id", id);

  if (error) {
    console.error("Error al actualizar galería:", error.message);
    return { error: error.message };
  }

  // Revalidamos tanto la vista de detalle como la lista principal
  revalidatePath(`/admin/galeria/${id}`);
  revalidatePath("/admin/galeria");
  return { success: true };
}

export async function deleteGallery(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  if (!id) return { error: "ID no proporcionado" };

  const { error } = await supabase
    .from("galleries")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error al eliminar galería:", error.message);
    return { error: error.message };
  }

  revalidatePath("/admin/galeria");
  return { success: true };
}