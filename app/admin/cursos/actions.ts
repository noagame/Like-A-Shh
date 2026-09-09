"use server";

import { uploadFlyer, rollbackFlyer } from "@/lib/infrastructure/factories/flyer";
import { requireAdmin } from "@/lib/auth/authorize";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const DEFAULT_COURSE_IMAGE =
  "https://ssgcrrblxmmqurjlwope.supabase.co/storage/v1/object/public/galerias/cursos/curso_b4285aab-184e-4534-9398-1869ac6dd017.jpg";

export async function createCourse(formData: FormData) {
  const { supabase } = await requireAdmin();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const url = (formData.get("url") as string) || "#";
  const status = (formData.get("status") as string) || "published";
  const flyerFile = formData.get("flyer") as File | null;

  const flyer = await uploadFlyer(supabase, flyerFile, "galerias", "cursos");
  const image_url = flyer?.url ?? DEFAULT_COURSE_IMAGE;

  const { error } = await supabase.from("courses").insert({
    title,
    description,
    image_url,
    url,
    status,
  });

  if (error) {
    await rollbackFlyer(supabase, flyer);
    redirect(`/admin/cursos?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/cursos");
  revalidatePath("/");
  redirect("/admin/cursos");
}

export async function updateCourse(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const url = formData.get("url") as string;
  const status = formData.get("status") as string;
  const flyerFile = formData.get("flyer") as File | null;

  type CourseUpdatePayload = {
    title: string;
    description: string;
    url: string;
    status: string;
    updated_at: string;
    image_url?: string;
  };

  const updatePayload: CourseUpdatePayload = {
    title,
    description,
    url,
    status,
    updated_at: new Date().toISOString(),
  };

  const flyer = await uploadFlyer(supabase, flyerFile, "galerias", "cursos");
  if (flyer) updatePayload.image_url = flyer.url;

  const { error } = await supabase
    .from("courses")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    await rollbackFlyer(supabase, flyer);
    redirect(`/admin/cursos?error=${encodeURIComponent(error.message)}`);
  }

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