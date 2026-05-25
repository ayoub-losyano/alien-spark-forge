import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { formatVND, STATUS_COLORS } from "@/lib/logger";
import {
  ShoppingCart,
  Activity,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertTriangle,
  Sparkles,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({ component: () => <AppLayout><Dashboard /></AppLayout> });

function Dashboard() {
  const ordersQ = useQuery({
    queryKey: ["orders-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const teamQ = useQuery({
    queryKey: ["team-count"],
    queryFn: async () => {
      const { count } = await supabase.from("team_members").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const logsQ = useQuery({
    queryKey: ["logs-recent"],
    queryFn: async () => {
      const { data } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(8);
      return data ?? [];
    },
  });

  const orders = ordersQ.data ?? [];
  const total = orders.length;
  const active = orders.filter((o) => o.status === "active").length;
  const completed = orders.filter((o) => o.status === "completed").length;
  const overdue = orders.filter((o) => o.status === "overdue").length;
  const revenue = orders.reduce((s, o) => s + Number(o.total ?? 0), 0);
  const pendingPay = orders
    .filter((o) => o.payment_status !== "completed")
    .reduce((s, o) => s + (Number(o.total ?? 0) - Number(o.deposit ?? 0)), 0);
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const leadsMonth = orders.filter((o) => {
    const d = new Date(o.created_at);
    return o.status === "lead" && d.getMonth() === month && d.getFullYear() === year;
  }).length;

  const recent = orders.slice(0, 6);

  const stats = [
    { label: "Total Orders", value: total, icon: ShoppingCart },
    { label: "Active Projects", value: active, icon: Activity },
    { label: "Completed", value: completed, icon: CheckCircle2 },
    { label: "Pending Payments", value: formatVND(pendingPay), icon: Clock },
    { label: "Total Revenue", value: formatVND(revenue), icon: DollarSign },
    { label: "Overdue", value: overdue, icon: AlertTriangle },
    { label: "New Leads (mo)", value: leadsMonth, icon: Sparkles },
    { label: "Team Members", value: teamQ.data ?? 0, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Operational overview of AlienSpark VN</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-xl md:text-2xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <h2 className="font-semibold mb-3">Recent Orders</h2>
          {ordersQ.isLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : recent.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">No orders yet. Create your first one.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-border/40">
                    <th className="text-left py-2 font-normal">Client</th>
                    <th className="text-left py-2 font-normal">Package</th>
                    <th className="text-left py-2 font-normal">Total</th>
                    <th className="text-left py-2 font-normal">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o) => (
                    <tr key={o.id} className="border-b border-border/20 last:border-0">
                      <td className="py-3">{o.client_name}</td>
                      <td className="py-3 text-muted-foreground">{o.package ?? "—"}</td>
                      <td className="py-3">{formatVND(o.total)}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[o.status] ?? ""}`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold mb-3">Recent Activity</h2>
          {(logsQ.data ?? []).length === 0 ? (
            <div className="text-sm text-muted-foreground">No activity yet.</div>
          ) : (
            <ul className="space-y-3 text-sm">
              {logsQ.data!.map((l) => (
                <li key={l.id} className="flex gap-3">
                  <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <div>{l.message}</div>
                    <div className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}