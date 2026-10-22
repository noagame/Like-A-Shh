-- Preparada con autorización del usuario; no aplicar sin aprobación adicional.
BEGIN;

CREATE TABLE public.blog_post_reactions (
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

CREATE INDEX blog_post_reactions_user_idx ON public.blog_post_reactions(user_id);
ALTER TABLE public.blog_post_reactions ENABLE ROW LEVEL SECURITY;

-- Las identidades de quienes reaccionan solo son visibles para su propietario.
CREATE POLICY blog_post_reactions_own_read ON public.blog_post_reactions
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE POLICY blog_post_reactions_student_insert ON public.blog_post_reactions
  FOR INSERT TO authenticated WITH CHECK (
    user_id = (SELECT auth.uid())
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid()) AND p.role = 'user')
    AND EXISTS (SELECT 1 FROM public.blog_posts p WHERE p.id = post_id AND p.status = 'published')
  );

CREATE POLICY blog_post_reactions_student_delete ON public.blog_post_reactions
  FOR DELETE TO authenticated USING (
    user_id = (SELECT auth.uid())
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid()) AND p.role = 'user')
    AND EXISTS (SELECT 1 FROM public.blog_posts p WHERE p.id = post_id AND p.status = 'published')
  );

REVOKE ALL ON public.blog_post_reactions FROM anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.blog_post_reactions TO authenticated;

-- El público obtiene totales de artículos publicados, sin correos ni user_id.
CREATE FUNCTION public.get_blog_reaction_counts(post_ids uuid[])
RETURNS TABLE(post_id uuid, likes_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT p.id, count(r.user_id)
  FROM public.blog_posts p
  LEFT JOIN public.blog_post_reactions r ON r.post_id = p.id
  WHERE p.id = ANY(post_ids) AND p.status = 'published'
  GROUP BY p.id;
$$;

REVOKE ALL ON FUNCTION public.get_blog_reaction_counts(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_blog_reaction_counts(uuid[]) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
COMMIT;
