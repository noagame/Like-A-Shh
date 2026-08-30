"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const DEFAULT_COURSE_IMAGE =
  "https://ssgcrrblxmmqurjlwope.supabase.co/storage/v1/object/public/galerias/cursos/curso_b4285aab-184e-4534-9398-1869ac6dd017.jpg";

export async function createCourse(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const url = (formData.get("url") as string) || "#";
  const status = (formData.get("status") as string) || "published";
  const flyerFile = formData.get("flyer") as File | null;

  let image_url = DEFAULT_COURSE_IMAGE;

  // Subida opcional de flyer a Supabase Storage
  if (flyerFile && flyerFile.size > 0 && flyerFile.name !== "undefined") {
    const fileExt = flyerFile.name.split(".").pop();
    const fileName = `curso_${crypto.randomUUID()}.${fileExt}`;
    const filePath = `cursos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("galerias")
      .upload(filePath, flyerFile, { contentType: flyerFile.type });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from("galerias")
        .getPublicUrl(filePath);
      image_url = publicUrlData.publicUrl;
    }
  }

  const { error } = await supabase.from("courses").insert({
    title,
    description,
    image_url,
    url,
    status,
  });

  if (error) {
    redirect(`/admin/cursos?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/cursos");
  revalidatePath("/");
  redirect("/admin/cursos");
}

export async function updateCourse(id: string, formData: FormData) {
  const supabase = await createClient();
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

  if (flyerFile && flyerFile.size > 0 && flyerFile.name !== "undefined") {
    const fileExt = flyerFile.name.split(".").pop();
    const fileName = `curso_${crypto.randomUUID()}.${fileExt}`;
    const filePath = `cursos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("galerias")
      .upload(filePath, flyerFile, { contentType: flyerFile.type });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from("galerias")
        .getPublicUrl(filePath);
      updatePayload.image_url = publicUrlData.publicUrl;
    }
  }

  const { error } = await supabase
    .from("courses")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    redirect(`/admin/cursos?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/cursos");
  revalidatePath("/");
  redirect("/admin/cursos");
}

export async function deleteCourse(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  await supabase.from("courses").delete().eq("id", id);

  revalidatePath("/admin/cursos");
  revalidatePath("/");
  redirect("/admin/cursos");
}