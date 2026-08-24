"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Actualizar datos de un usuario existente
export async function updateUser(id: string, formData: FormData) {
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;

    const { error } = await supabase
        .from("profiles")
        .update({ name, email, role })
        .eq("id", id);

    if (error) {
        console.error("Error al actualizar usuario:", error.message);
        throw new Error(error.message);
    }

    revalidatePath("/admin/usuarios");
    redirect("/admin/usuarios");
}

// Eliminar un usuario
export async function deleteUser(id: string) {
    const supabase = await createClient();

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