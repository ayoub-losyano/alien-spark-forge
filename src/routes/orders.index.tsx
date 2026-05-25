import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Trash2, Pencil, PlusCircle } from "lucide-react";
import { ORDER_STATUSES, PACKAGES, STATUS_COLORS, formatVND, logActivity } from "@/lib/logger";

export const Route = createFileRoute("/orders/")({ component: () => <AppLayout><OrdersPage /></AppLayout> });

function OrdersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [pkg, setPkg] = useState<string>("all");
  const [editing, setEditing] = useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (data ?? []).filter((o) => {
    if (status !== "all" && o.status !== status) return false;
    if (pkg !== "all" && o.package !== pkg) return false;
    if (search && !`${o.client_name} ${o.business_name ?? ""} ${o.email ?? ""}`.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete order for ${name}?`)) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Order deleted");
    qc.invalidateQueries({ queryKey: ["orders"] });
    logActivity("order_deleted", `Order for ${name} deleted`, "order", id);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Orders & Projects</h1>
          <p className="text-sm text-muted-foreground">Manage all client orders and project progress.</p>
        </div>
        <Link to="/orders/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <PlusCircle className="h-4 w-4" /> New Order
          </Button>
        </Link>
      </div>

      <div className="glass rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search clients…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="md:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={pkg} onValueChange={setPkg}>
          <SelectTrigger className="md:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All packages</SelectItem>
            {PACKAGES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-white/5">
              <tr>
                <th className="text-left px-4 py-3 font-normal">Client</th>
                <th className="text-left px-4 py-3 font-normal">Package</th>
                <th className="text-left px-4 py-3 font-normal">Total</th>
                <th className="text-left px-4 py-3 font-normal">Paid</th>
                <th className="text-left px-4 py-3 font-normal">Progress</th>
                <th className="text-left px-4 py-3 font-normal">Status</th>
                <th className="text-left px-4 py-3 font-normal">Assigned</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">Loading…</td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">No orders found.</td></tr>
              )}
              {filtered.map((o) => (
                <tr key={o.id} className="border-t border-border/30 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.client_name}</div>
                    <div className="text-xs text-muted-foreground">{o.business_name}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{o.package ?? "—"}</td>
                  <td className="px-4 py-3">{formatVND(o.total)}</td>
                  <td className="px-4 py-3">{formatVND(o.deposit)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${o.progress ?? 0}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{o.progress ?? 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[o.status] ?? ""}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{o.assigned_to ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditing(o)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => del(o.id, o.client_name)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EditOrderDialog order={editing} onClose={() => setEditing(null)} onSaved={() => qc.invalidateQueries({ queryKey: ["orders"] })} />
    </div>
  );
}

function EditOrderDialog({ order, onClose, onSaved }: { order: any; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<any>(order);
  // Reset state when a new order is selected
  if (order && (!f || f.id !== order.id)) setF(order);
  if (!order) return null;

  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));

  const save = async () => {
    const payment_status =
      Number(f.deposit) >= Number(f.total) && Number(f.total) > 0
        ? "completed"
        : Number(f.deposit) > 0
        ? "partial"
        : "pending";
    const { error } = await supabase
      .from("orders")
      .update({
        client_name: f.client_name,
        business_name: f.business_name,
        package: f.package,
        total: Number(f.total),
        deposit: Number(f.deposit),
        progress: Number(f.progress),
        status: f.status,
        assigned_to: f.assigned_to,
        notes: f.notes,
        payment_status,
      })
      .eq("id", order.id);
    if (error) return toast.error(error.message);
    toast.success("Order updated");
    logActivity("order_updated", `Order for ${f.client_name} updated`, "order", order.id);
    onSaved();
    onClose();
  };

  return (
    <Dialog open={!!order} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl glass">
        <DialogHeader><DialogTitle>Edit Order</DialogTitle></DialogHeader>
        <div className="grid md:grid-cols-2 gap-3">
          <div><Label className="text-xs">Client name</Label><Input value={f?.client_name ?? ""} onChange={(e) => set("client_name", e.target.value)} /></div>
          <div><Label className="text-xs">Business name</Label><Input value={f?.business_name ?? ""} onChange={(e) => set("business_name", e.target.value)} /></div>
          <div><Label className="text-xs">Package</Label>
            <Select value={f?.package ?? ""} onValueChange={(v) => set("package", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PACKAGES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Status</Label>
            <Select value={f?.status ?? "lead"} onValueChange={(v) => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Total (VND)</Label><Input type="number" value={f?.total ?? 0} onChange={(e) => set("total", e.target.value)} /></div>
          <div><Label className="text-xs">Deposit (VND)</Label><Input type="number" value={f?.deposit ?? 0} onChange={(e) => set("deposit", e.target.value)} /></div>
          <div><Label className="text-xs">Progress %</Label><Input type="number" min={0} max={100} value={f?.progress ?? 0} onChange={(e) => set("progress", e.target.value)} /></div>
          <div><Label className="text-xs">Assigned to</Label><Input value={f?.assigned_to ?? ""} onChange={(e) => set("assigned_to", e.target.value)} /></div>
          <div className="md:col-span-2"><Label className="text-xs">Notes</Label><Textarea rows={3} value={f?.notes ?? ""} onChange={(e) => set("notes", e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={save}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}