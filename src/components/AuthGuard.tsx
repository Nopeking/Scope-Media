'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      if (loading) return;

      // Skip auth check if we're on the login page itself
      if (pathname.startsWith('/admin/login')) {
        setChecking(false);
        return;
      }

      // If not logged in, redirect to admin login
      if (!user) {
        router.push(`/admin/login?redirectTo=${encodeURIComponent(pathname)}`);
        return;
      }

      // If admin check is required, verify admin status
      if (requireAdmin && supabase) {
        try {
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
            setChecking(false);
            return;
          }

          const adminStatus = profile?.is_admin === true;
          setIsAdmin(adminStatus);

          // If not admin, redirect to access denied
          if (!adminStatus) {
            router.push('/access-denied');
          }
        } catch (error) {
          console.error('Error in admin check:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(true); // Not requiring admin check
      }

      setChecking(false);
    }

    checkAdminStatus();
  }, [user, loading, router, pathname, requireAdmin]);

  // Always allow rendering of login page
  const isLoginPage = pathname.startsWith('/admin/login');

  // Show loading state while checking auth (but not for login page)
  if (!isLoginPage && (loading || checking)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Always render login page without auth check
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Don't render children if not authenticated or not admin
  if (!user || (requireAdmin && !isAdmin)) {
    return null;
  }

  // User is authenticated and authorized, render the protected content
  return <>{children}</>;
}
