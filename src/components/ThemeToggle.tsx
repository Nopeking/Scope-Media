'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  console.log('ThemeToggle: Attempting to use theme context...');
  
  try {
    const { theme, toggleTheme } = useTheme();
    console.log('ThemeToggle: Successfully got theme:', theme);

    return (
      <button
        onClick={toggleTheme}
        className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        suppressHydrationWarning
      >
        {theme === 'light' ? (
          <Moon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        ) : (
          <Sun className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        )}
      </button>
    );
  } catch (error) {
    console.error('ThemeToggle: Error using theme context:', error);
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white">
        !
      </div>
    );
  }
}
