"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

// Actualizar rol y datos del usuario (Ley 21.719)[cite: 3, 5]
export async function updateUser(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user: adminUser } } = await supabase.auth.getUser();

  if (!adminUser) throw new Error("No autorizado.");

  const name = (formData.get("name") || formData.get("full_name")) as string;
  const role = formData.get("role") as string;
  const phone = formData.get("phone") as string | null;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: name,
      phone: phone || null,
      role: role || "user",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error al actualizar usuario:", error.message);
    throw new Error(error.message);
  }

  // Trazabilidad administrativa exigida por Ley Nº 21.719[cite: 5, 8]
  await supabase.from("audit_log").insert({
    actor_id: adminUser.id,
    action: "update_user_admin",
    metadata: { target_user_id: id, role, updated_name: name },
  });

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}

// Supresión o eliminación de usuario bajo Derechos ARCO[cite: 3, 5]
export async function deleteUser(id: string) {
  const supabase = await createClient();
  const { data: { user: adminUser } } = await supabase.auth.getUser();

  if (!adminUser) throw new Error("No autorizado.");

  if (adminUser.id === id) {
    throw new Error("No puedes eliminar tu propia cuenta de administrador activa.");
  }

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") ?? "unknown";

  // Registro de consentimiento/solicitud de supresión Ley 21.719[cite: 3, 5]
  await supabase.from("consent_logs").insert({
    user_id: id,
    consent_type: "supresion_administrativa_ley21719",
    accepted: true,
    policy_version: "politica-privacidad-v2-ley21719-2026",
    ip_address: ip,
  });

  await supabase.from("audit_log").insert({
    actor_id: adminUser.id,
    action: "delete_user_admin",
    metadata: { target_user_id: id },
  });

  // Limpieza de inscripciones asociadas
  await supabase.from("attendances").delete().eq("user_id", id);

  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error al eliminar usuario:", error.message);
    throw new Error(error.message);
  }

  revalidatePath("/admin/usuarios");
}

// Función auxiliar para invocar borrado desde formularios Server Actions
export async function deleteUserAction(formData: FormData) {
  const userId = formData.get("user_id") as string;
  if (!userId) return;
  await deleteUser(userId);
}