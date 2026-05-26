// Security utilities and helpers
import config from './config';

export const security = {
  // Validate that required environment variables are set
  validateEnv(): boolean {
    const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'];
    const missing = required.filter(key => !import.meta.env[key]);
    
    if (missing.length > 0 && config.isProduction) {
      console.error('Missing required environment variables:', missing);
      return false;
    }
    
    return true;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const sessionData = localStorage.getItem('supabase-auth-token');
    if (!sessionData) return false;
    
    try {
      const session = JSON.parse(sessionData);
      return !!session?.access_token && !!session?.user;
    } catch {
      return false;
    }
  },

  // Clear all auth data
  clearAuth(): void {
    localStorage.removeItem('supabase-auth-token');
    localStorage.removeItem('supabase-phone-auth-token');
    localStorage.removeItem('supabase-nextjs-meta');
    localStorage.removeItem('supabase-lang');
  },

  // Sanitize user input to prevent XSS
  sanitizeInput(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  },

  // Validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Get security headers for API requests
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    };
  },
};

export default security;
