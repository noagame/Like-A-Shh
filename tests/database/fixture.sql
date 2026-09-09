-- Disposable test schema, not the deployed schema. Run only in a new local database.
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon NOLOGIN; END IF; IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF; END $$;
CREATE SCHEMA auth;
CREATE SCHEMA storage;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
CREATE TABLE auth.users(id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb DEFAULT '{}');
CREATE TABLE public.profiles(id uuid PRIMARY KEY REFERENCES auth.users, role text DEFAULT 'user', full_name text, email text, phone text, gender text, birth_date date, is_anonymized boolean DEFAULT false, updated_at timestamptz);
CREATE TABLE public.events(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text, status text DEFAULT 'published', start_time timestamptz DEFAULT now()+interval '1 day', end_time timestamptz DEFAULT now()+interval '2 days', capacity integer);
CREATE TABLE public.attendances(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users, event_id uuid REFERENCES events, status text, created_at timestamptz DEFAULT now());
CREATE TABLE public.consent_logs(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users, consent_type text, accepted boolean, policy_version text, ip_address text);
CREATE TABLE public.audit_log(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid REFERENCES auth.users, action text, metadata jsonb);
CREATE TABLE public.event_invitations(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text, event_id uuid REFERENCES events, status text, UNIQUE(event_id,email));
CREATE TABLE public.event_reviews(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users);
CREATE TABLE public.course_likes(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users);
CREATE TABLE public.media_likes(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users);
CREATE TABLE public.categories(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text);
CREATE TABLE public.courses(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), status text);
CREATE TABLE public.media(id uuid PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE public.site_settings(id boolean PRIMARY KEY DEFAULT true, site_title text);
CREATE TABLE public.galleries(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text);
CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id text, bucket_id text);
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
CREATE POLICY legacy_storage ON storage.objects FOR ALL TO public USING(true) WITH CHECK(true);
-- Simulate permissive legacy policies, deliberately unsafe before migration.
DO $$ DECLARE t text; BEGIN
 FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('CREATE POLICY legacy_open ON public.%I FOR ALL TO public USING(true) WITH CHECK(true)',t);
 END LOOP;
END $$;
GRANT USAGE ON SCHEMA public,auth,storage TO anon,authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public,storage TO anon,authenticated;
