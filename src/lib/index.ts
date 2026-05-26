// Main entry point for lib - re-exports everything
export * from './services';
export * from './utils';
export * from './config';
export * from './security';

// Legacy exports from logger.ts for backwards compatibility
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
