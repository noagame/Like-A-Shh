import type { SupabaseClient } from "@supabase/supabase-js";

/** Only resolve files from this project's event flyer folder, never arbitrary URLs. */
export function getEventFlyerPath(supabase: SupabaseClient, imageUrl: string): string | null {
  try {
    const base = new URL(supabase.storage.from("eventos").getPublicUrl("flyers/").data.publicUrl);
    const image = new URL(imageUrl);
    if (image.origin !== base.origin || !image.pathname.startsWith(base.pathname) || image.search || image.hash) {
      return null;
    }
    const filename = decodeURIComponent(image.pathname.slice(base.pathname.length));
    // Uploads use one generated filename; do not delete nested or escaped paths.
    if (!/^[a-zA-Z0-9_-]+\.(?:png|jpe?g|webp)$/i.test(filename)) return null;
    return `flyers/${filename}`;
  } catch {
    return null;
  }
}

export async function removeUnusedEventFlyer(supabase: SupabaseClient, imageUrl: string): Promise<void> {
  const path = getEventFlyerPath(supabase, imageUrl);
  if (!path) return;

  const { data: references, error: readError } = await supabase
    .from("events")
    .select("id")
    .eq("image_url", imageUrl)
    .limit(1);
  if (readError) throw new Error("No se pudo comprobar si la imagen anterior sigue en uso.");
  if (references?.length) return;

  const { error } = await supabase.storage.from("eventos").remove([path]);
  if (error) throw new Error("No se pudo retirar la imagen anterior de Storage.");
}
