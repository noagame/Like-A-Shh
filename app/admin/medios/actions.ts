"use server";

import { ObjectId } from "mongodb";
import { Readable } from "stream";
import { revalidatePath } from "next/cache";
import { getMediaBucket } from "@/lib/mongodb";
import { createClient } from "@/lib/supabase/server";

const MAX_SIZE_MB = 50;
type UploadMediaResult =
  | { ok: true; url: string; fileId: string } 
  | { ok: false; error: string };

export async function uploadMedia(formData: FormData): 
Promise <UploadMediaResult> {
  try {
      const file = formData.get("file");
      const galleryId = (formData.get("gallery_id") as string | null)?.trim() || null;
      const altText = (formData.get("alt_text") as string | null)?.trim() || null;

      if (!(file instanceof File)) {
        return { ok: false, error: "No se recibió un archivo válido." };
      }

      if (!file.name || file.size <= 0) {
        return { ok: false, error: "El archivo está vacío o no es válido." };
      }

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        return { ok: false, error: `El archivo no puede pesar más de ${MAX_SIZE_MB}MB.` };
      }

      const supabase = await createClient();
      const { data: { user }, error: userError, } = await supabase.auth.getUser();

      if (userError || !user) {
        return { ok: false, error: "No autenticado." };
      }

      const bucket = await getMediaBucket();
      const buffer = Buffer.from(await file.arrayBuffer());

      const mongoFileId = await new Promise<string>((resolve, reject) => {
        try {
          const uploadStream = bucket.openUploadStream(file.name, {
            metadata: { 
              uploadedBy: user.id,
              contentType: file.type || "application/octet-stream", },
          });

          Readable.from(buffer)
            .pipe(uploadStream)
            .on("error", reject)
            .on("finish", () => resolve(uploadStream.id.toString()));
        } catch (error) {
          reject(error);
        }
      });

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
      if (!siteUrl) {
        try {
          await bucket.delete(new ObjectId(mongoFileId));
        } catch {
          // no bloquear la operación por un fallo de limpieza
        }
        return { ok: false, error: "Falta configurar NEXT_PUBLIC_SITE_URL." };
      }

      const publicUrl = `${siteUrl.replace(/\/$/, "")}/api/media/${mongoFileId}`;

      const { error: insertError } = await supabase.from("media").insert({
        gallery_id: galleryId,
        url: publicUrl,
        storage_path: mongoFileId,
        alt_text: altText,
        uploaded_by: user.id,
      });

      if (insertError) {
        try {
          await bucket.delete(new ObjectId(mongoFileId));
        } catch {
          // no bloquear la operación por un fallo de limpieza
        }

        return { ok: false, error: insertError.message };
      }

      await supabase.from("audit_log").insert({
        actor_id: user.id,
        action: "upload_media",
        metadata: { mongo_file_id: mongoFileId, gallery_id: galleryId },
      });

      revalidatePath("/admin/medios");
      if (galleryId) {
        revalidatePath(`/admin/galerias/${galleryId}`);
      }

      return { ok: true, url: publicUrl, fileId: mongoFileId };
  } catch (error) {
      console.error("[uploadMedia] Error inesperado:", error);
      return { ok: false, error: "No se pudo completar la subida del archivo." };
  }
}
export async function updateGallery(galleryId: string, formData: FormData) {
  try {
    const name = (formData.get("name") as string | null)?.trim();
    const description = (formData.get("description") as string | null)?.trim() ?? "";
    if (!name) return { ok: false, error: "El nombre de la galería es obligatorio." };

    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { ok: false, error: "No autenticado." };

    const { error } = await supabase
      .from("galleries")
      .update({ name, description })
      .eq("id", galleryId);
    if (error) return { ok: false, error: error.message };

    await supabase.from("audit_log").insert({
      actor_id: user.id,
      action: "update_gallery",
      metadata: { gallery_id: galleryId },
    });
    revalidatePath("/admin/galerias");
    revalidatePath(`/admin/galeria/${galleryId}`);
    return { ok: true };
  } catch (error) {
    console.error("[updateGallery] Error inesperado:", error);
    return { ok: false, error: "No se pudo actualizar la galería." };
  }
}

export async function deleteGallery(formData: FormData) {
  try {
    const galleryId = formData.get("gallery_id") as string;
    if (!galleryId) {
      throw new Error("Falta el ID de la galería a borrar.");
    }

    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { ok: false, error: "No autenticado." };

    const { error } = await supabase.from("galleries").delete().eq("id", galleryId);

    if (error) {
      return { ok: false, error: error.message };
    }

    await supabase.from("audit_log").insert({
      actor_id: user.id,
      action: "delete_gallery",
      metadata: { gallery_id: galleryId },
    });

    revalidatePath("/admin/galerias");
    return { ok: true };
  } catch (error) {
    console.error("[deleteGallery] Error inesperado:", error);
    return { ok: false, error: "No se pudo eliminar la galería." };
  }
}

export async function createGallery(formData: FormData) {
  try {
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
    return { error: error?.message ?? null };
  } catch (error) {
    console.error("[createGallery] Error inesperado:", error);
    return { error: "No se pudo crear la galería." };
  }
}

export async function deleteMedia(formData: FormData) {
  try {
    const mediaId = (formData.get("media_id") as string | null)?.trim();
    const mongoFileId = (formData.get("mongo_file_id") as string | null)?.trim();
    const galleryId = (formData.get("gallery_id") as string | null)?.trim() || null;

    if (!mediaId || !mongoFileId) {
      return { ok: false, error: "Faltan datos para borrar la media." };
    }

    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) return { ok: false, error: "No autenticado." };

    const bucket = await getMediaBucket();

    try {
      if (ObjectId.isValid(mongoFileId)) {
        await bucket.delete(new ObjectId(mongoFileId));
      } else {
        console.warn(`[deleteMedia] mongoFileId inválido: ${mongoFileId}`);
      }
    } catch {
      // se ignora porque puede ya no existir en Mongo
    }

    const { error: deleteError } = await supabase.from("media").delete().eq("id", mediaId);

    if (deleteError) {
      return { ok: false, error: deleteError.message };
    }

    await supabase.from("audit_log").insert({
      actor_id: user.id,
      action: "delete_media",
      metadata: { media_id: mediaId, mongo_file_id: mongoFileId },
    });

    revalidatePath("/admin/medios");
    if (galleryId) {
      revalidatePath(`/admin/galerias/${galleryId}`);
    }

    return { ok: true };
  } catch (error) {
    console.error("[deleteMedia] Error inesperado:", error);
    return { ok: false, error: "No se pudo borrar la media." };
  }
}