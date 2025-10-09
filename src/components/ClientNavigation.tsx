'use client';

import { ReactNode } from 'react';
import Navigation from './Navigation';
import { ThemeProvider } from './ThemeProvider';

interface ClientNavigationProps {
  children?: ReactNode;
}

export default function ClientNavigation({ children }: ClientNavigationProps) {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen w-full flex-col">
        <Navigation />
        {children}
      </div>
    </ThemeProvider>
  );
}
