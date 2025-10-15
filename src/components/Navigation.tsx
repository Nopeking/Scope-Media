'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlayCircle, Film, Search, Bell, User, Library, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';

const Navigation = () => {
  const pathname = usePathname();
  const { user, userProfile, signOut } = useAuth();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Live', href: '/live', icon: PlayCircle },
    { name: 'Past Shows', href: '/past-shows', icon: Film },
    ...(user ? [{ name: 'My Library', href: '/my-library', icon: Library }] : []),
  ];

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
        <div className="flex items-center gap-8" suppressHydrationWarning>
          <Link href="/" className="flex items-center text-slate-900 dark:text-white" suppressHydrationWarning>
            <img 
              src="/logo.png" 
              alt="Scope Media Logo" 
              className="h-8 w-24 object-contain"
              style={{ margin: 0, padding: 0, marginRight: '-4px' }}
              suppressHydrationWarning
            />
                <h2 className="text-xl font-bold font-display">Media</h2>
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
        <div className="flex flex-1 items-center justify-end gap-4" suppressHydrationWarning>
          <div className="relative w-full max-w-xs" suppressHydrationWarning>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3" suppressHydrationWarning>
              <Search className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </div>
            <input
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Search"
              suppressHydrationWarning
            />
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors" suppressHydrationWarning>
            <Bell className="h-6 w-6" />
          </button>
          <ThemeToggle />
          
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
                className="h-10 w-10 aspect-square rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center hover:from-red-400 hover:to-red-600 transition-all"
                title="Sign Out"
                suppressHydrationWarning
              >
                <LogOut className="h-5 w-5 text-white" />
              </button>
            </div>
          ) : (
            <Link 
              href="/login"
              className="h-10 w-10 aspect-square rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center hover:from-blue-400 hover:to-blue-600 transition-all"
              title="Sign In"
              suppressHydrationWarning
            >
              <User className="h-5 w-5 text-white" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navigation;