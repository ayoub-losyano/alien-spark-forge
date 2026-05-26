import type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/integrations/supabase/types';

// Order types
export type Order = Tables<'orders'>;
export type OrderInsert = TablesInsert<'orders'>;
export type OrderUpdate = TablesUpdate<'orders'>;

// Team member types
export type TeamMember = Tables<'team_members'>;
export type TeamMemberInsert = TablesInsert<'team_members'>;
export type TeamMemberUpdate = TablesUpdate<'team_members'>;

// Expense types
export type Expense = Tables<'expenses'>;
export type ExpenseInsert = TablesInsert<'expenses'>;
export type ExpenseUpdate = TablesUpdate<'expenses'>;

// Notification types
export type Notification = Tables<'notifications'>;
export type NotificationInsert = TablesInsert<'notifications'>;

// Company settings types
export type CompanySettings = Tables<'company_settings'>;
export type CompanySettingsInsert = TablesInsert<'company_settings'>;
export type CompanySettingsUpdate = TablesUpdate<'company_settings'>;

// Activity log types
export type ActivityLog = Tables<'activity_logs'>;
export type ActivityLogInsert = TablesInsert<'activity_logs'>;

// Order comment types
export type OrderComment = Tables<'order_comments'>;
export type OrderCommentInsert = TablesInsert<'order_comments'>;

// Order attachment types
export type OrderAttachment = Tables<'order_attachments'>;
export type OrderAttachmentInsert = TablesInsert<'order_attachments'>;

// Order status history types
export type OrderStatusHistory = Tables<'order_status_history'>;
export type OrderStatusHistoryInsert = TablesInsert<'order_status_history'>;

// Invoice types
export type Invoice = Tables<'invoices'>;

// Enums and constants
export type OrderStatus = 'lead' | 'contacted' | 'waiting_payment' | 'in_progress' | 'review' | 'delivered' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'partial' | 'completed' | 'refunded';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';
export type TeamRole = 'Admin' | 'Manager' | 'Developer' | 'Designer' | 'Sales' | 'Support';

// Permission system
export interface Permissions {
  manage_orders?: boolean;
  manage_finance?: boolean;
  manage_team?: boolean;
  manage_settings?: boolean;
}

// Form state types
export interface OrderFormState {
  client_name: string;
  company_name: string;
  business_name: string;
  business_type: string;
  email: string;
  phone: string;
  zalo: string;
  facebook: string;
  tiktok: string;
  website: string;
  address: string;
  package: string;
  service: string;
  total: number;
  deposit: number;
  payment_method: string;
  delivery_days: number;
  assigned_to: string;
  notes: string;
  status: OrderStatus;
}

// Pagination
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Filter state
export interface OrderFilterState {
  search: string;
  status: string;
  package: string;
}

// Dashboard stats
export interface DashboardStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
  revenue: number;
  pendingPayments: number;
  leadsThisMonth: number;
  teamCount: number;
}
