'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip check if on login page
    if (pathname.startsWith('/admin/login')) {
      return;
    }

    // If not authenticated and not on login page, redirect to admin login
    if (!loading && !isAdminAuthenticated) {
      router.push(`/admin/login?redirectTo=${encodeURIComponent(pathname)}`);
    }
  }, [isAdminAuthenticated, loading, router, pathname]);

  // Always allow login page
  if (pathname.startsWith('/admin/login')) {
    return <>{children}</>;
  }

  // Show loading state while checking admin auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAdminAuthenticated) {
    return null;
  }

  // Admin is authenticated, render the protected content
  return <>{children}</>;
}
