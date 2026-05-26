import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { orderService, commentService, attachmentService, statusHistoryService, activityService } from "@/lib/services";
import { storageService } from "@/lib/services";
import { STATUS_LABELS, formatVND } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Upload, Trash2, FileText, Calendar, User, Phone, Mail, MessageCircle, Globe, MapPin } from "lucide-react";

export const Route = createFileRoute("/orders/$id")({
  component: () => (
    <AppLayout>
      <OrderDetail />
    </AppLayout>
  ),
});

function OrderDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const nav = useNavigate();

  const orderQ = useQuery({
    queryKey: ["order", id],
    queryFn: () => orderService.getById(id),
    enabled: !!id,
  });

  const historyQ = useQuery({
    queryKey: ["order-history", id],
    queryFn: () => statusHistoryService.getByOrderId(id),
    enabled: !!id,
  });

  const commentsQ = useQuery({
    queryKey: ["order-comments", id],
    queryFn: () => commentService.getByOrderId(id),
    enabled: !!id,
  });

  const filesQ = useQuery({
    queryKey: ["order-files", id],
    queryFn: () => attachmentService.getByOrderId(id),
    enabled: !!id,
  });

  const logsQ = useQuery({
    queryKey: ["order-logs", id],
    queryFn: () => activityService.getByEntity("order", id),
    enabled: !!id,
  });

  const o = orderQ.data;

  const updateField = async (patch: any) => {
    try {
      await orderService.update(id, patch);
      qc.invalidateQueries({ queryKey: ["order", id] });
      qc.invalidateQueries({ queryKey: ["order-history", id] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    try {
      await orderService.delete(id, o?.client_name ?? "");
      toast.success("Order deleted");
      nav({ to: "/orders" });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (orderQ.isLoading) return <div className="text-muted-foreground">Loading…</div>;
  if (!o) return <div className="text-muted-foreground">Order not found.</div>;

  const remaining = Number(o.total ?? 0) - Number(o.deposit ?? 0);
  const timeline = [
    ...(historyQ.data ?? []).map((h: any) => ({
      kind: "status",
      ts: h.created_at,
      label: h.from_status
        ? `Status: ${STATUS_LABELS[h.from_status] ?? h.from_status} → ${STATUS_LABELS[h.to_status] ?? h.to_status}`
        : `Created as ${STATUS_LABELS[h.to_status] ?? h.to_status}`,
      note: h.note,
    })),
    ...(logsQ.data ?? []).map((l: any) => ({
      kind: "log",
      ts: l.created_at,
      label: l.message,
      note: null,
    })),
  ].sort((a, b) => +new Date(b.ts) - +new Date(a.ts));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link to="/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          {o.client_avatar_url ? (
            <img
              src={o.client_avatar_url}
              alt=""
              className="h-12 w-12 rounded-lg object-cover border border-border"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center text-primary font-semibold">
              {o.client_name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
              {o.client_name}
            </h1>
            <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
              {o.company_name && <span>{o.company_name}</span>}
              <StatusBadge status={o.status} />
              <PriorityBadge priority={o.priority} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={o.status}
            onValueChange={async (v) => {
              await updateField({ status: v });
              toast.success("Status updated");
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(STATUS_LABELS).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" onClick={remove}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-5 mt-5">
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="glass rounded-xl p-5 space-y-3 lg:col-span-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Client</div>
              <div className="grid sm:grid-cols-2 gap-y-2 text-sm">
                <Info icon={User} label="Name" value={o.client_name} />
                <Info icon={Globe} label="Country" value={o.country} />
                <Info icon={Mail} label="Email" value={o.email} />
                <Info icon={Phone} label="Phone" value={o.phone} />
                <Info icon={MessageCircle} label="Zalo" value={o.zalo} />
                <Info icon={MessageCircle} label="WhatsApp" value={o.whatsapp} />
                <Info icon={MapPin} label="Address" value={o.address} />
                <Info icon={User} label="Assigned" value={o.assigned_to} />
              </div>
            </div>

            <div className="glass rounded-xl p-5 space-y-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Payment</div>
              <Row label="Total" value={formatVND(o.total)} />
              <Row label="Paid" value={formatVND(o.deposit)} />
              <Row
                label="Remaining"
                value={
                  <span className={remaining > 0 ? "text-amber-500" : ""}>
                    {formatVND(remaining)}
                  </span>
                }
              />
              <Row label="Method" value={o.payment_method ?? "—"} />
              <Row label="Status" value={o.payment_status} />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            <div className="glass rounded-xl p-5 space-y-3 lg:col-span-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Progress</div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={o.progress ?? 0}
                  onChange={(e) => updateField({ progress: Number(e.target.value) })}
                  className="flex-1"
                />
                <div className="w-12 text-right text-sm font-medium">{o.progress ?? 0}%</div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${o.progress ?? 0}%` }}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-y-2 pt-2 text-sm">
                <Info
                  icon={Calendar}
                  label="Deadline"
                  value={o.deadline ? new Date(o.deadline).toLocaleDateString() : "—"}
                />
                <Info
                  icon={Calendar}
                  label="Est. delivery"
                  value={
                    o.estimated_delivery
                      ? new Date(o.estimated_delivery).toLocaleDateString()
                      : "—"
                  }
                />
                <Info icon={FileText} label="Package" value={o.package} />
                <Info
                  icon={FileText}
                  label="Service"
                  value={o.service_category ?? o.service}
                />
              </div>
            </div>

            <div className="glass rounded-xl p-5 space-y-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Notes</div>
              <Label className="text-xs">Internal notes</Label>
              <Textarea
                rows={3}
                defaultValue={o.internal_notes ?? ""}
                onBlur={(e) =>
                  e.target.value !== (o.internal_notes ?? "") &&
                  updateField({ internal_notes: e.target.value })
                }
              />
              <Label className="text-xs">Client-facing notes</Label>
              <Textarea
                rows={3}
                defaultValue={o.client_notes ?? o.notes ?? ""}
                onBlur={(e) =>
                  e.target.value !== (o.client_notes ?? o.notes ?? "") &&
                  updateField({ client_notes: e.target.value })
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-5">
          <div className="glass rounded-xl p-5">
            {timeline.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">No activity yet.</div>
            ) : (
              <ol className="space-y-4">
                {timeline.map((t, i) => (
                  <li key={i} className="relative pl-6 border-l border-border last:border-l-transparent">
                    <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                    <div className="text-sm">{t.label}</div>
                    {t.note && <div className="text-xs text-muted-foreground">{t.note}</div>}
                    <div className="text-[11px] text-muted-foreground">
                      {new Date(t.ts).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </TabsContent>

        <TabsContent value="comments" className="mt-5">
          <CommentsPanel
            orderId={id}
            comments={commentsQ.data ?? []}
            onChanged={() => qc.invalidateQueries({ queryKey: ["order-comments", id] })}
          />
        </TabsContent>

        <TabsContent value="files" className="mt-5">
          <FilesPanel
            orderId={id}
            files={filesQ.data ?? []}
            onChanged={() => qc.invalidateQueries({ queryKey: ["order-files", id] })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Info({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground mt-1 shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm truncate">{value || "—"}</div>
      </div>
    </div>
  );
}

function Row({ label, value }: any) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function CommentsPanel({
  orderId,
  comments,
  onChanged,
}: {
  orderId: string;
  comments: any[];
  onChanged: () => void;
}) {
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(true);

  const send = async () => {
    if (!body.trim()) return;
    try {
      await commentService.create({
        order_id: orderId,
        body,
        is_internal: internal,
      });
      setBody("");
      onChanged();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4 space-y-3">
        <Textarea
          placeholder="Write a comment…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
        />
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground flex items-center gap-2">
            <input
              type="checkbox"
              checked={internal}
              onChange={(e) => setInternal(e.target.checked)}
            />
            Internal only (not for client)
          </label>
          <Button onClick={send} size="sm">
            Post comment
          </Button>
        </div>
      </div>
      {comments.length === 0 ? (
        <div className="text-sm text-muted-foreground py-8 text-center">No comments yet.</div>
      ) : (
        <div className="space-y-3">
          {comments.map((c: any) => (
            <div
              key={c.id}
              className={`rounded-xl p-4 border ${
                c.is_internal
                  ? "bg-amber-500/5 border-amber-500/20"
                  : "bg-card border-border"
              }`}
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>
                  {c.author_name ?? "Team"}{" "}
                  {c.is_internal && <span className="text-amber-500">· internal</span>}
                </span>
                <span>{new Date(c.created_at).toLocaleString()}</span>
              </div>
              <div className="text-sm whitespace-pre-wrap">{c.body}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilesPanel({
  orderId,
  files,
  onChanged,
}: {
  orderId: string;
  files: any[];
  onChanged: () => void;
}) {
  const [uploading, setUploading] = useState(false);

  const onUpload = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await storageService.uploadOrderFile(file);
      await attachmentService.create({
        order_id: orderId,
        name: file.name,
        url,
        size: file.size,
        mime: file.type,
      });
      toast.success("File uploaded");
      onChanged();
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const del = async (f: any) => {
    if (!confirm(`Delete ${f.name}?`)) return;
    await attachmentService.delete(f.id);
    onChanged();
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4">
        <label className="flex items-center justify-center gap-2 h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/40 transition-colors text-sm text-muted-foreground">
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : "Click to upload a file"}
          <input
            type="file"
            className="hidden"
            disabled={uploading}
            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
          />
        </label>
      </div>
      {files.length === 0 ? (
        <div className="text-sm text-muted-foreground py-8 text-center">No files attached yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {files.map((f: any) => (
            <div key={f.id} className="glass rounded-xl p-4 flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <a
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium truncate hover:underline block"
                >
                  {f.name}
                </a>
                <div className="text-xs text-muted-foreground">
                  {f.size ? `${Math.round(f.size / 1024)} KB` : ""} ·{" "}
                  {new Date(f.created_at).toLocaleDateString()}
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => del(f)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
