'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Demo credentials check
    if (email === 'admin@streamline.com' && password === 'admin123') {
      // Simulate login process
      setTimeout(() => {
        setIsLoading(false);
        // Redirect to dashboard
        router.push('/admin/dashboard');
      }, 1000);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        setError('Invalid email or password. Please use the demo credentials.');
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-blue-600/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-xl shadow-2xl p-8">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
              </svg>
              <h1 className="text-2xl font-bold text-slate-800">Streamline</h1>
            </div>
            <h2 className="text-xl font-semibold text-slate-600">Admin Panel</h2>
            <p className="text-sm text-slate-500 mt-2">Sign in to manage your content</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="admin@streamline.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  Sign In
                </>
              )}
            </motion.button>
          </form>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-slate-100 border border-slate-200 rounded-lg">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Demo Credentials:</h3>
            <div className="text-sm text-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900">Email:</span>
                <code 
                  className="bg-slate-200 px-2 py-1 rounded text-slate-800 font-mono cursor-pointer hover:bg-slate-300 transition-colors"
                  onClick={() => copyToClipboard('admin@streamline.com')}
                >
                  admin@streamline.com
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900">Password:</span>
                <code 
                  className="bg-slate-200 px-2 py-1 rounded text-slate-800 font-mono cursor-pointer hover:bg-slate-300 transition-colors"
                  onClick={() => copyToClipboard('admin123')}
                >
                  admin123
                </code>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-600">
              💡 Click on the credentials to copy them to your clipboard
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
