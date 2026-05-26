import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { orderService, expenseService } from "@/lib/services";
import { formatVND } from "@/lib/logger";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/finance")({
  component: () => (
    <AppLayout>
      <Finance />
    </AppLayout>
  ),
});

const PAY_STATUSES = ["pending", "partial", "completed", "refunded"];

function Finance() {
  const qc = useQueryClient();

  const ordersQ = useQuery({
    queryKey: ["finance-orders"],
    queryFn: orderService.getAll,
  });

  const expensesQ = useQuery({
    queryKey: ["expenses"],
    queryFn: expenseService.getAll,
  });

  const orders = ordersQ.data ?? [];
  const expenses = expensesQ.data ?? [];
  const total = orders.reduce((s, o) => s + Number(o.total ?? 0), 0);
  const deposits = orders.reduce((s, o) => s + Number(o.deposit ?? 0), 0);
  const completed = orders
    .filter((o) => o.payment_status === "completed")
    .reduce((s, o) => s + Number(o.total ?? 0), 0);
  const pending = total - deposits;
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount ?? 0), 0);
  const netProfit = completed - totalExpenses;

  const now = new Date();
  const monthly = orders
    .filter((o) => {
      const d = new Date(o.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, o) => s + Number(o.total ?? 0), 0);

  // Monthly breakdown (last 6 months)
  const monthlySeries = (() => {
    const out: { label: string; revenue: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const r = orders
        .filter((o) => {
          const od = new Date(o.created_at);
          return od >= d && od < next;
        })
        .reduce((s, o) => s + Number(o.total ?? 0), 0);
      const e = expenses
        .filter((ex) => {
          const ed = new Date(ex.paid_on);
          return ed >= d && ed < next;
        })
        .reduce((s, ex) => s + Number(ex.amount ?? 0), 0);
      out.push({
        label: d.toLocaleDateString("en-US", { month: "short" }),
        revenue: r,
        expense: e,
      });
    }
    return out;
  })();
  const maxMonthly = Math.max(
    1,
    ...monthlySeries.map((m) => Math.max(m.revenue, m.expense))
  );

  const updatePay = async (id: string, status: string) => {
    try {
      await orderService.updatePaymentStatus(id, status, "");
      qc.invalidateQueries({ queryKey: ["finance-orders"] });
      toast.success("Payment status updated");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const stats = [
    { label: "Total revenue", value: formatVND(total) },
    { label: "Collected", value: formatVND(deposits) },
    { label: "Pending payments", value: formatVND(pending) },
    { label: "Expenses", value: formatVND(totalExpenses) },
    { label: "Net profit", value: formatVND(netProfit) },
    { label: "This month", value: formatVND(monthly) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Finance</h1>
        <p className="text-sm text-muted-foreground mt-1">Revenue and payment tracking.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-xl p-5">
            <div className="text-xs font-medium text-muted-foreground">{s.label}</div>
            <div className="mt-2 text-lg md:text-xl font-semibold tracking-tight">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm">Monthly analytics</h2>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-primary" /> Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-destructive/70" /> Expenses
            </span>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-3 h-40">
          {monthlySeries.map((m) => (
            <div key={m.label} className="flex flex-col items-center justify-end gap-1">
              <div className="flex items-end gap-1 h-full w-full justify-center">
                <div
                  className="w-3 bg-primary/70 rounded-t"
                  style={{ height: `${(m.revenue / maxMonthly) * 100}%` }}
                />
                <div
                  className="w-3 bg-destructive/60 rounded-t"
                  style={{ height: `${(m.expense / maxMonthly) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="payments">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="payments">Payment history</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Client</th>
                    <th className="text-left px-4 py-3 font-medium">Package</th>
                    <th className="text-left px-4 py-3 font-medium">Total</th>
                    <th className="text-left px-4 py-3 font-medium">Deposit</th>
                    <th className="text-left px-4 py-3 font-medium">Remaining</th>
                    <th className="text-left px-4 py-3 font-medium">Method</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersQ.isLoading && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        Loading…
                      </td>
                    </tr>
                  )}
                  {!ordersQ.isLoading && orders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        No orders yet.
                      </td>
                    </tr>
                  )}
                  {orders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-t border-border hover:bg-muted/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{o.client_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{o.package ?? "—"}</td>
                      <td className="px-4 py-3">{formatVND(o.total)}</td>
                      <td className="px-4 py-3">{formatVND(o.deposit)}</td>
                      <td className="px-4 py-3">
                        {formatVND(Number(o.total) - Number(o.deposit))}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {o.payment_method ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={o.payment_status ?? "pending"}
                          onValueChange={(v) => updatePay(o.id, v)}
                        >
                          <SelectTrigger className="h-8 w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PAY_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="expenses">
          <ExpensesPanel
            expenses={expenses}
            loading={expensesQ.isLoading}
            onChanged={() => qc.invalidateQueries({ queryKey: ["expenses"] })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ExpensesPanel({
  expenses,
  loading,
  onChanged,
}: {
  expenses: any[];
  loading: boolean;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const empty = {
    description: "",
    category: "Software",
    amount: 0,
    paid_on: new Date().toISOString().slice(0, 10),
    notes: "",
  };
  const [f, setF] = useState<any>(empty);

  const reset = () => setF(empty);

  const save = async () => {
    if (!f.description.trim()) return toast.error("Description required");
    try {
      await expenseService.create({
        description: f.description,
        category: f.category,
        amount: Number(f.amount),
        paid_on: f.paid_on,
        notes: f.notes,
      });
      toast.success("Expense added");
      onChanged();
      setOpen(false);
      reset();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    try {
      await expenseService.delete(id);
      onChanged();
      toast.success("Expense deleted");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add expense
        </Button>
      </div>
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Description</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && expenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    No expenses yet.
                  </td>
                </tr>
              )}
              {expenses.map((e) => (
                <tr
                  key={e.id}
                  className="border-t border-border hover:bg-muted/40 transition-colors"
                >
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(e.paid_on).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-medium">{e.description}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.category ?? "—"}</td>
                  <td className="px-4 py-3">{formatVND(e.amount)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="icon" variant="ghost" onClick={() => del(e.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Description *</Label>
              <Input
                value={f.description}
                onChange={(e) => setF({ ...f, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select
                  value={f.category}
                  onValueChange={(v) => setF({ ...f, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Software",
                      "Marketing",
                      "Payroll",
                      "Office",
                      "Hosting",
                      "Travel",
                      "Other",
                    ].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount (VND)</Label>
                <Input
                  type="number"
                  value={f.amount}
                  onChange={(e) => setF({ ...f, amount: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Paid on</Label>
              <Input
                type="date"
                value={f.paid_on}
                onChange={(e) => setF({ ...f, paid_on: e.target.value })}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                rows={2}
                value={f.notes}
                onChange={(e) => setF({ ...f, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
