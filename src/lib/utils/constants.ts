// Business constants
export const ORDER_STATUSES = [
  'lead',
  'contacted',
  'waiting_payment',
  'in_progress',
  'review',
  'delivered',
  'completed',
  'cancelled',
] as const;

export const STATUS_COLORS: Record<string, string> = {
  lead: 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30',
  contacted: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/30',
  waiting_payment: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
  in_progress: 'bg-primary/10 text-primary border-primary/30',
  review: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30',
  delivered: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
  completed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  cancelled: 'bg-muted text-muted-foreground border-border',
  // Legacy fallbacks
  pending_deposit: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
  active: 'bg-primary/10 text-primary border-primary/30',
  waiting_client: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30',
  overdue: 'bg-red-500/10 text-red-600 dark:text-red-300 border-red-500/30',
};

export const STATUS_LABELS: Record<string, string> = {
  lead: 'Lead',
  contacted: 'Contacted',
  waiting_payment: 'Waiting Payment',
  in_progress: 'In Progress',
  review: 'Review',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;

export const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-muted text-muted-foreground border-border',
  normal: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/30',
  high: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
  urgent: 'bg-red-500/10 text-red-600 dark:text-red-300 border-red-500/30',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
};

export const SERVICE_CATEGORIES = [
  'Web Development',
  'Mobile App',
  'Chatbot / Automation',
  'Branding / Design',
  'Marketing',
  'Consulting',
  'Other',
] as const;

export const COUNTRIES = [
  'Vietnam',
  'United States',
  'United Kingdom',
  'Australia',
  'Singapore',
  'Japan',
  'Korea',
  'Thailand',
  'Malaysia',
  'Indonesia',
  'Philippines',
  'France',
  'Germany',
  'Canada',
  'Other',
] as const;

export const PACKAGES = [
  'Website Basic',
  'Website Pro',
  'Zalo Mini App',
  'Booking System',
  'Chatbot',
  'Automation',
  'Custom',
] as const;

export const TEAM_ROLES = [
  'Admin',
  'Manager',
  'Developer',
  'Designer',
  'Sales',
  'Support',
] as const;

export const EXPENSE_CATEGORIES = [
  'Software',
  'Marketing',
  'Payroll',
  'Office',
  'Hosting',
  'Travel',
  'Other',
] as const;

export const PAYMENT_METHODS = [
  'Bank transfer',
  'Momo',
  'ZaloPay',
  'Cash',
  'Other',
] as const;

export const PAYMENT_STATUSES = ['pending', 'partial', 'completed', 'refunded'] as const;

// Navigation configuration
export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/orders/new', label: 'New Order', icon: 'PlusCircle' },
  { path: '/orders', label: 'Orders & Projects', icon: 'FolderKanban' },
  { path: '/finance', label: 'Finance', icon: 'Wallet' },
  { path: '/team', label: 'Team', icon: 'Users' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
] as const;

// Active order statuses for filtering
export const ACTIVE_ORDER_STATUSES = ['lead', 'contacted', 'waiting_payment', 'in_progress', 'review'] as const;

// Completed order statuses
export const COMPLETED_ORDER_STATUSES = ['completed', 'delivered'] as const;
