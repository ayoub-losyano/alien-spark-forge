// Global error handling utilities
import { toast } from 'sonner';

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export function handleError(error: unknown, context?: string): AppError {
  let appError: AppError;

  if (error instanceof Error) {
    appError = {
      message: error.message,
      code: (error as any).code,
      status: (error as any).status,
    };
  } else if (typeof error === 'string') {
    appError = { message: error };
  } else if (error && typeof error === 'object' && 'message' in error) {
    appError = {
      message: String((error as any).message),
      code: (error as any).code,
      status: (error as any).status,
    };
  } else {
    appError = { message: 'An unexpected error occurred' };
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, appError);
  }

  return appError;
}

export function showErrorToast(error: unknown, context?: string): AppError {
  const appError = handleError(error, context);
  toast.error(appError.message);
  return appError;
}

export function showSuccessToast(message: string): void {
  toast.success(message);
}

export function showInfoToast(message: string): void {
  toast.info(message);
}

export function showWarningToast(message: string): void {
  toast.warning(message);
}

// Error boundary component helpers
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  }
  if (error instanceof Error) {
    return error.message;
  }
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}
