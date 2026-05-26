import { cn } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS } from "@/lib/logger";

export function StatusBadge({ status, className }: { status?: string | null; className?: string }) {
  const s = status ?? "lead";
  return (
    <span
      className={cn(
        "inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap",
        STATUS_COLORS[s] ?? "border-border text-muted-foreground",
        className,
      )}
    >
      {STATUS_LABELS[s] ?? s}
    </span>
  );
}

export function PriorityBadge({ priority, className }: { priority?: string | null; className?: string }) {
  const p = priority ?? "normal";
  return (
    <span
      className={cn(
        "inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize",
        PRIORITY_COLORS[p] ?? "border-border text-muted-foreground",
        className,
      )}
    >
      {p}
    </span>
  );
}