import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ORDER_STATUSES, PACKAGES, logActivity } from "@/lib/logger";

export const Route = createFileRoute("/orders/new")({ component: () => <AppLayout><NewOrder /></AppLayout> });

function NewOrder() {
  const nav = useNavigate();
  const team = useQuery({
    queryKey: ["team"],
    queryFn: async () => (await supabase.from("team_members").select("id,name")).data ?? [],
  });

  const [f, setF] = useState({
    client_name: "",
    company_name: "",
    zalo: "",
    email: "",
    phone: "",
    business_name: "",
    business_type: "",
    address: "",
    facebook: "",
    tiktok: "",
    website: "",
    package: "",
    service: "",
    total: 0,
    deposit: 0,
    payment_method: "",
    delivery_days: 14,
    assigned_to: "",
    notes: "",
    status: "lead" as string,
  });
  const [busy, setBusy] = useState(false);

  const set = (k: string, v: any) => setF((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.client_name.trim()) return toast.error("Client name is required");
    setBusy(true);
    const deadline = f.delivery_days
      ? new Date(Date.now() + Number(f.delivery_days) * 86400000).toISOString()
      : null;
    const payment_status = Number(f.deposit) >= Number(f.total) && Number(f.total) > 0 ? "completed" : Number(f.deposit) > 0 ? "partial" : "pending";
    const { error, data } = await supabase
      .from("orders")
      .insert({
        ...f,
        total: Number(f.total),
        deposit: Number(f.deposit),
        delivery_days: Number(f.delivery_days),
        deadline,
        payment_status,
        progress: 0,
      })
      .select()
      .single();
    setBusy(false);
    if (error) return toast.error(error.message);
    await logActivity("order_created", `New order created for ${f.client_name}`, "order", data?.id);
    toast.success("Order created");
    nav({ to: "/orders" });
  };

  const Field = ({ id, label, children }: any) => (
    <div>
      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">New Order</h1>
        <p className="text-sm text-muted-foreground">Create a new client order or lead.</p>
      </div>
      <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-6">
        <section className="grid md:grid-cols-2 gap-4">
          <Field id="client_name" label="Client name *">
            <Input id="client_name" value={f.client_name} onChange={(e) => set("client_name", e.target.value)} required />
          </Field>
          <Field id="company_name" label="Company name">
            <Input id="company_name" value={f.company_name} onChange={(e) => set("company_name", e.target.value)} />
          </Field>
          <Field id="business_name" label="Business name">
            <Input id="business_name" value={f.business_name} onChange={(e) => set("business_name", e.target.value)} />
          </Field>
          <Field id="business_type" label="Business type">
            <Input id="business_type" value={f.business_type} onChange={(e) => set("business_type", e.target.value)} />
          </Field>
          <Field id="address" label="Address">
            <Input id="address" value={f.address} onChange={(e) => set("address", e.target.value)} />
          </Field>
          <Field id="service" label="Service / scope">
            <Input id="service" value={f.service} onChange={(e) => set("service", e.target.value)} placeholder="e.g. Landing page + chatbot" />
          </Field>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          <Field id="email" label="Email"><Input id="email" type="email" value={f.email} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field id="phone" label="Phone"><Input id="phone" value={f.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
          <Field id="zalo" label="Zalo"><Input id="zalo" value={f.zalo} onChange={(e) => set("zalo", e.target.value)} /></Field>
          <Field id="facebook" label="Facebook URL"><Input id="facebook" value={f.facebook} onChange={(e) => set("facebook", e.target.value)} /></Field>
          <Field id="tiktok" label="TikTok URL"><Input id="tiktok" value={f.tiktok} onChange={(e) => set("tiktok", e.target.value)} /></Field>
          <Field id="website" label="Website URL"><Input id="website" value={f.website} onChange={(e) => set("website", e.target.value)} /></Field>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          <Field id="package" label="Package">
            <Select value={f.package} onValueChange={(v) => set("package", v)}>
              <SelectTrigger><SelectValue placeholder="Select package" /></SelectTrigger>
              <SelectContent>{PACKAGES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field id="total" label="Total price (VND)"><Input id="total" type="number" value={f.total} onChange={(e) => set("total", e.target.value)} /></Field>
          <Field id="deposit" label="Deposit paid (VND)"><Input id="deposit" type="number" value={f.deposit} onChange={(e) => set("deposit", e.target.value)} /></Field>
          <Field id="payment_method" label="Payment method">
            <Select value={f.payment_method} onValueChange={(v) => set("payment_method", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {["Bank transfer", "Momo", "ZaloPay", "Cash", "Other"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field id="delivery_days" label="Delivery (days)"><Input id="delivery_days" type="number" value={f.delivery_days} onChange={(e) => set("delivery_days", e.target.value)} /></Field>
          <Field id="assigned_to" label="Assigned to">
            <Select value={f.assigned_to} onValueChange={(v) => set("assigned_to", v)}>
              <SelectTrigger><SelectValue placeholder="Team member" /></SelectTrigger>
              <SelectContent>{(team.data ?? []).map((t) => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <Field id="status" label="Status">
            <Select value={f.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field id="notes" label="Notes">
            <Textarea id="notes" value={f.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
          </Field>
        </section>

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={() => nav({ to: "/orders" })}>Cancel</Button>
          <Button type="submit" disabled={busy} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {busy ? "Saving…" : "Create order"}
          </Button>
        </div>
      </form>
    </div>
  );
}