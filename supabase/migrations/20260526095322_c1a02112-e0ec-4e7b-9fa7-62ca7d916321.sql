
-- ORDERS extensions
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS service_category text,
  ADD COLUMN IF NOT EXISTS estimated_delivery date,
  ADD COLUMN IF NOT EXISTS internal_notes text,
  ADD COLUMN IF NOT EXISTS client_notes text,
  ADD COLUMN IF NOT EXISTS client_avatar_url text,
  ADD COLUMN IF NOT EXISTS assigned_employee_id uuid REFERENCES public.team_members(id) ON DELETE SET NULL;

-- TEAM extensions
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS permissions jsonb NOT NULL DEFAULT '{}'::jsonb;

-- ORDER STATUS HISTORY
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  changed_by text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "osh read" ON public.order_status_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "osh insert" ON public.order_status_history FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- ORDER COMMENTS
CREATE TABLE IF NOT EXISTS public.order_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  author_name text,
  body text NOT NULL,
  is_internal boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.order_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "oc read" ON public.order_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "oc insert" ON public.order_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "oc update" ON public.order_comments FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "oc delete" ON public.order_comments FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- ORDER ATTACHMENTS
CREATE TABLE IF NOT EXISTS public.order_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  size bigint,
  mime text,
  uploaded_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.order_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "oa read" ON public.order_attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "oa insert" ON public.order_attachments FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "oa delete" ON public.order_attachments FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  number text NOT NULL UNIQUE,
  client_name text,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'VND',
  status text NOT NULL DEFAULT 'draft',
  due_date date,
  issued_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inv read" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "inv insert" ON public.invoices FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "inv update" ON public.invoices FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "inv delete" ON public.invoices FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  body text,
  entity_type text,
  entity_id text,
  recipient_id uuid,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif read" ON public.notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "notif insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "notif update" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "notif delete" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- Trigger: order status change -> history + notification
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.order_status_history (order_id, from_status, to_status, to_status)
      VALUES (NEW.id, NULL, NEW.status, NEW.status) ON CONFLICT DO NOTHING;
    INSERT INTO public.notifications (type, title, body, entity_type, entity_id)
      VALUES ('order_created', 'New order', 'Order for ' || NEW.client_name || ' created', 'order', NEW.id::text);
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_status_history (order_id, from_status, to_status)
      VALUES (NEW.id, OLD.status, NEW.status);
    INSERT INTO public.notifications (type, title, body, entity_type, entity_id)
      VALUES ('order_updated', 'Order status changed', NEW.client_name || ': ' || OLD.status || ' → ' || NEW.status, 'order', NEW.id::text);
  END IF;
  RETURN NEW;
END;
$$;

-- Simpler version (the above duplicate column is a typo); recreate cleanly:
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.order_status_history (order_id, from_status, to_status)
      VALUES (NEW.id, NULL, NEW.status);
    INSERT INTO public.notifications (type, title, body, entity_type, entity_id)
      VALUES ('order_created', 'New order', 'Order for ' || NEW.client_name || ' created', 'order', NEW.id::text);
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_status_history (order_id, from_status, to_status)
      VALUES (NEW.id, OLD.status, NEW.status);
    INSERT INTO public.notifications (type, title, body, entity_type, entity_id)
      VALUES ('order_updated', 'Order status changed', NEW.client_name || ': ' || OLD.status || ' → ' || NEW.status, 'order', NEW.id::text);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_status ON public.orders;
CREATE TRIGGER trg_orders_status
AFTER INSERT OR UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();

-- Storage bucket for order files (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('order-files', 'order-files', false)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "order-files read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'order-files');
CREATE POLICY "order-files insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'order-files');
CREATE POLICY "order-files delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'order-files');
