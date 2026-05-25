import { supabase } from "@/integrations/supabase/client";

export async function logActivity(type: string, message: string, entity_type?: string, entity_id?: string) {
  try {
    await supabase.from("activity_logs").insert({ type, message, entity_type, entity_id });
  } catch (e) {
    // best-effort
    console.warn("activity log failed", e);
  }
}

export function formatVND(n: number | string | null | undefined) {
  const v = Number(n ?? 0);
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);
}

export const ORDER_STATUSES = [
  "lead",
  "pending_deposit",
  "active",
  "waiting_client",
  "completed",
  "overdue",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_COLORS: Record<string, string> = {
  lead: "bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30",
  pending_deposit: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  active: "bg-primary/10 text-primary border-primary/30",
  waiting_client: "bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  overdue: "bg-red-500/10 text-red-600 dark:text-red-300 border-red-500/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export const PACKAGES = [
  "Website Basic",
  "Website Pro",
  "Zalo Mini App",
  "Booking System",
  "Chatbot",
  "Automation",
  "Custom",
];

export const TEAM_ROLES = [
  "Admin",
  "Manager",
  "Developer",
  "Designer",
  "Sales",
  "Support",
] as const;

export const EXPENSE_CATEGORIES = [
  "Software",
  "Marketing",
  "Payroll",
  "Office",
  "Hosting",
  "Travel",
  "Other",
];

export async function uploadAvatar(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}