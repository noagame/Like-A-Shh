-- Gallery media is public content; only administrators may manage its files.
BEGIN;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('galerias', 'galerias', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS galerias_public_read ON storage.objects;
CREATE POLICY galerias_public_read ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'galerias');

DROP POLICY IF EXISTS galerias_admin_insert ON storage.objects;
CREATE POLICY galerias_admin_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'galerias' AND (SELECT public.is_admin()));

DROP POLICY IF EXISTS galerias_admin_update ON storage.objects;
CREATE POLICY galerias_admin_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'galerias' AND (SELECT public.is_admin()))
  WITH CHECK (bucket_id = 'galerias' AND (SELECT public.is_admin()));

DROP POLICY IF EXISTS galerias_admin_delete ON storage.objects;
CREATE POLICY galerias_admin_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'galerias' AND (SELECT public.is_admin()));

NOTIFY pgrst, 'reload schema';
COMMIT;
