// Environment configuration for different deployment targets
export const config = {
  // Application info
  app: {
    name: import.meta.env.VITE_APP_NAME || 'AlienSpark OPS Console',
    url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  },

  // Feature flags
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },

  // Session settings
  session: {
    timeout: Number(import.meta.env.VITE_SESSION_TIMEOUT) || 86400, // 24 hours default
  },

  // API settings
  api: {
    rateLimit: Number(import.meta.env.VITE_API_RATE_LIMIT) || 100,
  },

  // Check if running in production
  isProduction: import.meta.env.VITE_ENVIRONMENT === 'production',

  // Check if running in development
  isDevelopment: import.meta.env.VITE_ENVIRONMENT === 'development',

  // Check if running in staging
  isStaging: import.meta.env.VITE_ENVIRONMENT === 'staging',
} as const;

// Type-safe config accessor
export type Config = typeof config;

export function getConfig(): Config {
  return config;
}

export default config;
