-- Permite retirar un flyer al reemplazarlo, quitarlo o revertir una carga fallida.
-- Conserva las políticas existentes y no elimina objetos de Storage.
BEGIN;

DO $migration$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'eventos_flyers_admin_delete'
  ) THEN
    CREATE POLICY eventos_flyers_admin_delete ON storage.objects
      FOR DELETE TO authenticated
      USING (
        bucket_id = 'eventos'
        AND name LIKE 'flyers/%'
        AND (SELECT public.is_admin())
      );
  END IF;
END;
$migration$;

COMMIT;
