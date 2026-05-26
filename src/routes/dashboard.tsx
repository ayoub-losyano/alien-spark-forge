import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { orderService, expenseService } from "@/lib/logger";
import { formatVND } from "@/lib/logger";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "@tanstack/react-router";
import { usePagination } from "@/hooks";
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

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  ),
});

function Dashboard() {
  const qc = useQueryClient();

  const ordersQ = useQuery({
    queryKey: ["orders-all"],
    queryFn: orderService.getAll,
  });

  const teamQ = useQuery({
    queryKey: ["team-count"],
    queryFn: async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { count } = await supabase
        .from("team_members")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const logsQ = useQuery({
    queryKey: ["logs-recent"],
    queryFn: async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
      return data ?? [];
    },
  });

  const orders = ordersQ.data ?? [];
  const total = orders.length;
  const activeStatuses = [
    "lead",
    "contacted",
    "waiting_payment",
    "in_progress",
    "review",
  ];
  const active = orders.filter((o) => activeStatuses.includes(o.status)).length;
  const completed = orders.filter(
    (o) => o.status === "completed" || o.status === "delivered"
  ).length;
  const now = new Date();
  const overdue = orders.filter(
    (o) =>
      o.deadline &&
      new Date(o.deadline) < now &&
      !["completed", "delivered", "cancelled"].includes(o.status)
  ).length;
  const revenue = orders.reduce(
    (s, o) => s + Number(o.total ?? 0),
    0
  );
  const pendingPay = orders
    .filter((o) => o.payment_status !== "completed")
    .reduce(
      (s, o) => s + (Number(o.total ?? 0) - Number(o.deposit ?? 0)),
      0
    );
  const month = now.getMonth();
  const year = now.getFullYear();
  const leadsMonth = orders.filter((o) => {
    const d = new Date(o.created_at);
    return o.status === "lead" && d.getMonth() === month && d.getFullYear() === year;
  }).length;

  const recent = orders.slice(0, 6);

  const stats = [
    {
      label: "Total Orders",
      value: total,
      icon: ShoppingCart,
      hint: `${active} active`,
    },
    {
      label: "Active Projects",
      value: active,
      icon: Activity,
      hint: "in progress",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle2,
      hint: total ? `${Math.round((completed / total) * 100)}% rate` : "—",
    },
    {
      label: "Pending Payments",
      value: formatVND(pendingPay),
      icon: Clock,
      hint: "outstanding",
    },
    {
      label: "Total Revenue",
      value: formatVND(revenue),
      icon: DollarSign,
      hint: "all-time",
    },
    {
      label: "Overdue",
      value: overdue,
      icon: AlertTriangle,
      hint: overdue ? "needs attention" : "all clear",
    },
    {
      label: "New Leads (mo)",
      value: leadsMonth,
      icon: Sparkles,
      hint: "this month",
    },
    {
      label: "Team Members",
      value: teamQ.data ?? 0,
      icon: Users,
      hint: "active",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Operational overview of AlienSpark VN
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {s.label}
              </span>
              <div className="h-7 w-7 rounded-md bg-primary/10 grid place-items-center">
                <s.icon className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-semibold tracking-tight">
              {s.value}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">{s.hint}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="glass rounded-xl lg:col-span-2 overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-sm">Recent Orders</h2>
            <span className="text-xs text-muted-foreground">Last {recent.length}</span>
          </div>
          <div className="p-5">
            {ordersQ.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : recent.length === 0 ? (
              <div className="text-sm text-muted-foreground py-10 text-center">
                No orders yet. Create your first one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground">
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-medium">Client</th>
                      <th className="text-left py-2 font-medium">Package</th>
                      <th className="text-left py-2 font-medium">Total</th>
                      <th className="text-left py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((o) => (
                      <tr
                        key={o.id}
                        className="border-b border-border/60 last:border-0"
                      >
                        <td className="py-3 font-medium">{o.client_name}</td>
                        <td className="py-3 text-muted-foreground">
                          {o.package ?? "—"}
                        </td>
                        <td className="py-3">{formatVND(o.total)}</td>
                        <td className="py-3">
                          <Link to="/orders/$id" params={{ id: o.id }}>
                            <StatusBadge status={o.status} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="glass rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-sm">Recent Activity</h2>
          </div>
          <div className="p-5">
            {(logsQ.data ?? []).length === 0 ? (
              <div className="text-sm text-muted-foreground">No activity yet.</div>
            ) : (
              <ul className="space-y-3 text-sm">
                {logsQ.data!.map((l) => (
                  <li key={l.id} className="flex gap-3">
                    <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <div>{l.message}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(l.created_at).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
