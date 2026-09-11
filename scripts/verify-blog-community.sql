\set ON_ERROR_STOP on

DO $$
DECLARE expected_tables integer; expected_triggers integer; expected_bucket integer;
BEGIN
  SELECT count(*) INTO expected_tables FROM pg_tables
  WHERE schemaname = 'public' AND tablename IN ('blog_posts', 'community_posts', 'community_comments');
  IF expected_tables <> 3 THEN RAISE EXCEPTION 'Faltan tablas del módulo Blog y Comunidad'; END IF;

  SELECT count(*) INTO expected_triggers FROM pg_trigger
  WHERE tgrelid IN ('public.blog_posts'::regclass, 'public.community_posts'::regclass, 'public.community_comments'::regclass)
    AND tgname IN ('set_blog_posts_updated_at', 'set_community_posts_updated_at', 'set_community_comments_updated_at')
    AND NOT tgisinternal;
  IF expected_triggers <> 3 THEN RAISE EXCEPTION 'Faltan triggers updated_at'; END IF;

  SELECT count(*) INTO expected_bucket FROM storage.buckets WHERE id = 'blog' AND public = true;
  IF expected_bucket <> 1 THEN RAISE EXCEPTION 'El bucket público blog no está configurado'; END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_posts' AND policyname = 'blog_posts_public_read') THEN
    RAISE EXCEPTION 'Falta la política pública de lectura de blog';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'community_posts' AND policyname = 'community_posts_create') THEN
    RAISE EXCEPTION 'Falta la política de creación de comunidad';
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';

SELECT 'Blog y Comunidad: esquema, RLS, triggers y Storage verificados.' AS verification_result;
