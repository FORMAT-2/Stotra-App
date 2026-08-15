// ============================================================
// Theme Context — Provides dark/light theme to entire app
// ============================================================

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { DarkTheme, LightTheme, type ThemeType } from '../constants/Theme';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  mode: ThemeMode;
  theme: ThemeType;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  theme: DarkTheme,
  toggleTheme: () => {},
  setTheme: () => {},
  isDark: true,
});

export function SacredThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  const toggleTheme = useCallback(() => {
    setMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
  }, []);

  const value = useMemo(() => ({
    mode,
    theme: mode === 'dark' ? DarkTheme : LightTheme,
    toggleTheme,
    setTheme,
    isDark: mode === 'dark',
  }), [mode, toggleTheme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useSacredTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useSacredTheme must be used within a SacredThemeProvider');
  }
  return context;
}
