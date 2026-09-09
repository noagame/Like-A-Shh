-- Apply to staging first. This migration deliberately fails on an incompatible schema.
-- Functions use fixed search paths; caller identity always comes from auth.uid().
BEGIN;
CREATE OR REPLACE FUNCTION public.is_active_user() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid());
$$;
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT public.is_active_user() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;
REVOKE ALL ON FUNCTION public.is_active_user(), public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_active_user(), public.is_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.guard_profile_role() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF NEW.birth_date IS NOT NULL AND (NEW.birth_date > ((now() AT TIME ZONE 'America/Santiago')::date - interval '18 years')::date OR NEW.birth_date < ((now() AT TIME ZONE 'America/Santiago')::date - interval '120 years')::date) THEN
  RAISE EXCEPTION 'Invalid adult birth date';
 END IF;
 IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
   IF (TG_OP = 'INSERT' AND NEW.role IS DISTINCT FROM 'user') OR
      (TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role) THEN
     RAISE EXCEPTION 'Role changes require an administrator' USING ERRCODE = '42501';
   END IF;
 END IF;
 RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS guard_profile_role ON public.profiles;
CREATE TRIGGER guard_profile_role BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.guard_profile_role();

-- Restrictive policies compose with existing policies: a permissive legacy policy cannot bypass them.
DO $$
DECLARE tbl text; operation text;
BEGIN
 FOREACH tbl IN ARRAY ARRAY['profiles','attendances','consent_logs','audit_log','event_invitations','event_reviews','course_likes','media_likes','events','categories','courses','media','galleries','site_settings'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
  IF tbl IN ('events','categories','courses','media','galleries','site_settings') THEN
   FOREACH operation IN ARRAY ARRAY['INSERT','UPDATE','DELETE'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS qa_admin_%s ON public.%I', lower(operation), tbl);
    IF operation = 'INSERT' THEN
     EXECUTE format('CREATE POLICY qa_admin_insert ON public.%I AS RESTRICTIVE FOR INSERT TO public WITH CHECK ((SELECT public.is_admin()))', tbl);
    ELSIF operation = 'UPDATE' THEN
     EXECUTE format('CREATE POLICY qa_admin_update ON public.%I AS RESTRICTIVE FOR UPDATE TO public USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()))', tbl);
    ELSE
     EXECUTE format('CREATE POLICY qa_admin_delete ON public.%I AS RESTRICTIVE FOR DELETE TO public USING ((SELECT public.is_admin()))', tbl);
    END IF;
   END LOOP;
  ELSE
   EXECUTE format('DROP POLICY IF EXISTS qa_private_scope ON public.%I', tbl);
   IF tbl IN ('audit_log','event_invitations') THEN
    EXECUTE format('CREATE POLICY qa_private_scope ON public.%I AS RESTRICTIVE FOR ALL TO public USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()))', tbl);
   ELSE
    EXECUTE format('CREATE POLICY qa_private_scope ON public.%I AS RESTRICTIVE FOR ALL TO public USING ((SELECT public.is_active_user()) AND (%I = (SELECT auth.uid()) OR (SELECT public.is_admin()))) WITH CHECK ((SELECT public.is_active_user()) AND (%I = (SELECT auth.uid()) OR (SELECT public.is_admin())))', tbl, CASE WHEN tbl='profiles' THEN 'id' ELSE 'user_id' END, CASE WHEN tbl='profiles' THEN 'id' ELSE 'user_id' END);
   END IF;
  END IF;
  -- Ensure intended authenticated access also works when no previous permissive policy exists.
  EXECUTE format('DROP POLICY IF EXISTS qa_authenticated_access ON public.%I', tbl);
  EXECUTE format('CREATE POLICY qa_authenticated_access ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl);
 END LOOP;
END $$;
-- A permissive authenticated policy must not reveal draft content.
DROP POLICY IF EXISTS qa_events_read ON public.events;
CREATE POLICY qa_events_read ON public.events AS RESTRICTIVE FOR SELECT TO public USING (status='published' OR public.is_admin());
DROP POLICY IF EXISTS qa_courses_read ON public.courses;
CREATE POLICY qa_courses_read ON public.courses AS RESTRICTIVE FOR SELECT TO public USING (status='published' OR public.is_admin());

-- Anonymous requests to restrictive policies must evaluate false, rather than bypass the policy.
GRANT EXECUTE ON FUNCTION public.is_active_user(), public.is_admin() TO anon;
-- Only RPCs can remove profiles; otherwise deleting just the profile leaves Auth behind.
REVOKE DELETE ON public.profiles FROM anon, authenticated;
-- Consent is written by trusted triggers/RPCs, never forged by browser callers.
REVOKE INSERT, UPDATE, DELETE ON public.consent_logs FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.guard_attendance() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE e public.events; used integer; birth date;
BEGIN
 IF TG_OP = 'UPDATE' AND (NEW.event_id IS DISTINCT FROM OLD.event_id OR NEW.user_id IS DISTINCT FROM OLD.user_id) THEN
  RAISE EXCEPTION 'Attendance ownership cannot change';
 END IF;
 IF NEW.status NOT IN ('registered','cancelled') OR NEW.status IS NULL THEN RAISE EXCEPTION 'Invalid attendance status'; END IF;
 IF NEW.status <> 'registered' THEN RETURN NEW; END IF;
 -- Serializes every writer, including direct REST calls and admin whitelist updates.
 SELECT * INTO e FROM public.events WHERE id = NEW.event_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Event not found'; END IF;
 IF TG_OP = 'UPDATE' AND OLD.status = 'registered' THEN RETURN NEW; END IF;
 IF TG_OP = 'INSERT' AND EXISTS (SELECT 1 FROM public.attendances WHERE user_id=NEW.user_id AND event_id=NEW.event_id AND status='registered') THEN RETURN NEW; END IF;
 IF e.status <> 'published' OR e.start_time <= now() THEN RAISE EXCEPTION 'Event not available'; END IF;
 SELECT birth_date INTO birth FROM public.profiles WHERE id = NEW.user_id;
 IF birth IS NULL OR birth > ((now() AT TIME ZONE 'America/Santiago')::date - interval '18 years')::date THEN
  RAISE EXCEPTION 'Complete an adult profile before booking';
 END IF;
 SELECT count(*) INTO used FROM public.attendances WHERE event_id = NEW.event_id AND status = 'registered';
 IF e.capacity IS NOT NULL AND used >= e.capacity THEN RAISE EXCEPTION 'Event is full'; END IF;
 RETURN NEW;
END;
$$;
CREATE UNIQUE INDEX IF NOT EXISTS qa_attendance_unique ON public.attendances(user_id,event_id);
DROP TRIGGER IF EXISTS guard_attendance ON public.attendances;
CREATE TRIGGER guard_attendance BEFORE INSERT OR UPDATE ON public.attendances FOR EACH ROW EXECUTE FUNCTION public.guard_attendance();

CREATE OR REPLACE FUNCTION public.reserve_event(target_event_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF NOT public.is_active_user() THEN RAISE EXCEPTION 'Not authenticated' USING ERRCODE='42501'; END IF;
 -- Take the lock before the upsert so repeated requests by the same user are idempotent.
 PERFORM 1 FROM public.events WHERE id=target_event_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Event not found'; END IF;
 INSERT INTO public.attendances(user_id,event_id,status) VALUES(auth.uid(),target_event_id,'registered')
 ON CONFLICT(user_id,event_id) DO UPDATE SET status='registered';
END;
$$;

CREATE OR REPLACE FUNCTION public.hide_my_profile() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF NOT public.is_active_user() THEN RAISE EXCEPTION 'Not authenticated'; END IF;
 UPDATE public.profiles SET full_name='Perfil oculto', phone=NULL, gender='prefiero_no_decir', is_anonymized=true, updated_at=now() WHERE id=auth.uid();
 IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;
 INSERT INTO public.consent_logs(user_id,consent_type,accepted,policy_version)
 VALUES(auth.uid(),'ocultacion_perfil',true,'privacidad-v3-2026-09');
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_profile(target_user_id uuid, new_name text, new_phone text, new_role text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator required' USING ERRCODE='42501'; END IF;
 IF new_role NOT IN ('user','admin') OR length(trim(new_name)) NOT BETWEEN 2 AND 100 THEN RAISE EXCEPTION 'Invalid profile'; END IF;
 IF target_user_id=auth.uid() AND new_role <> 'admin' THEN RAISE EXCEPTION 'Cannot remove own admin role'; END IF;
 UPDATE public.profiles SET full_name=trim(new_name), phone=new_phone, role=new_role, updated_at=now() WHERE id=target_user_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;
 INSERT INTO public.audit_log(actor_id,action,metadata) VALUES(auth.uid(),'update_user_admin',jsonb_build_object('target_user_id',target_user_id,'role',new_role));
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_account(target_user_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE target_email text;
BEGIN
 IF NOT public.is_active_user() OR (target_user_id IS DISTINCT FROM auth.uid() AND NOT public.is_admin()) THEN
  RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501';
 END IF;
 IF target_user_id=auth.uid() AND NOT EXISTS (
  SELECT 1 FROM jsonb_array_elements(COALESCE(auth.jwt()->'amr','[]'::jsonb)) a
  WHERE a->>'method'='password' AND (a->>'timestamp')::numeric >= extract(epoch FROM now())-300
 ) THEN RAISE EXCEPTION 'Recent password authentication required'; END IF;
 SELECT email INTO target_email FROM auth.users WHERE id=target_user_id FOR UPDATE;
 IF NOT FOUND THEN RETURN; END IF;
 -- Storage objects must be removed through the Storage API, never by deleting metadata here.
 IF EXISTS (SELECT 1 FROM storage.objects WHERE owner_id=target_user_id::text) THEN
  RAISE EXCEPTION 'Account owns stored files: transfer or remove them through Storage before deletion';
 END IF;
 DELETE FROM public.event_invitations WHERE lower(email)=lower(target_email);
 DELETE FROM public.event_reviews WHERE user_id=target_user_id;
 DELETE FROM public.course_likes WHERE user_id=target_user_id;
 DELETE FROM public.media_likes WHERE user_id=target_user_id;
 DELETE FROM public.attendances WHERE user_id=target_user_id;
 DELETE FROM public.consent_logs WHERE user_id=target_user_id;
 DELETE FROM public.audit_log WHERE actor_id=target_user_id OR metadata->>'target_user_id'=target_user_id::text OR metadata->'emails' ? target_email;
 DELETE FROM public.profiles WHERE id=target_user_id;
 DELETE FROM auth.users WHERE id=target_user_id;
 -- Any unexpected FK error rolls back the entire operation, including all profile data.
END;
$$;

-- Consent is captured in the same transaction as Auth creation, before email confirmation.
CREATE OR REPLACE FUNCTION public.capture_signup_consent() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF NEW.raw_user_meta_data->>'accepted_privacy'='true' AND NEW.raw_user_meta_data->>'privacy_policy_version'='privacidad-v3-2026-09' THEN
  INSERT INTO public.consent_logs(user_id,consent_type,accepted,policy_version)
  VALUES(NEW.id,'registro_y_privacidad',true,'privacidad-v3-2026-09');
 END IF;
 RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS zz_capture_signup_consent ON auth.users;
CREATE TRIGGER zz_capture_signup_consent AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.capture_signup_consent();

CREATE OR REPLACE FUNCTION public.add_event_whitelist(target_event_id uuid, invited_emails text[]) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE email_value text; profile_id uuid; registered_count integer := 0; pending_count integer := 0;
BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator required'; END IF;
 IF cardinality(invited_emails) IS NULL OR cardinality(invited_emails) NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Invalid invitation count'; END IF;
 PERFORM 1 FROM public.events WHERE id=target_event_id AND status='published' AND start_time>now() FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Event unavailable'; END IF;
 FOR email_value IN SELECT DISTINCT lower(trim(value)) FROM unnest(invited_emails) value LOOP
  IF email_value !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' THEN RAISE EXCEPTION 'Invalid email'; END IF;
  SELECT id INTO profile_id FROM public.profiles WHERE lower(email)=email_value;
  IF profile_id IS NOT NULL THEN
   INSERT INTO public.attendances(user_id,event_id,status) VALUES(profile_id,target_event_id,'registered')
   ON CONFLICT(user_id,event_id) DO UPDATE SET status='registered';
   registered_count := registered_count+1;
  ELSE
   INSERT INTO public.event_invitations(event_id,email,status) VALUES(target_event_id,email_value,'pending')
   ON CONFLICT(event_id,email) DO UPDATE SET status='pending';
   pending_count := pending_count+1;
  END IF;
 END LOOP;
 INSERT INTO public.audit_log(actor_id,action,metadata) VALUES(auth.uid(),'add_event_whitelist',jsonb_build_object('event_id',target_event_id,'registered',registered_count,'pending',pending_count));
 RETURN jsonb_build_object('registered',registered_count,'pending',pending_count);
END;
$$;
REVOKE ALL ON FUNCTION public.add_event_whitelist(uuid,text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_event_whitelist(uuid,text[]) TO authenticated;

-- Restrict writes to application buckets without changing their current visibility.
DROP POLICY IF EXISTS qa_storage_insert ON storage.objects;
CREATE POLICY qa_storage_insert ON storage.objects AS RESTRICTIVE FOR INSERT TO public WITH CHECK (bucket_id NOT IN ('eventos','galerias') OR public.is_admin());
DROP POLICY IF EXISTS qa_storage_update ON storage.objects;
CREATE POLICY qa_storage_update ON storage.objects AS RESTRICTIVE FOR UPDATE TO public USING (bucket_id NOT IN ('eventos','galerias') OR public.is_admin()) WITH CHECK (bucket_id NOT IN ('eventos','galerias') OR public.is_admin());
DROP POLICY IF EXISTS qa_storage_delete ON storage.objects;
CREATE POLICY qa_storage_delete ON storage.objects AS RESTRICTIVE FOR DELETE TO public USING (bucket_id NOT IN ('eventos','galerias') OR public.is_admin());

REVOKE ALL ON FUNCTION public.reserve_event(uuid), public.hide_my_profile(), public.admin_update_profile(uuid,text,text,text), public.delete_account(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_event(uuid), public.hide_my_profile(), public.admin_update_profile(uuid,text,text,text), public.delete_account(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.guard_profile_role(), public.guard_attendance(), public.capture_signup_consent() FROM PUBLIC;
COMMIT;
