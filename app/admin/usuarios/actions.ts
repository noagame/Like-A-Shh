"use server";
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/authorize';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateUser(id: string, formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const target = z.uuid().parse(id);
  const payload = z.object({
    full_name: z.string().trim().min(2).max(100),
    role: z.enum(['user', 'admin']), phone: z.string().trim().max(30).nullable(),
  }).parse({ full_name: formData.get('name') || formData.get('full_name'), role: formData.get('role'), phone: formData.get('phone') || null });
  if (target === user.id && payload.role !== 'admin') throw new Error('No puedes quitarte tu propio acceso de administrador.');
  const { error } = await supabase.rpc('admin_update_profile', { target_user_id: target, new_name: payload.full_name, new_phone: payload.phone, new_role: payload.role });
  if (error) throw new Error('No se pudo actualizar el usuario.');
  revalidatePath('/admin/usuarios');
  redirect('/admin/usuarios');
}
export async function deleteUser(id: string) {
  const { supabase, user } = await requireAdmin();
  z.uuid().parse(id);
  if (id === user.id) throw new Error('Usa la opción de eliminación en tu perfil para borrar tu cuenta.');
  const { error } = await supabase.rpc('delete_account', { target_user_id: id });
  if (error) throw new Error('No se pudo eliminar la cuenta. No se han borrado los datos.');
  revalidatePath('/admin/usuarios');
}
export async function deleteUserAction(formData: FormData) {
  await deleteUser(String(formData.get('user_id') ?? ''));
}
