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
  "contacted",
  "waiting_payment",
  "in_progress",
  "review",
  "delivered",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_COLORS: Record<string, string> = {
  lead: "bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30",
  contacted: "bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/30",
  waiting_payment: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  in_progress: "bg-primary/10 text-primary border-primary/30",
  review: "bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30",
  delivered: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/30",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  cancelled: "bg-muted text-muted-foreground border-border",
  // legacy fallbacks
  pending_deposit: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  active: "bg-primary/10 text-primary border-primary/30",
  waiting_client: "bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30",
  overdue: "bg-red-500/10 text-red-600 dark:text-red-300 border-red-500/30",
};

export const STATUS_LABELS: Record<string, string> = {
  lead: "Lead",
  contacted: "Contacted",
  waiting_payment: "Waiting Payment",
  in_progress: "In Progress",
  review: "Review",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-muted text-muted-foreground border-border",
  normal: "bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/30",
  high: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  urgent: "bg-red-500/10 text-red-600 dark:text-red-300 border-red-500/30",
};

export const SERVICE_CATEGORIES = [
  "Web Development",
  "Mobile App",
  "Chatbot / Automation",
  "Branding / Design",
  "Marketing",
  "Consulting",
  "Other",
];

export const COUNTRIES = [
  "Vietnam", "United States", "United Kingdom", "Australia", "Singapore",
  "Japan", "Korea", "Thailand", "Malaysia", "Indonesia", "Philippines",
  "France", "Germany", "Canada", "Other",
];

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

export async function uploadOrderFile(file: File): Promise<{ url: string; path: string }> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("order-files").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  const { data } = await supabase.storage.from("order-files").createSignedUrl(path, 60 * 60 * 24 * 365);
  return { url: data?.signedUrl ?? path, path };
}

export async function notify(type: string, title: string, body?: string, entity_type?: string, entity_id?: string) {
  try {
    await (supabase as any).from("notifications").insert({ type, title, body, entity_type, entity_id });
  } catch (e) {
    console.warn("notify failed", e);
  }
}