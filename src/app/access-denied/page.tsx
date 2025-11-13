'use client';

import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function AccessDeniedPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-4 rounded-full">
              <ShieldAlert className="w-16 h-16 text-red-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Access Denied
          </h1>

          {/* Message */}
          <p className="text-slate-600 mb-6">
            You don't have permission to access the admin panel. Only administrators can access this area.
          </p>

          {/* User Info */}
          {user && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-slate-600 mb-1">Logged in as:</p>
              <p className="font-medium text-slate-800">{user.email}</p>
            </div>
          )}

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Need admin access?</strong>
              <br />
              Contact your system administrator to request admin privileges.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              Go to Home
            </Link>

            <button
              onClick={() => signOut()}
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Admin Login Hint */}
          <p className="text-xs text-slate-500 mt-6">
            If you're an admin, please{' '}
            <button
              onClick={() => signOut()}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              sign out
            </button>
            {' '}and log in with your admin account.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
