-- Tighten permissive RLS policies: require an authenticated identity
-- instead of blanket TRUE for INSERT/UPDATE/DELETE on shared workspace tables.

-- orders
DROP POLICY IF EXISTS "orders insert" ON public.orders;
DROP POLICY IF EXISTS "orders update" ON public.orders;
DROP POLICY IF EXISTS "orders delete" ON public.orders;

CREATE POLICY "orders insert" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "orders update" ON public.orders
  FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "orders delete" ON public.orders
  FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- team_members
DROP POLICY IF EXISTS "team insert" ON public.team_members;
DROP POLICY IF EXISTS "team update" ON public.team_members;
DROP POLICY IF EXISTS "team delete" ON public.team_members;

CREATE POLICY "team insert" ON public.team_members
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "team update" ON public.team_members
  FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "team delete" ON public.team_members
  FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- activity_logs (insert only — no updates/deletes are allowed)
DROP POLICY IF EXISTS "logs insert" ON public.activity_logs;

CREATE POLICY "logs insert" ON public.activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
