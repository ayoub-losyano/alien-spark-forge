// Legacy exports from logger.ts - maintaining backwards compatibility
// New architecture uses services in lib/services/

// Re-export services for backwards compatibility
export {
  orderService,
  teamService,
  expenseService,
  activityService,
  logActivity,
  notify,
  storageService,
  commentService,
  attachmentService,
  statusHistoryService,
  settingsService,
  notificationService,
} from './services';

// Re-export constants
export {
  ORDER_STATUSES,
  STATUS_COLORS,
  STATUS_LABELS,
  PRIORITIES,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  SERVICE_CATEGORIES,
  COUNTRIES,
  PACKAGES,
  TEAM_ROLES,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  NAV_ITEMS,
  ACTIVE_ORDER_STATUSES,
  COMPLETED_ORDER_STATUSES,
} from './utils/constants';

// Re-export formatters
export {
  formatVND,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatFileSize,
} from './utils/formatters';

// Re-export validators
export {
  validators,
  validateForm,
  createValidator,
} from './utils/validators';
