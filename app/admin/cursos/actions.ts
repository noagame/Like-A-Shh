"use server";

import { uploadFlyer, rollbackFlyer } from "@/lib/infrastructure/factories/flyer";
import { requireAdmin } from "@/lib/auth/authorize";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isCourseUrl } from "@/lib/course-links";

const DEFAULT_COURSE_IMAGE =
  "https://ssgcrrblxmmqurjlwope.supabase.co/storage/v1/object/public/galerias/cursos/curso_b4285aab-184e-4534-9398-1869ac6dd017.jpg";

function readCourseFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim() || "#";
  const linkLabel = String(formData.get("link_label") ?? "").trim();
  const status = String(formData.get("status") ?? "published");
  if (!title || title.length > 200) throw new Error("Escribe un título de hasta 200 caracteres.");
  if (!description) throw new Error("La descripción es obligatoria.");
  if (!isCourseUrl(url)) throw new Error("Usa un enlace HTTP o HTTPS válido.");
  if (linkLabel.length > 120) throw new Error("El texto del enlace admite hasta 120 caracteres.");
  if (!["draft", "published"].includes(status)) throw new Error("El estado no es válido.");
  return { title, description, url, link_label: linkLabel || null, status };
}

function courseErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "No se pudo guardar el curso.";
}

export async function createCourse(formData: FormData) {
  const { supabase } = await requireAdmin();
  let flyer: Awaited<ReturnType<typeof uploadFlyer>> = null;
  let errorMessage: string | null = null;
  try {
    const fields = readCourseFields(formData);
    const file = formData.get("flyer");
    flyer = await uploadFlyer(supabase, file instanceof File ? file : null, "galerias", "cursos");
    const { error } = await supabase.from("courses").insert({
      ...fields,
      image_url: flyer?.url ?? DEFAULT_COURSE_IMAGE,
    });
    if (error) throw new Error(error.message);
  } catch (error) {
    errorMessage = courseErrorMessage(error);
    try {
      await rollbackFlyer(supabase, flyer);
    } catch (rollbackError) {
      errorMessage += ` ${courseErrorMessage(rollbackError)}`;
    }
  }
  if (errorMessage) redirect(`/admin/cursos?error=${encodeURIComponent(errorMessage)}`);

  revalidatePath("/admin/cursos");
  revalidatePath("/");
  redirect("/admin/cursos");
}

export async function updateCourse(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  let flyer: Awaited<ReturnType<typeof uploadFlyer>> = null;
  let errorMessage: string | null = null;
  try {
    const fields = readCourseFields(formData);
    const file = formData.get("flyer");
    flyer = await uploadFlyer(supabase, file instanceof File ? file : null, "galerias", "cursos");
    const { data, error } = await supabase
      .from("courses")
      .update({
        ...fields,
        updated_at: new Date().toISOString(),
        ...(flyer ? { image_url: flyer.url } : {}),
      })
      .eq("id", id)
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message || "No se encontró el curso.");
  } catch (error) {
    errorMessage = courseErrorMessage(error);
    try {
      await rollbackFlyer(supabase, flyer);
    } catch (rollbackError) {
      errorMessage += ` ${courseErrorMessage(rollbackError)}`;
    }
  }
  if (errorMessage) redirect(`/admin/cursos?error=${encodeURIComponent(errorMessage)}`);

  revalidatePath("/admin/cursos");
  revalidatePath("/");
  redirect("/admin/cursos");
}

export async function deleteCourse(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw new Error("No se pudo eliminar el registro.");

  revalidatePath("/admin/cursos");
  revalidatePath("/");
  redirect("/admin/cursos");
}
