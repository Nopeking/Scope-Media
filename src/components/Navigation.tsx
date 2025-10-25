'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlayCircle, Film, Bell, User, Library, LogOut, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const Navigation = () => {
  const pathname = usePathname();
  const { user, userProfile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Live', href: '/live', icon: PlayCircle },
    { name: 'Past Shows', href: '/past-shows', icon: Film },
    ...(user ? [{ name: 'My Library', href: '/my-library', icon: Library }] : []),
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
        <header 
          className="sticky top-0 z-50 w-full border-b border-slate-200/30 dark:border-slate-700/30 bg-white/90 dark:bg-slate-900/90" 
          data-nav="true"
          style={{ 
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            position: 'sticky',
            top: 0
          }} 
          suppressHydrationWarning
        >
      <div className="container mx-auto flex items-center justify-between whitespace-nowrap px-4 py-3 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="flex items-center gap-2 sm:gap-8" suppressHydrationWarning>
          <Link href="/" className="flex items-center text-slate-900 dark:text-white" suppressHydrationWarning>
            <img 
              src="/logo.png" 
              alt="Scope Media Logo" 
              className="h-6 w-16 sm:h-8 sm:w-24 object-contain"
              style={{ margin: 0, padding: 0, marginRight: '-2px' }}
              suppressHydrationWarning
            />
                <h2 className="text-lg sm:text-xl font-bold font-display">Media</h2>
          </Link>
          <nav className="hidden md:flex items-center gap-6" suppressHydrationWarning>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-slate-700 dark:text-slate-300 hover:text-primary hover:scale-105'
                  }`}
                  suppressHydrationWarning
                >
                  <div className="flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform" suppressHydrationWarning>
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4" suppressHydrationWarning>
          <button className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors" suppressHydrationWarning>
            <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <ThemeToggle />
          
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors"
            suppressHydrationWarning
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-sm">
                <div className="font-medium text-slate-800 dark:text-white">
                  {userProfile?.full_name || 'User'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {userProfile?.subscription_plan || 'free'}
                </div>
              </div>
              <button
                onClick={signOut}
                className="h-8 w-8 sm:h-10 sm:w-10 aspect-square rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center hover:from-red-400 hover:to-red-600 transition-all"
                title="Sign Out"
                suppressHydrationWarning
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </button>
            </div>
          ) : (
            <Link 
              href="/login"
              className="h-8 w-8 sm:h-10 sm:w-10 aspect-square rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center hover:from-blue-400 hover:to-blue-600 transition-all"
              title="Sign In"
              suppressHydrationWarning
            >
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </Link>
          )}
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    suppressHydrationWarning
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;