'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  loading: boolean;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Hardcoded admin credentials (in production, use environment variables)
const ADMIN_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'admin123',
};

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in (from localStorage)
    try {
      const adminAuth = localStorage.getItem('admin_authenticated');
      const loginTime = localStorage.getItem('admin_login_time');
      
      if (adminAuth === 'true' && loginTime) {
        const loginTimestamp = parseInt(loginTime, 10);
        const now = Date.now();
        const sessionDuration = 60 * 60 * 1000; // 60 minutes in milliseconds
        
        // Check if session has expired
        if (now - loginTimestamp > sessionDuration) {
          // Session expired, logout
          setIsAdminAuthenticated(false);
          localStorage.removeItem('admin_authenticated');
          localStorage.removeItem('admin_login_time');
          setLoading(false);
          // Redirect to login if we're in admin area (but not already on login page)
          if (typeof window !== 'undefined' && 
              window.location.pathname.startsWith('/admin') && 
              !window.location.pathname.startsWith('/admin/login')) {
            window.location.href = '/admin/login';
          }
          return;
        } else {
          // Session is valid
          setIsAdminAuthenticated(true);
          setLoading(false);
          // Set up auto-logout timer for remaining time
          const remainingTime = sessionDuration - (now - loginTimestamp);
          const timeoutId = setTimeout(() => {
            setIsAdminAuthenticated(false);
            localStorage.removeItem('admin_authenticated');
            localStorage.removeItem('admin_login_time');
            if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
              window.location.href = '/admin/login?expired=true';
            }
          }, remainingTime);
          
          return () => clearTimeout(timeoutId);
        }
      } else {
        // Not logged in
        setIsAdminAuthenticated(false);
        setLoading(false);
      }
    } catch (error) {
      // Error accessing localStorage (might be SSR or disabled)
      console.error('Error checking admin auth:', error);
      setIsAdminAuthenticated(false);
      setLoading(false);
    }
  }, []);

  // Set up periodic activity check to reset timer on user activity
  useEffect(() => {
    if (!isAdminAuthenticated) return;

    let activityTimer: NodeJS.Timeout;
    let inactivityTimer: NodeJS.Timeout;
    const SESSION_DURATION = 60 * 60 * 1000; // 60 minutes

    const resetSessionTimer = () => {
      const loginTime = localStorage.getItem('admin_login_time');
      if (!loginTime) return;

      const loginTimestamp = parseInt(loginTime, 10);
      const now = Date.now();
      const elapsed = now - loginTimestamp;

      if (elapsed >= SESSION_DURATION) {
        // Session expired
        setIsAdminAuthenticated(false);
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_login_time');
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login?expired=true';
        }
        return;
      }

      // Clear existing timers
      clearTimeout(activityTimer);
      clearTimeout(inactivityTimer);

      // Set new timer for remaining time
      const remainingTime = SESSION_DURATION - elapsed;
      inactivityTimer = setTimeout(() => {
        setIsAdminAuthenticated(false);
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_login_time');
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login?expired=true';
        }
      }, remainingTime);
    };

    // Check every 5 minutes
    activityTimer = setInterval(resetSessionTimer, 5 * 60 * 1000);

    // Listen for user activity to verify session is still valid
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => {
      resetSessionTimer();
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial check
    resetSessionTimer();

    return () => {
      clearInterval(activityTimer);
      clearTimeout(inactivityTimer);
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAdminAuthenticated]);

  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simple credential check
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      setIsAdminAuthenticated(true);
      const loginTime = Date.now();
      localStorage.setItem('admin_authenticated', 'true');
      localStorage.setItem('admin_login_time', loginTime.toString());
      return { success: true };
    } else {
      return { success: false, error: 'Invalid admin credentials' };
    }
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_login_time');
  };

  const value = {
    isAdminAuthenticated,
    loading,
    adminLogin,
    adminLogout,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
