// ============================================================
// Theme Context — Provides the 6 Sacred Themes
// ============================================================

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { Themes, type ThemeType } from '../constants/Theme';

export type ThemeName = 'dawn' | 'dhyana' | 'temple' | 'bhakti' | 'vedic' | 'amrit';

interface ThemeContextType {
  mode: ThemeName;
  theme: ThemeType;
  setTheme: (mode: ThemeName) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dawn',
  theme: Themes.dawn,
  setTheme: () => {},
  isDark: false,
});

export function SacredThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeName>('dawn');

  const setTheme = useCallback((newMode: ThemeName) => {
    setMode(newMode);
  }, []);

  const value = useMemo(() => ({
    mode,
    theme: Themes[mode],
    setTheme,
    isDark: Themes[mode].isDark,
  }), [mode, setTheme]);

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
