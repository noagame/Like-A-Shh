"use server";

import { requireAdmin } from "@/lib/auth/authorize";
import { revalidatePath } from "next/cache";

const states = new Set(["pending", "approved", "rejected", "flagged", "hidden"]);
type ActionResult = { error: string } | { success: true };
export type CreateCommunityPostResult = { error: string } | { success: true; warning?: string };

export async function createAdminCommunityPost(formData: FormData): Promise<CreateCommunityPostResult> {
  const { supabase, user } = await requireAdmin();
  const titleValue = formData.get("title");
  const bodyValue = formData.get("body");
  if (typeof titleValue !== "string" || typeof bodyValue !== "string") {
    return { error: "Escribe un título y un mensaje para la conversación." };
  }
  const title = titleValue.trim();
  const body = bodyValue.trim();
  if (title.length < 5 || title.length > 140 || body.length < 10 || body.length > 5000) {
    return { error: "El título debe tener entre 5 y 140 caracteres y el mensaje entre 10 y 5.000." };
  }

  // La política de creación existente exige pending para cualquier autor.
  // La aprobación se realiza después con el permiso de moderación del administrador.
  const { data: post, error: createError } = await supabase
    .from("community_posts")
    .insert({ user_id: user.id, title, body, status: "pending" })
    .select("id")
    .single();
  if (createError || !post) return { error: "No se pudo crear la conversación. Inténtalo nuevamente." };

  const { data: published, error: moderationError } = await supabase
    .from("community_posts")
    .update({ status: "approved", moderated_by: user.id, moderated_at: new Date().toISOString() })
    .eq("id", post.id)
    .eq("user_id", user.id)
    .eq("status", "pending")
    .select("id")
    .single();
  const approved = !moderationError && !!published;
  const { error: auditError } = await supabase.from("audit_log").insert({
    actor_id: user.id,
    action: "create_community_post",
    metadata: { community_post_id: post.id, status: approved ? "approved" : "pending" },
  });

  revalidatePath("/mi-cuenta/comunidad");
  revalidatePath("/admin/comunidad");
  if (!approved) {
    return { success: true, warning: "La conversación se creó y quedó pendiente. Apruébala desde la lista para que la vean los alumnos; no hace falta crearla otra vez." };
  }
  if (auditError) {
    return { success: true, warning: "La conversación ya está publicada, pero no se pudo registrar su auditoría. No hace falta crearla otra vez." };
  }
  return { success: true };
}

export async function moderateCommunityPost(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin();
  const id = String(formData.get("id") ?? ""); const status = String(formData.get("status") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id) || !states.has(status)) return { error: "Solicitud de moderación inválida." };
  const { error } = await supabase.from("community_posts").update({ status, moderated_by: user.id, moderated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { error: error.message };
  const { error: auditError } = await supabase.from("audit_log").insert({ actor_id: user.id, action: "moderate_community_post", metadata: { community_post_id: id, status } });
  if (auditError) return { error: "La moderación se aplicó, pero no se pudo auditar." };
  revalidatePath("/mi-cuenta/comunidad"); revalidatePath("/admin/comunidad");
  return { success: true };
}

export async function deleteCommunityPost(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin(); const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Publicación inválida." };
  const { error } = await supabase.from("community_posts").delete().eq("id", id);
  if (error) return { error: error.message };
  await supabase.from("audit_log").insert({ actor_id: user.id, action: "delete_community_post", metadata: { community_post_id: id } });
  revalidatePath("/mi-cuenta/comunidad"); revalidatePath("/admin/comunidad");
  return { success: true };
}
