"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function submitEventReview(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Debes iniciar sesión para valorar la clase." };
  }

  const eventId = String(formData.get("event_id") ?? "").trim();
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();
  const recommendation = String(formData.get("recommendation") ?? "").trim();

  if (!eventId) {
    return { success: false, error: "No se encontró la clase asociada." };
  }

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { success: false, error: "La puntuación debe estar entre 1 y 5 estrellas." };
  }

  const trimmedComment = comment.slice(0, 500);
  const trimmedRecommendation = recommendation.slice(0, 500);

  const { data: event } = await supabase
    .from("events")
    .select("id, end_time")
    .eq("id", eventId)
    .maybeSingle();

  if (!event) {
    return { success: false, error: "La clase seleccionada no existe." };
  }

  const isCompleted = event.end_time ? new Date(event.end_time).getTime() < Date.now() : false;

  const { data: attendance } = await supabase
    .from("attendances")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .eq("status", "registered")
    .maybeSingle();

  if (!isCompleted && !attendance) {
    return { success: false, error: "Solo puedes valorar clases ya realizadas o en las que participaste." };
  }

  const { error } = await supabase.from("event_reviews").upsert(
    {
      user_id: user.id,
      event_id: eventId,
      rating,
      comment: trimmedComment,
      recommendation: trimmedRecommendation,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,event_id" }
  );

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/mi-cuenta");
  revalidatePath("/mi-cuenta/clases");
  revalidatePath("/");

  return { success: true };
}

export async function toggleLikeCourse(courseId: string): Promise<{ success: boolean; liked?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Debes iniciar sesión para dar like a un curso." };
  }

  if (!courseId.trim()) {
    return { success: false, error: "No se encontró el curso." };
  }

  const { data: existingLike } = await supabase
    .from("course_likes")
    .select("id")
    .eq("course_id", courseId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingLike) {
    const { error } = await supabase
      .from("course_likes")
      .delete()
      .eq("id", existingLike.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/mi-cuenta");
    return { success: true, liked: false };
  }

  const { error } = await supabase.from("course_likes").insert({
    user_id: user.id,
    course_id: courseId,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/mi-cuenta");

  return { success: true, liked: true };
}
