
-- 1. Fix notifications: only show notifications for the user (or broadcast)
-- Note: recipient_id maps to auth.users.id. Since this app uses team_members.email
-- linked via auth email, broadcast (NULL) notifications remain visible to all.
DROP POLICY IF EXISTS "notif read" ON public.notifications;
CREATE POLICY "notif read"
ON public.notifications
FOR SELECT
TO authenticated
USING (recipient_id IS NULL OR recipient_id = auth.uid());

-- 2. Helper: is current user an admin? Based on team_members.role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.email = (SELECT auth.jwt() ->> 'email')
      AND lower(coalesce(tm.role,'')) IN ('admin','owner','founder')
  )
  OR NOT EXISTS (SELECT 1 FROM public.team_members WHERE lower(coalesce(role,'')) IN ('admin','owner','founder'));
  -- Bootstrap: if no admin exists yet, allow any authenticated user (first user becomes admin).
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 3. Restrict team_members write operations to admins
DROP POLICY IF EXISTS "team insert" ON public.team_members;
DROP POLICY IF EXISTS "team update" ON public.team_members;
DROP POLICY IF EXISTS "team delete" ON public.team_members;

CREATE POLICY "team insert" ON public.team_members
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "team update" ON public.team_members
FOR UPDATE TO authenticated
USING (public.is_admin() OR email = (SELECT auth.jwt() ->> 'email'))
WITH CHECK (public.is_admin() OR email = (SELECT auth.jwt() ->> 'email'));

CREATE POLICY "team delete" ON public.team_members
FOR DELETE TO authenticated
USING (public.is_admin());

-- 4. Restrict company_settings writes to admins, and add DELETE policy
DROP POLICY IF EXISTS "company_settings insert" ON public.company_settings;
DROP POLICY IF EXISTS "company_settings update" ON public.company_settings;

CREATE POLICY "company_settings insert" ON public.company_settings
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "company_settings update" ON public.company_settings
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "company_settings delete" ON public.company_settings
FOR DELETE TO authenticated
USING (public.is_admin());

-- 5. Storage: prevent anonymous listing of avatars bucket.
-- Public-bucket files remain accessible via direct CDN URL (getPublicUrl);
-- restricting SELECT on storage.objects only blocks the list/search API.
DROP POLICY IF EXISTS "Avatars public read" ON storage.objects;
CREATE POLICY "Avatars authenticated read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');
