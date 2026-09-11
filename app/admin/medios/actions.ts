"use server";
import { requireAdmin } from "@/lib/auth/authorize";
import { z } from "zod";
import { validateImage } from "@/lib/validation/image";
import { revalidatePath } from "next/cache";

// 1. Subir imagen a Supabase Storage
export async function uploadMedia(galleryId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const file = formData.get("file") as File;
  
  if (!file) return { error: "No se encontró el archivo" };

  z.uuid().parse(galleryId);
  const fileExt = await validateImage(file);
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
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

  if (dbError) {
    const { error: cleanupError } = await supabase.storage.from("galerias").remove([filePath]);
    if (cleanupError) throw new Error("No se pudo guardar ni retirar la imagen. Contacta a soporte para revisar el archivo.");
    return { error: "No se pudo guardar la imagen. Intenta nuevamente." };
  }
  
  revalidatePath(`/admin/galeria/${galleryId}`);
  return { success: true };
}

// 2. Eliminar imagen de Storage y DB
export async function deleteMedia(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? formData.get("media_id") ?? "");
  z.uuid().parse(id);
  const { data: media, error: readError } = await supabase.from("media").select("storage_path").eq("id", id).single();
  if (readError || !media) throw new Error("No se encontró la imagen.");
  if (media.storage_path) {
    const { error } = await supabase.storage.from("galerias").remove([media.storage_path]);
    if (error) throw new Error("No se pudo retirar el archivo. Intenta nuevamente.");
  }
  const { error: deleteError } = await supabase.from("media").delete().eq("id", id);
  if (deleteError) throw new Error("El archivo fue retirado, pero falta borrar su registro. Reintenta la eliminación.");
  revalidatePath("/admin/galeria");
}
export async function createGallery(formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = z.string().trim().min(2).max(100).parse(formData.get("name"));
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
  const { supabase } = await requireAdmin();
  const name = z.string().trim().min(2).max(100).parse(formData.get("name"));
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
  const { supabase } = await requireAdmin();
  const id = formData.get("id") as string;

  z.uuid().parse(id);
  const { count, error: countError } = await supabase.from("media").select("id", { count: "exact", head: true }).eq("gallery_id", id);
  if (countError) return { error: "No se pudo comprobar el contenido de la galería." };
  if (count) return { error: "Elimina primero las imágenes de la galería." };

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
