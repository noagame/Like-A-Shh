import type { SupabaseClient } from '@supabase/supabase-js';
import { validateImage } from '@/lib/validation/image';
type UploadedFlyer = { url: string; path: string; bucket: 'eventos' | 'galerias' };
export async function uploadFlyer(supabase: SupabaseClient, file: File | null, bucket: UploadedFlyer['bucket'], folder: string): Promise<UploadedFlyer | null> {
  if (!file || file.size === 0) return null;
  const extension = await validateImage(file);
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
  if (error) throw new Error('No se pudo subir la imagen. Intenta nuevamente.');
  return { url: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl, path, bucket };
}
export async function rollbackFlyer(supabase: SupabaseClient, flyer: UploadedFlyer | null) {
  if (!flyer) return;
  const { error } = await supabase.storage.from(flyer.bucket).remove([flyer.path]);
  if (error) throw new Error('No se pudo guardar el registro ni retirar su imagen. Contacta a soporte para revisar el archivo.');
}
