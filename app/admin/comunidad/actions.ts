"use server";

import { requireAdmin } from "@/lib/auth/authorize";
import { revalidatePath } from "next/cache";

const states = new Set(["pending", "approved", "rejected", "flagged", "hidden"]);
type ActionResult = { error: string } | { success: true };

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
