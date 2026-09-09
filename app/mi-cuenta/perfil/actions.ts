"use server";

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { birthDateSchema, genderSchema } from '@/lib/validation/profile';
import { allowAuthRequest } from '@/lib/auth/request-limit';

const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  phone: z.string().trim().max(30).optional(),
  birth_date: birthDateSchema,
  gender: genderSchema.optional(),
});

export async function actualizarPerfil(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const parsed = profileSchema.safeParse({
    full_name: formData.get('full_name'), phone: formData.get('phone') || undefined,
    birth_date: formData.get('birth_date'), gender: formData.get('gender') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { error } = await supabase.from('profiles').update({
    ...parsed.data, phone: parsed.data.phone || null,
    gender: parsed.data.gender || 'prefiero_no_decir',
    is_anonymized: false, updated_at: new Date().toISOString(),
  }).eq('id', user.id);
  if (error) return { error: 'No se pudo actualizar el perfil. Intenta nuevamente.' };
  revalidatePath('/mi-cuenta', 'layout');
  return { success: true };
}

// Hide profile details, preserving the identity required to sign in. This is not anonymization.
export async function anonimizarDatos() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { error } = await supabase.rpc('hide_my_profile');
  if (error) return { error: 'No se pudieron ocultar los datos del perfil. Intenta nuevamente.' };
  revalidatePath('/mi-cuenta', 'layout');
  return { success: true };
}

export async function eliminarCuentaTotal(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const password = formData.get('password');
  if (typeof password !== 'string' || !password || !user.email) return { error: 'Confirma tu contraseña para eliminar la cuenta.' };
  if (!await allowAuthRequest('delete-account', user.email)) return { error: 'Acceso temporalmente limitado. Intenta más tarde.' };
  const { error: authError } = await supabase.auth.signInWithPassword({ email: user.email, password });
  if (authError) return { error: 'No se pudo confirmar tu contraseña.' };
  const { error } = await supabase.rpc('delete_account', { target_user_id: user.id });
  if (error) return { error: 'No se pudo eliminar la cuenta. Tus datos no se han borrado; contacta a soporte si el problema continúa.' };
  await supabase.auth.signOut();
  redirect('/?cuenta_eliminada=1');
}
