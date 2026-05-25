import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, KeyRound, Info } from "lucide-react";
import { logActivity } from "@/lib/logger";

export const Route = createFileRoute("/team")({ component: () => <AppLayout><Team /></AppLayout> });

function Team() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["team"],
    queryFn: async () => (await supabase.from("team_members").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Member deleted");
    qc.invalidateQueries({ queryKey: ["team"] });
  };

  const sendReset = async (email: string) => {
    if (!email) return toast.error("No email on profile");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    if (error) return toast.error(error.message);
    toast.success("Password setup email sent");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Team</h1>
          <p className="text-sm text-muted-foreground">Manage AlienSpark team profiles.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Add Member
        </Button>
      </div>

      <div className="glass rounded-2xl p-4 flex gap-3 items-start text-sm">
        <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="text-muted-foreground">
          To allow this person to log in, create an Auth user in <span className="text-foreground">Lovable Cloud → Users</span> with the same email, or use the future admin invite system. Team profiles here are profile data only — passwords are managed by Auth.
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && <div className="text-muted-foreground">Loading…</div>}
        {!isLoading && (data ?? []).length === 0 && (
          <div className="text-muted-foreground glass rounded-2xl p-8 text-center col-span-full">No team members yet.</div>
        )}
        {(data ?? []).map((m) => (
          <div key={m.id} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3">
              {m.avatar_data_url ? (
                <img src={m.avatar_data_url} className="h-12 w-12 rounded-full object-cover border border-primary/30" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary/20 grid place-items-center font-bold text-primary border border-primary/30">
                  {m.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-semibold truncate">{m.name}</div>
                <div className="text-xs text-muted-foreground truncate">{m.role ?? "—"}</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground space-y-1">
              <div className="truncate">{m.email ?? "—"}</div>
              <div>{m.phone ?? ""}</div>
              <div><span className="text-primary">{m.status}</span></div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => { setEditing(m); setOpen(true); }}><Pencil className="h-3.5 w-3.5 mr-1" />Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => sendReset(m.email)}><KeyRound className="h-3.5 w-3.5 mr-1" />Send setup</Button>
              <Button size="sm" variant="ghost" onClick={() => del(m.id, m.name)} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
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

function MemberDialog({ open, onOpenChange, member, onSaved }: any) {
  const [f, setF] = useState<any>(member ?? { name: "", role: "", email: "", phone: "", status: "active", avatar_data_url: "" });
  // Re-init when member changes
  if (open && member && f.id !== member.id) setF(member);
  if (open && !member && f.id) setF({ name: "", role: "", email: "", phone: "", status: "active", avatar_data_url: "" });

  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));

  const handleAvatar = (file: File) => {
    const r = new FileReader();
    r.onload = () => set("avatar_data_url", r.result as string);
    r.readAsDataURL(file);
  };

  const save = async () => {
    if (!f.name?.trim()) return toast.error("Name required");
    if (member?.id) {
      const { error } = await supabase.from("team_members").update({
        name: f.name, role: f.role, email: f.email, phone: f.phone, status: f.status, avatar_data_url: f.avatar_data_url,
      }).eq("id", member.id);
      if (error) return toast.error(error.message);
      toast.success("Member updated");
    } else {
      const { error, data } = await supabase.from("team_members").insert({
        name: f.name, role: f.role, email: f.email, phone: f.phone, status: f.status || "active", avatar_data_url: f.avatar_data_url,
      }).select().single();
      if (error) return toast.error(error.message);
      toast.success("Member added");
      logActivity("member_added", `Team member ${f.name} added`, "team_member", data?.id);
    }
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass">
        <DialogHeader><DialogTitle>{member ? "Edit member" : "Add member"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Name *</Label><Input value={f.name ?? ""} onChange={(e) => set("name", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Role</Label><Input value={f.role ?? ""} onChange={(e) => set("role", e.target.value)} /></div>
            <div><Label>Status</Label><Input value={f.status ?? "active"} onChange={(e) => set("status", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Email</Label><Input type="email" value={f.email ?? ""} onChange={(e) => set("email", e.target.value)} /></div>
            <div><Label>Phone</Label><Input value={f.phone ?? ""} onChange={(e) => set("phone", e.target.value)} /></div>
          </div>
          <div>
            <Label>Avatar</Label>
            <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleAvatar(e.target.files[0])} />
            {f.avatar_data_url && <img src={f.avatar_data_url} className="mt-2 h-16 w-16 rounded-full object-cover" />}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={save}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}