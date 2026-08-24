"use server";

import { getMediaBucket } from "@/lib/mongodb";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Readable } from "stream";

const MAX_SIZE_MB = 50; // ajusta según si vas a permitir video largo

export async function uploadMedia(formData: FormData) {
  const file = formData.get("file") as File | null;
  const galleryId = formData.get("gallery_id") as string | null;
  const altText = formData.get("alt_text") as string | null;

  if (!file) {
    return { error: "No seleccionaste ningún archivo" };
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return { error: `El archivo no puede pesar más de ${MAX_SIZE_MB}MB` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "No autenticado" };
  }

  try {
    // 1. Subir el binario a MongoDB (GridFS) — esto es el "data lake"
    const bucket = await getMediaBucket();
    const buffer = Buffer.from(await file.arrayBuffer());

    const mongoFileId = await new Promise<string>((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(file.name, {
        metadata: {
          contentType: file.type,
          uploadedBy: user.id
        },
      });

      // Capturar errores del stream de subida
      uploadStream.on("error", reject);

      Readable.from(buffer)
        .pipe(uploadStream)
        .on("error", reject)
        .on("finish", () => resolve(uploadStream.id.toString()));
    });

    // 2. Guardar solo la metadata + referencia en Postgres
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const publicUrl = `${siteUrl}/api/media/${mongoFileId}`;

    const { error } = await supabase.from("media").insert({
      gallery_id: galleryId || null,
      url: publicUrl,
      storage_path: mongoFileId, // guarda el ObjectId de Mongo
      alt_text: altText,
      uploaded_by: user.id,
    });

    if (error) {
      const { ObjectId } = await import("mongodb");
      await bucket.delete(new ObjectId(mongoFileId));
      return { error: `Supabase Error: ${error.message}` };
    }

    await supabase.from("audit_log").insert({
      actor_id: user.id,
      action: "upload_media",
      metadata: { mongo_file_id: mongoFileId, gallery_id: galleryId },
    });

    revalidatePath("/admin/medios");
    if (galleryId) revalidatePath(`/admin/galerias/${galleryId}`);
    return { error: null, url: publicUrl };
  } catch (e: any) {
    console.error("Upload error:", e);
    return { error: `Error interno: ${e?.message || "Hubo un problema al subir el archivo"}` };
  }
}

export async function updateGallery(galleryId: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  const { error } = await supabase
    .from("galleries")
    .update({ name, description })
    .eq("id", galleryId);

  if (!error) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("audit_log").insert({
      actor_id: user?.id,
      action: "update_gallery",
      metadata: { gallery_id: galleryId },
    });
  }

  revalidatePath("/admin/galerias");
  revalidatePath("/admin/galeria");
  revalidatePath(`/admin/galerias/${galleryId}`);
  return { error: error?.message ?? null };
}

export async function deleteGallery(formData: FormData) {
  const galleryId = formData.get("gallery_id") as string;
  const supabase = await createClient();

  // La FK de "media.gallery_id" es ON DELETE SET NULL: las imágenes NO se
  // borran, solo quedan "sin galería" (visibles en /admin/medios sin filtro).
  const { error } = await supabase.from("galleries").delete().eq("id", galleryId);

  if (!error) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("audit_log").insert({
      actor_id: user?.id,
      action: "delete_gallery",
      metadata: { gallery_id: galleryId },
    });
  }

  revalidatePath("/admin/galerias");
  revalidatePath("/admin/galeria");
}

export async function createGallery(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // saca tildes
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("galleries").insert({
    name,
    slug,
    created_by: user?.id,
  });

  revalidatePath("/admin/medios");
  revalidatePath("/admin/galerias");
  revalidatePath("/admin/galeria"); // <--- Agregado para refrescar tu vista actual en singular
  return { error: error?.message ?? null };
}

export async function deleteMedia(formData: FormData) {
  const mediaId = formData.get("media_id") as string;
  const mongoFileId = formData.get("mongo_file_id") as string;
  const galleryId = formData.get("gallery_id") as string | null;

  const supabase = await createClient();

  const { ObjectId } = await import("mongodb");
  const bucket = await getMediaBucket();
  try {
    await bucket.delete(new ObjectId(mongoFileId));
  } catch {
    // Si el archivo ya no existe en Mongo, no bloqueamos
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("media").delete().eq("id", mediaId);
  await supabase.from("audit_log").insert({
    actor_id: user?.id,
    action: "delete_media",
    metadata: { media_id: mediaId, mongo_file_id: mongoFileId },
  });

  revalidatePath("/admin/medios");
  if (galleryId) revalidatePath(`/admin/galerias/${galleryId}`);
}