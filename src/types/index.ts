// Re-export all types from the database schema
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes,
} from './integrations/supabase/types';

// Domain-specific types derived from database types
export type {
  Order,
  OrderInsert,
  OrderUpdate,
  TeamMember,
  TeamMemberInsert,
  TeamMemberUpdate,
  Expense,
  ExpenseInsert,
  ExpenseUpdate,
  Notification,
  NotificationInsert,
  CompanySettings,
  CompanySettingsInsert,
  CompanySettingsUpdate,
  ActivityLog,
  ActivityLogInsert,
  OrderComment,
  OrderCommentInsert,
  OrderAttachment,
  OrderAttachmentInsert,
  OrderStatusHistory,
  OrderStatusHistoryInsert,
} from './types/domain';
