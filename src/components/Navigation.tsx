'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlayCircle, Film, Search, Bell, User } from 'lucide-react';

const Navigation = () => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Live', href: '/live', icon: PlayCircle },
    { name: 'Past Shows', href: '/past-shows', icon: Film },
  ];

  return (
        <header className="sticky top-0 z-10 w-full bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50" suppressHydrationWarning>
      <div className="container mx-auto flex items-center justify-between whitespace-nowrap px-4 py-3 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="flex items-center gap-8" suppressHydrationWarning>
          <Link href="/" className="flex items-center gap-2 text-white" suppressHydrationWarning>
            <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" suppressHydrationWarning>
              <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
            </svg>
                <h2 className="text-xl font-bold font-display">Scope Media</h2>
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
                      : 'text-white/90 hover:text-primary hover:scale-105'
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
              <Search className="h-5 w-5 text-white/70" />
            </div>
            <input
              className="w-full rounded-lg border-0 bg-white/20 backdrop-blur-sm py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white/30"
              placeholder="Search"
              suppressHydrationWarning
            />
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 hover:bg-white/20 hover:text-primary transition-colors" suppressHydrationWarning>
            <Bell className="h-6 w-6" />
          </button>
          <a
            href="/admin"
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            suppressHydrationWarning
          >
            Admin
          </a>
          <div className="h-10 w-10 aspect-square rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center" suppressHydrationWarning>
            <User className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;