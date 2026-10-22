-- Preparada con autorización del usuario. Pendiente de aplicación en Supabase.
-- NULL conserva el texto automático de los cursos existentes.
BEGIN;

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS link_label text;

COMMENT ON COLUMN public.courses.link_label IS
  'Texto personalizado del enlace del panel y del botón público; NULL usa el texto automático.';

COMMIT;
