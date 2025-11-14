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
    const adminAuth = localStorage.getItem('admin_authenticated');
    if (adminAuth === 'true') {
      setIsAdminAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simple credential check
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      return { success: true };
    } else {
      return { success: false, error: 'Invalid admin credentials' };
    }
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
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
