BEGIN;

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (char_length(trim(title)) BETWEEN 5 AND 160),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt text NOT NULL CHECK (char_length(trim(excerpt)) BETWEEN 20 AND 320),
  content text NOT NULL CHECK (char_length(trim(content)) BETWEEN 40 AND 50000),
  cover_image_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT blog_posts_published_at CHECK ((status = 'published' AND published_at IS NOT NULL) OR status <> 'published')
);

CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(trim(title)) BETWEEN 5 AND 140),
  body text NOT NULL CHECK (char_length(trim(body)) BETWEEN 10 AND 5000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged', 'hidden')),
  moderation_note text CHECK (moderation_note IS NULL OR char_length(moderation_note) <= 500),
  moderated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  moderated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(trim(body)) BETWEEN 2 AND 2000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged', 'hidden')),
  moderated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  moderated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blog_posts_public_idx ON public.blog_posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS community_posts_moderation_idx ON public.community_posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS community_comments_post_idx ON public.community_comments(post_id, status, created_at);

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER set_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_community_posts_updated_at ON public.community_posts;
CREATE TRIGGER set_community_posts_updated_at BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_community_comments_updated_at ON public.community_comments;
CREATE TRIGGER set_community_comments_updated_at BEFORE UPDATE ON public.community_comments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY blog_posts_public_read ON public.blog_posts FOR SELECT TO public USING (status = 'published' OR (SELECT public.is_admin()));
CREATE POLICY blog_posts_admin_manage ON public.blog_posts FOR ALL TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY community_posts_read ON public.community_posts FOR SELECT TO public USING (
  status = 'approved' OR user_id = (SELECT auth.uid()) OR (SELECT public.is_admin())
);
CREATE POLICY community_posts_create ON public.community_posts FOR INSERT TO authenticated WITH CHECK (
  user_id = (SELECT auth.uid()) AND status = 'pending'
);
CREATE POLICY community_posts_admin_manage ON public.community_posts FOR UPDATE TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY community_posts_admin_delete ON public.community_posts FOR DELETE TO authenticated USING ((SELECT public.is_admin()));

CREATE POLICY community_comments_read ON public.community_comments FOR SELECT TO public USING (
  (status = 'approved' AND EXISTS (SELECT 1 FROM public.community_posts p WHERE p.id = post_id AND p.status = 'approved'))
  OR user_id = (SELECT auth.uid()) OR (SELECT public.is_admin())
);
CREATE POLICY community_comments_create ON public.community_comments FOR INSERT TO authenticated WITH CHECK (
  user_id = (SELECT auth.uid()) AND status = 'pending'
  AND EXISTS (SELECT 1 FROM public.community_posts p WHERE p.id = post_id AND p.status = 'approved')
);
CREATE POLICY community_comments_admin_manage ON public.community_comments FOR UPDATE TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY community_comments_admin_delete ON public.community_comments FOR DELETE TO authenticated USING ((SELECT public.is_admin()));

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('blog', 'blog', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY blog_storage_public_read ON storage.objects FOR SELECT TO public USING (bucket_id = 'blog');
CREATE POLICY blog_storage_admin_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog' AND (SELECT public.is_admin()));
CREATE POLICY blog_storage_admin_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'blog' AND (SELECT public.is_admin())) WITH CHECK (bucket_id = 'blog' AND (SELECT public.is_admin()));
CREATE POLICY blog_storage_admin_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'blog' AND (SELECT public.is_admin()));

NOTIFY pgrst, 'reload schema';
COMMIT;
