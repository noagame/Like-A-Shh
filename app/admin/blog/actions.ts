"use server";

import { requireAdmin } from "@/lib/auth/authorize";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/slugify";
import { validateImage } from "@/lib/validation/image";

type ActionResult = { error: string } | { success: true };

function readText(formData: FormData, field: string, max: number) {
  return String(formData.get(field) ?? "").trim().slice(0, max);
}

async function audit(action: string, metadata: Record<string, unknown>) {
  const { supabase, user } = await requireAdmin();
  const { error } = await supabase.from("audit_log").insert({ actor_id: user.id, action, metadata });
  if (error) throw new Error("No se pudo registrar la auditoría.");
  return supabase;
}

export async function saveBlogPost(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin();
  const id = readText(formData, "id", 36);
  const title = readText(formData, "title", 160);
  const excerpt = readText(formData, "excerpt", 320);
  const content = readText(formData, "content", 50000);
  let cover_image_url = readText(formData, "cover_image_url", 2048) || null;
  const coverFile = formData.get("cover_image");
  const status = readText(formData, "status", 20);
  if (title.length < 5 || excerpt.length < 20 || content.length < 40 || !["draft", "published", "archived"].includes(status)) return { error: "Revisa título, resumen, contenido y estado." };
  const slug = slugify(title);
  let uploadedPath: string | null = null;
  if (coverFile instanceof File && coverFile.size > 0) {
    try {
      const extension = await validateImage(coverFile);
      uploadedPath = `covers/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("blog").upload(uploadedPath, coverFile, { contentType: coverFile.type });
      if (uploadError) return { error: "No se pudo subir la portada." };
      cover_image_url = supabase.storage.from("blog").getPublicUrl(uploadedPath).data.publicUrl;
    } catch (error) { return { error: (error as Error).message }; }
  }
  const record = { title, slug, excerpt, content, cover_image_url, status, published_at: status === "published" ? new Date().toISOString() : null };
  const query = id ? supabase.from("blog_posts").update(record).eq("id", id) : supabase.from("blog_posts").insert({ ...record, author_id: user.id });
  const { data, error } = await query.select("id").single();
  if (error) {
    if (uploadedPath) await supabase.storage.from("blog").remove([uploadedPath]);
    return { error: error.code === "23505" ? "Ya existe un artículo con ese título o URL." : error.message };
  }
  const { error: auditError } = await supabase.from("audit_log").insert({ actor_id: user.id, action: id ? "update_blog_post" : "create_blog_post", metadata: { blog_post_id: data.id, status } });
  if (auditError) return { error: "El artículo se guardó, pero falló el registro de auditoría." };
  revalidatePath("/blog"); revalidatePath("/admin/blog");
  return { success: true };
}

export async function deleteBlogPost(formData: FormData): Promise<ActionResult> {
  const id = readText(formData, "id", 36);
  const supabase = await audit("delete_blog_post", { blog_post_id: id });
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/blog"); revalidatePath("/admin/blog");
  return { success: true };
}
