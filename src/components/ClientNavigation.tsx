'use client';

import { ReactNode } from 'react';
import Navigation from './Navigation';
import { ThemeProvider } from './ThemeProvider';
import { useHydrationFix } from '@/hooks/useHydrationFix';

interface ClientNavigationProps {
  children?: ReactNode;
}

export default function ClientNavigation({ children }: ClientNavigationProps) {
  // Fix hydration issues caused by browser extensions
  useHydrationFix();

  return (
    <ThemeProvider>
      <div className="flex min-h-screen w-full flex-col">
        <Navigation />
        {children}
      </div>
    </ThemeProvider>
  );
}
