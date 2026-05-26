
# AlienSpark OPS – Production Workflow Build

This is a large scope. I'll deliver it in one coordinated migration + code pass, grouped into 4 stages so nothing is half-built.

## Stage 1 — Database schema (single migration)

Extend Supabase with the tables/columns needed for real workflow:

- `orders` — add: `whatsapp`, `country`, `priority` (low/normal/high/urgent), `service_category`, `estimated_delivery`, `internal_notes`, `client_notes`, `client_avatar_url`, `assigned_employee_id` (uuid → team_members).
- `order_status_history` — new table: `order_id`, `from_status`, `to_status`, `changed_by`, `note`, `created_at`. Auto-populated by trigger on `orders` status change.
- `order_comments` — new table: `order_id`, `author_id`, `body`, `is_internal`, `created_at`.
- `order_attachments` — new table: `order_id`, `name`, `url`, `size`, `mime`, `uploaded_by`, `created_at`. + `order-files` storage bucket (private, authenticated read).
- `team_members` — add: `last_seen_at` (online if < 2 min), `bio`, `permissions` (jsonb), `completed_projects` (computed via view, not stored).
- `invoices` — new table: `order_id`, `number`, `amount`, `currency`, `status` (draft/sent/paid/overdue), `due_date`, `issued_at`, `paid_at`.
- `notifications` — new table: `type`, `title`, `body`, `entity_type`, `entity_id`, `read_at`, `created_at`, `recipient_id` (null = broadcast to all team).
- DB triggers: order insert → notification + activity log; order status change → status_history + notification; invoice overdue check via view.
- RLS: all tables `authenticated`-only (consistent with current model). Storage policies on `order-files` and `avatars` (already exists).

## Stage 2 — Orders

- 8 statuses with semantic color tokens + badge component (`src/components/StatusBadge.tsx`).
- New Order form (`orders.new.tsx`) extended with: client logo upload, whatsapp, country (select), priority, service category, estimated delivery (date picker), assigned employee (from team_members), internal/client notes, file attachments (multi-upload to `order-files`).
- Order list keeps existing search/filter/pagination; status filter expanded to 8 values; priority column added.
- **Order details page** (`src/routes/orders.$id.tsx`) — new route with tabs:
  - Overview: client info, payment summary, progress bar (editable), deadlines, assigned team.
  - Timeline: combined `activity_logs` + `order_status_history` (chronological).
  - Comments: internal vs client notes split, add comment box.
  - Files: list + upload to `order-files` bucket.
  - Status changer with note → writes to history.

## Stage 3 — Team, Notifications, Finance, Dashboard, Search

- **Team**: presence heartbeat (`team_members.last_seen_at` updated every 60s via `useEffect` for current logged-in member matched by email). Online dot on cards. Profile page `src/routes/team.$id.tsx` with assigned orders, completed count, bio, permissions toggles, notes.
- **Notifications**: bell icon in topbar (`AppLayout`) with dropdown + unread count, realtime subscription on `notifications`. Mark-as-read.
- **Finance**: extend `finance.tsx` with Invoices tab (CRUD), keep Expenses, add unpaid balances panel (`orders.total - orders.deposit` where status != cancelled/completed). Multi-currency display via `orders.currency`. Revenue chart already exists — keep.
- **Dashboard**: overdue projects panel (deadline < now & status not delivered/completed/cancelled), active staff (online team members), pending tasks (orders assigned to me in non-final status), latest activity (already there), recent orders (already there).
- **Global search**: command palette (`cmd/ctrl+K`) in topbar — searches `orders` (client/company), `team_members` (name/email), `invoices` (number). Uses shadcn `Command` component.

## Stage 4 — Wiring & safety

- All new server-touching code goes through the existing browser `supabase` client with RLS. No edge functions needed.
- No fake data anywhere — empty states everywhere.
- Routes remain protected via existing `auth.tsx` redirect in `__root.tsx`.

## Heads-up

This is roughly 12–15 new/edited files plus 1 migration. I'll write the migration first and wait for your approval, then push all code in one pass so the app compiles cleanly end-to-end.

After approval the migration is irreversible-ish (data preserved, but new tables/columns are added). Existing data is untouched.

Ready to proceed?
