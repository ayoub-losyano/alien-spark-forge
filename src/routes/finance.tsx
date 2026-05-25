import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { formatVND, logActivity } from "@/lib/logger";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/finance")({ component: () => <AppLayout><Finance /></AppLayout> });

const PAY_STATUSES = ["pending", "partial", "completed", "refunded"];

function Finance() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["finance-orders"],
    queryFn: async () => (await supabase.from("orders").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const orders = data ?? [];
  const total = orders.reduce((s, o) => s + Number(o.total ?? 0), 0);
  const deposits = orders.reduce((s, o) => s + Number(o.deposit ?? 0), 0);
  const completed = orders.filter((o) => o.payment_status === "completed").reduce((s, o) => s + Number(o.total ?? 0), 0);
  const pending = total - deposits;

  const now = new Date();
  const monthly = orders
    .filter((o) => {
      const d = new Date(o.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, o) => s + Number(o.total ?? 0), 0);

  const updatePay = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ payment_status: status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Payment status updated");
    logActivity("payment_updated", `Payment status set to ${status}`, "order", id);
    qc.invalidateQueries({ queryKey: ["finance-orders"] });
  };

  const stats = [
    { label: "Total revenue", value: formatVND(total) },
    { label: "Deposits received", value: formatVND(deposits) },
    { label: "Pending payments", value: formatVND(pending) },
    { label: "Completed payments", value: formatVND(completed) },
    { label: "This month", value: formatVND(monthly) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Finance</h1>
        <p className="text-sm text-muted-foreground">Revenue and payment tracking.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="mt-1 text-lg md:text-xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-white/5">
              <tr>
                <th className="text-left px-4 py-3 font-normal">Client</th>
                <th className="text-left px-4 py-3 font-normal">Package</th>
                <th className="text-left px-4 py-3 font-normal">Total</th>
                <th className="text-left px-4 py-3 font-normal">Deposit</th>
                <th className="text-left px-4 py-3 font-normal">Remaining</th>
                <th className="text-left px-4 py-3 font-normal">Method</th>
                <th className="text-left px-4 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Loading…</td></tr>}
              {!isLoading && orders.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No orders yet.</td></tr>}
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-border/30 hover:bg-white/5">
                  <td className="px-4 py-3 font-medium">{o.client_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.package ?? "—"}</td>
                  <td className="px-4 py-3">{formatVND(o.total)}</td>
                  <td className="px-4 py-3">{formatVND(o.deposit)}</td>
                  <td className="px-4 py-3">{formatVND(Number(o.total) - Number(o.deposit))}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{o.payment_method ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Select value={o.payment_status ?? "pending"} onValueChange={(v) => updatePay(o.id, v)}>
                      <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>{PAY_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}