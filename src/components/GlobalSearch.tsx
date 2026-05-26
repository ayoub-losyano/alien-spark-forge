import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { FolderKanban, Users, FileText } from "lucide-react";

export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    if (!open) { setQ(""); return; }
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!q.trim()) {
        setOrders([]); setTeam([]); setInvoices([]); return;
      }
      const like = `%${q}%`;
      const [oRes, tRes, iRes] = await Promise.all([
        supabase.from("orders").select("id,client_name,company_name,status").or(
          `client_name.ilike.${like},company_name.ilike.${like},email.ilike.${like},phone.ilike.${like}`,
        ).limit(6),
        supabase.from("team_members").select("id,name,role,email").or(
          `name.ilike.${like},email.ilike.${like}`,
        ).limit(6),
        (supabase as any).from("invoices").select("id,number,client_name,amount,status").or(
          `number.ilike.${like},client_name.ilike.${like}`,
        ).limit(6),
      ]);
      if (cancelled) return;
      setOrders(oRes.data ?? []);
      setTeam(tRes.data ?? []);
      setInvoices(iRes.data ?? []);
    };
    const id = setTimeout(run, 180);
    return () => { cancelled = true; clearTimeout(id); };
  }, [q]);

  const go = (path: any) => { onOpenChange(false); nav(path); };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search orders, team, invoices…" value={q} onValueChange={setQ} />
      <CommandList>
        {!q && <CommandEmpty>Type to search across the workspace.</CommandEmpty>}
        {q && orders.length === 0 && team.length === 0 && invoices.length === 0 && (
          <CommandEmpty>No matches.</CommandEmpty>
        )}
        {orders.length > 0 && (
          <CommandGroup heading="Orders">
            {orders.map((o) => (
              <CommandItem key={o.id} onSelect={() => go({ to: "/orders/$id", params: { id: o.id } })}>
                <FolderKanban className="h-4 w-4" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{o.client_name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{o.company_name ?? o.status}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {team.length > 0 && (
          <CommandGroup heading="Team">
            {team.map((m) => (
              <CommandItem key={m.id} onSelect={() => go({ to: "/team/$id", params: { id: m.id } })}>
                <Users className="h-4 w-4" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{m.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{m.role ?? m.email}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {invoices.length > 0 && (
          <CommandGroup heading="Invoices">
            {invoices.map((i) => (
              <CommandItem key={i.id} onSelect={() => go({ to: "/finance" })}>
                <FileText className="h-4 w-4" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">#{i.number} — {i.client_name ?? "—"}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{i.status}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}