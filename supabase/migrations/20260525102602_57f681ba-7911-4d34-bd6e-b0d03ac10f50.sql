
-- TEAM MEMBERS
CREATE TABLE public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  email text,
  phone text,
  avatar_data_url text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team read" ON public.team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "team insert" ON public.team_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "team update" ON public.team_members FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "team delete" ON public.team_members FOR DELETE TO authenticated USING (true);

-- ORDERS
CREATE TABLE public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_name text not null,
  zalo text,
  email text,
  phone text,
  business_name text,
  business_type text,
  address text,
  facebook text,
  tiktok text,
  website text,
  package text,
  total numeric not null default 0,
  deposit numeric not null default 0,
  payment_method text,
  payment_status text not null default 'pending',
  delivery_days integer,
  deadline timestamptz,
  progress integer not null default 0,
  status text not null default 'lead',
  assigned_to text,
  notes text
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders read" ON public.orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "orders insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "orders update" ON public.orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "orders delete" ON public.orders FOR DELETE TO authenticated USING (true);

-- ACTIVITY LOGS
CREATE TABLE public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null,
  message text not null,
  entity_type text,
  entity_id text
);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logs read" ON public.activity_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "logs insert" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);
