"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type Result = { error: string } | { success: true };

async function currentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function createCommunityPost(formData: FormData): Promise<Result> {
  const { supabase, user } = await currentUser();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (title.length < 5 || title.length > 140 || body.length < 10 || body.length > 5000) return { error: "El título debe tener 5 a 140 caracteres y el mensaje 10 a 5.000." };
  const { error } = await supabase.from("community_posts").insert({ user_id: user.id, title, body, status: "pending" });
  if (error) return { error: "No se pudo enviar tu publicación. Inténtalo nuevamente." };
  revalidatePath("/mi-cuenta/comunidad");
  return { success: true };
}

export async function createCommunityComment(formData: FormData): Promise<Result> {
  const { supabase, user } = await currentUser();
  const post_id = String(formData.get("post_id") ?? ""); const body = String(formData.get("body") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(post_id) || body.length < 2 || body.length > 2000) return { error: "Comentario inválido." };
  const { error } = await supabase.from("community_comments").insert({ post_id, user_id: user.id, body, status: "pending" });
  if (error) return { error: "No se pudo enviar el comentario." };
  revalidatePath("/mi-cuenta/comunidad");
  return { success: true };
}
