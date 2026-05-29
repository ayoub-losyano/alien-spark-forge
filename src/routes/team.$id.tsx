import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { teamService } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { isOnline } from "@/hooks";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/team/$id")({
  component: () => (
    <AppLayout>
      <Profile />
    </AppLayout>
  ),
});

const PERMISSION_KEYS = [
  { key: "manage_orders", label: "Manage orders" },
  { key: "manage_finance", label: "Manage finance" },
  { key: "manage_team", label: "Manage team" },
  { key: "manage_settings", label: "Manage settings" },
];

function Profile() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const memberQ = useQuery({
    queryKey: ["member", id],
    queryFn: () => teamService.getById(id),
    enabled: !!id,
  });

  const ordersQ = useQuery({
    queryKey: ["member-orders", id],
    queryFn: async () => {
      const m = memberQ.data;
      if (!m) return [];
      return teamService.getMemberOrders(id, m.name);
    },
    enabled: !!memberQ.data,
  });

  const m = memberQ.data;
  const [bio, setBio] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (m) {
      setBio(m.bio ?? "");
      setNotes(((m as any).notes ?? "") as string);
    }
  }, [m?.id]); // eslint-disable-line

  const updateMember = async (patch: any) => {
    try {
      await teamService.update(id, patch);
      qc.invalidateQueries({ queryKey: ["member", id] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (memberQ.isLoading) return <div className="text-muted-foreground">Loading…</div>;
  if (!m) return <div className="text-muted-foreground">Member not found.</div>;

  const orders = ordersQ.data ?? [];
  const completed = orders.filter(
    (o: any) => o.status === "completed" || o.status === "delivered"
  ).length;
  const active = orders.filter((o: any) =>
    !["completed", "cancelled", "delivered"].includes(o.status)
  ).length;
  const online = isOnline(m.last_seen_at);
  const perms = ((m.permissions as Record<string, boolean> | null) ?? {}) as Record<string, boolean>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/team">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">{m.name}</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="glass rounded-xl p-6 space-y-4 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              {m.avatar_data_url ? (
                <img
                  src={m.avatar_data_url}
                  className="h-24 w-24 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary/10 grid place-items-center text-3xl font-semibold text-primary border border-primary/20">
                  {m.name?.[0]?.toUpperCase()}
                </div>
              )}
              <span
                className={`absolute bottom-1 right-1 h-4 w-4 rounded-full ring-2 ring-background ${
                  online ? "bg-emerald-500" : "bg-muted-foreground/40"
                }`}
              />
            </div>
            <div className="mt-3 font-semibold">{m.name}</div>
            <div className="text-xs text-muted-foreground">{m.role ?? "—"}</div>
            <div className="text-[11px] mt-1 text-muted-foreground">
              {online
                ? "Online now"
                : m.last_seen_at
                ? `Last seen ${new Date(m.last_seen_at).toLocaleString()}`
                : "Never seen"}
            </div>
          </div>
          <div className="space-y-2 pt-3 border-t border-border text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5" /> {m.email ?? "—"}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5" /> {m.phone ?? "—"}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
            <Stat label="Active" value={active} />
            <Stat label="Completed" value={completed} />
          </div>
        </div>

        <div className="glass rounded-xl p-6 space-y-4 lg:col-span-2">
          <div>
            <Label className="text-xs">Bio</Label>
            <Textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              onBlur={() => bio !== (m.bio ?? "") && updateMember({ bio })}
            />
          </div>
          <div>
            <Label className="text-xs">Internal notes</Label>
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => notes !== ((m as any).notes ?? "") && updateMember({ bio: notes })}
            />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Permissions
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {PERMISSION_KEYS.map((p) => (
                <label
                  key={p.key}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                >
                  {p.label}
                  <Switch
                    checked={!!perms[p.key]}
                    onCheckedChange={(v) =>
                      updateMember({ permissions: { ...perms, [p.key]: v } })
                    }
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-sm font-semibold">
          Assigned orders
        </div>
        {orders.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No assigned orders.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Client</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-left px-4 py-2 font-medium">Priority</th>
                <th className="text-left px-4 py-2 font-medium">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o: any) => (
                <tr key={o.id} className="border-t border-border hover:bg-muted/40">
                  <td className="px-4 py-2">
                    <Link
                      to="/orders/$id"
                      params={{ id: o.id }}
                      className="font-medium hover:underline"
                    >
                      {o.client_name}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-2">
                    <PriorityBadge priority={o.priority} />
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {o.deadline ? new Date(o.deadline).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: any) {
  return (
    <div className="rounded-lg bg-muted/40 p-3 text-center">
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
