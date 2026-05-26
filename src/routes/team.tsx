import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { teamService } from "@/lib/services";
import { logActivity } from "@/lib/logger";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, KeyRound, Info } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { isOnline } from "@/hooks";

export const Route = createFileRoute("/team")({
  component: () => (
    <AppLayout>
      <Team />
    </AppLayout>
  ),
});

function Team() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["team"],
    queryFn: teamService.getAll,
  });

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await teamService.delete(id, name);
      qc.invalidateQueries({ queryKey: ["team"] });
      toast.success("Member deleted");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const sendReset = async (email: string) => {
    if (!email) return toast.error("No email on profile");
    const { supabase } = await import("@/integrations/supabase/client");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    if (error) return toast.error(error.message);
    toast.success("Password setup email sent");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage AlienSpark team profiles.</p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add Member
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-accent/40 p-4 flex gap-3 items-start text-sm">
        <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="text-muted-foreground">
          To allow this person to log in, create an Auth user in{" "}
          <span className="text-foreground">Lovable Cloud → Users</span> with the same email,
          or use the future admin invite system. Team profiles here are profile data only —
          passwords are managed by Auth.
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && <div className="text-muted-foreground">Loading…</div>}
        {!isLoading && (data ?? []).length === 0 && (
          <div className="glass rounded-xl p-10 text-center col-span-full">
            <div className="mx-auto h-10 w-10 rounded-full bg-primary/10 grid place-items-center mb-3">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div className="text-sm font-medium">No team members yet</div>
            <div className="text-xs text-muted-foreground mt-1">
              Add your first teammate to get started.
            </div>
          </div>
        )}
        {(data ?? []).map((m) => (
          <div
            key={m.id}
            className="glass rounded-xl p-5 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                {m.avatar_data_url ? (
                  <img
                    src={m.avatar_data_url}
                    className="h-11 w-11 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-full bg-primary/10 grid place-items-center font-semibold text-primary border border-primary/20">
                    {m.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-background ${
                    isOnline(m.last_seen_at) ? "bg-emerald-500" : "bg-muted-foreground/40"
                  }`}
                />
              </div>
              <div className="min-w-0">
                <Link
                  to="/team/$id"
                  params={{ id: m.id }}
                  className="font-medium truncate hover:underline"
                >
                  {m.name}
                </Link>
                <div className="text-xs text-muted-foreground truncate">{m.role ?? "—"}</div>
              </div>
              <span className="ml-auto text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {m.status ?? "active"}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground space-y-1">
              <div className="truncate">{m.email ?? "—"}</div>
              <div>{m.phone ?? ""}</div>
            </div>
            <div className="mt-4 flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => { setEditing(m); setOpen(true); }}>
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => sendReset(m.email ?? "")}>
                <KeyRound className="h-3.5 w-3.5 mr-1" />
                Send setup
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => del(m.id, m.name)}
                className="text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <MemberDialog
        open={open}
        onOpenChange={setOpen}
        member={editing}
        onSaved={() => qc.invalidateQueries({ queryKey: ["team"] })}
      />
    </div>
  );
}

function MemberDialog({
  open,
  onOpenChange,
  member,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: any;
  onSaved: () => void;
}) {
  const emptyForm = {
    name: "",
    role: "Developer",
    email: "",
    phone: "",
    status: "active",
    avatar_data_url: "",
  };
  const [f, setF] = useState<any>(member ?? emptyForm);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) setF(member ?? emptyForm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, member?.id]);

  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));

  const handleAvatar = async (file: File) => {
    setUploading(true);
    try {
      const { storageService } = await import("@/lib/services");
      const url = await storageService.uploadAvatar(file);
      set("avatar_data_url", url);
      toast.success("Avatar uploaded");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!f.name?.trim()) return toast.error("Name required");
    try {
      if (member?.id) {
        await teamService.updateWithLog(
          member.id,
          {
            name: f.name,
            role: f.role,
            email: f.email,
            phone: f.phone,
            status: f.status,
            avatar_data_url: f.avatar_data_url,
          },
          f.name
        );
        toast.success("Member updated");
      } else {
        await teamService.create({
          name: f.name,
          role: f.role,
          email: f.email,
          phone: f.phone,
          status: f.status || "active",
          avatar_data_url: f.avatar_data_url,
        });
        toast.success("Member added");
      }
      onSaved();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{member ? "Edit member" : "Add member"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Name *</Label>
            <Input value={f.name ?? ""} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Role</Label>
              <Select value={f.role ?? "Developer"} onValueChange={(v) => set("role", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Admin", "Manager", "Developer", "Designer", "Sales", "Support"].map(
                    (r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={f.status ?? "active"} onValueChange={(v) => set("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["active", "inactive"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={f.email ?? ""}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={f.phone ?? ""}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Avatar</Label>
            <Input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => e.target.files?.[0] && handleAvatar(e.target.files[0])}
            />
            {uploading && <div className="text-xs text-muted-foreground mt-1">Uploading…</div>}
            {f.avatar_data_url && (
              <img src={f.avatar_data_url} className="mt-2 h-16 w-16 rounded-full object-cover" />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={uploading}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
