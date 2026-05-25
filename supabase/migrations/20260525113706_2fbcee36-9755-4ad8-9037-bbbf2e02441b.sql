
-- 1) Extra fields on orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS service text,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'VND';

-- 2) Expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  description text NOT NULL,
  category text,
  amount numeric NOT NULL DEFAULT 0,
  paid_on date NOT NULL DEFAULT current_date,
  notes text
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "expenses read" ON public.expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "expenses insert" ON public.expenses FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "expenses update" ON public.expenses FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "expenses delete" ON public.expenses FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- 3) Company settings (singleton row)
CREATE TABLE IF NOT EXISTS public.company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_name text NOT NULL DEFAULT 'AlienSpark VN',
  contact_email text,
  zalo text,
  address text,
  currency text NOT NULL DEFAULT 'VND',
  language text NOT NULL DEFAULT 'English',
  logo_url text,
  notify_new_order boolean NOT NULL DEFAULT true,
  notify_payment boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_settings read" ON public.company_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "company_settings insert" ON public.company_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "company_settings update" ON public.company_settings FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Seed a singleton row if empty
INSERT INTO public.company_settings (agency_name)
SELECT 'AlienSpark VN'
WHERE NOT EXISTS (SELECT 1 FROM public.company_settings);

-- 4) Avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatars public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Avatars authenticated upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Avatars authenticated update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Avatars authenticated delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars');
