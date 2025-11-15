'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full">
        <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-400" />
      </div>
    );
  }

  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      suppressHydrationWarning
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-400" />
      ) : (
        <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-400" />
      )}
    </button>
  );
}
