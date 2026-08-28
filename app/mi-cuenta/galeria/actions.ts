"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleLikeMedia(mediaId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Debes iniciar sesión para dar me gusta." };

  // Comprobar si ya existe el like
  const { data: existingLike } = await supabase
    .from("media_likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("media_id", mediaId)
    .maybeSingle();

  if (existingLike) {
    // Quitar like
    await supabase.from("media_likes").delete().eq("id", existingLike.id);
  } else {
    // Agregar like
    await supabase.from("media_likes").insert({
      user_id: user.id,
      media_id: mediaId,
    });
  }

  revalidatePath("/mi-cuenta/galeria");
  return { success: true };
}