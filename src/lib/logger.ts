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
  lead: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  pending_deposit: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  active: "bg-primary/15 text-primary border-primary/30",
  waiting_client: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  completed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  overdue: "bg-red-500/15 text-red-300 border-red-500/30",
  cancelled: "bg-gray-500/15 text-gray-300 border-gray-500/30",
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