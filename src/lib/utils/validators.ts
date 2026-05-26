// Validation utilities
export const validators = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-+()]{8,}$/;
    return phoneRegex.test(phone);
  },

  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  isRequired: (value: string | null | undefined): boolean => {
    return value !== null && value !== undefined && value.trim().length > 0;
  },

  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  isPositiveNumber: (value: number): boolean => {
    return typeof value === 'number' && value >= 0;
  },

  isValidPercentage: (value: number): boolean => {
    return typeof value === 'number' && value >= 0 && value <= 100;
  },
};

// Validation schemas
export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export const createValidator = (rules: ValidationRule[]) => {
  return (value: any): string | null => {
    for (const rule of rules) {
      if (!rule.validate(value)) {
        return rule.message;
      }
    }
    return null;
  };
};

// Form validation helper
export const validateForm = (
  fields: Record<string, string | null | undefined>,
  rules: Record<string, ValidationRule[]>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  for (const [fieldName, rulesList] of Object.entries(rules)) {
    const value = fields[fieldName];
    for (const rule of rulesList) {
      if (!rule.validate(value)) {
        errors[fieldName] = rule.message;
        break;
      }
    }
  }

  return errors;
};
