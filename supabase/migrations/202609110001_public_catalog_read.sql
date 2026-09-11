-- Public catalog data is intentionally readable without authentication.
-- Write operations remain restricted by the policies installed in 202609090001.
BEGIN;

DROP POLICY IF EXISTS qa_public_events_read ON public.events;
CREATE POLICY qa_public_events_read ON public.events
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS qa_public_courses_read ON public.courses;
CREATE POLICY qa_public_courses_read ON public.courses
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

-- Categories only contain display labels and are required by the public agenda join.
DROP POLICY IF EXISTS qa_public_categories_read ON public.categories;
CREATE POLICY qa_public_categories_read ON public.categories
  FOR SELECT TO anon, authenticated
  USING (true);

COMMIT;
