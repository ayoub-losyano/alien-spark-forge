import { useEffect, type ReactNode } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useAuth } from './auth.context';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthGuardProps {
  children: ReactNode;
  fallbackPath?: string;
}

export function AuthGuard({ children, fallbackPath = '/login' }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      // Store the current location to redirect back after login
      const returnUrl = location.pathname !== '/' ? location.pathname : '';
      navigate({ 
        to: fallbackPath,
        search: returnUrl ? { returnUrl } : undefined
      });
    }
  }, [user, loading, navigate, fallbackPath, location.pathname]);

  if (loading) {
    return <AuthLoadingSkeleton />;
  }

  if (!user) {
    return <AuthLoadingSkeleton />;
  }

  return <>{children}</>;
}

function AuthLoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="space-y-4 w-full max-w-md p-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

interface GuestGuardProps {
  children: ReactNode;
  redirectPath?: string;
}

export function GuestGuard({ children, redirectPath = '/dashboard' }: GuestGuardProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: redirectPath });
    }
  }, [user, loading, navigate, redirectPath]);

  if (loading) {
    return <AuthLoadingSkeleton />;
  }

  if (user) {
    return <AuthLoadingSkeleton />;
  }

  return <>{children}</>;
}
