"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ReactionResult = { success: true; liked: boolean; likesCount?: number } | { error: string };

export async function setBlogReaction(postId: string, liked: boolean): Promise<ReactionResult> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId) || typeof liked !== "boolean") {
    return { error: "La reacción no es válida." };
  }
  const supabase = await createClient();
  const { data: { user }, error: sessionError } = await supabase.auth.getUser();
  if (sessionError || !user) return { error: "Inicia sesión como alumno para reaccionar." };

  const { data: profile, error: profileError } = await supabase
    .from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profileError || profile?.role !== "user") return { error: "Solo los alumnos pueden reaccionar al blog." };

  const { data: post, error: postError } = await supabase
    .from("blog_posts").select("id,slug").eq("id", postId).eq("status", "published").maybeSingle();
  if (postError || !post) return { error: "Solo puedes reaccionar a artículos publicados." };

  // Guardar el estado deseado hace que los reintentos no dupliquen ni inviertan el Me gusta.
  const { error } = liked
    ? await supabase.from("blog_post_reactions").upsert(
      { post_id: postId, user_id: user.id },
      { onConflict: "post_id,user_id", ignoreDuplicates: true },
    )
    : await supabase.from("blog_post_reactions").delete().eq("post_id", postId).eq("user_id", user.id);
  if (error) return { error: "No se pudo guardar tu reacción. Intenta nuevamente." };

  const { data: counts, error: countError } = await supabase.rpc("get_blog_reaction_counts", { post_ids: [postId] });
  const count = (counts as Array<{ post_id: string; likes_count: number | string }> | null)
    ?.find((row) => row.post_id === postId)?.likes_count;
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  return { success: true, liked, ...(!countError && count !== undefined ? { likesCount: Number(count) } : {}) };
}
