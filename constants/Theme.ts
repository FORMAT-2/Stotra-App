// ============================================================
// DIVINE STOTRA — Carousel / Cover-Flow Theme System
// ============================================================

export interface ThemeType {
  background: string;
  backgroundSecondary: string;
  card: string;
  surface: string;
  border: string;
  borderLight: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;
  accent: string;
  accentBg: string;
  accentText: string;
  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;
  goldGradientStart: string;
  goldGradientEnd: string;
  isDark: boolean;
}

export const Themes: Record<string, ThemeType> = {
  dawn: {
    background: '#FFF7ED', // orange-50
    backgroundSecondary: '#FFEDD5', // orange-100
    card: '#FFFFFF',
    surface: 'rgba(234, 88, 12, 0.05)',
    border: '#FFEDD5',
    borderLight: 'rgba(255, 237, 213, 0.5)',
    text: '#1C1917', // stone-900
    textSecondary: '#44403C', // stone-700
    textTertiary: '#78716C', // stone-500
    textMuted: '#A8A29E', // stone-400
    accent: '#EA580C', // orange-600
    accentBg: '#EA580C',
    accentText: '#FFFFFF',
    tabBar: 'rgba(255, 255, 255, 0.95)',
    tabBarActive: '#EA580C',
    tabBarInactive: '#A8A29E',
    goldGradientStart: 'rgba(234, 88, 12, 0.1)',
    goldGradientEnd: 'rgba(234, 88, 12, 0.0)',
    isDark: false,
  },
  dhyana: {
    background: '#0F172A', // slate-900
    backgroundSecondary: '#1E293B', // slate-800
    card: '#1E293B',
    surface: 'rgba(255, 255, 255, 0.05)',
    border: '#334155', // slate-700
    borderLight: 'rgba(51, 65, 85, 0.5)',
    text: '#F8FAFC', // slate-50
    textSecondary: '#CBD5E1', // slate-300
    textTertiary: '#94A3B8', // slate-400
    textMuted: '#64748B', // slate-500
    accent: '#2DD4BF', // teal-400
    accentBg: '#14B8A6', // teal-500
    accentText: '#0F172A',
    tabBar: 'rgba(15, 23, 42, 0.95)',
    tabBarActive: '#2DD4BF',
    tabBarInactive: '#64748B',
    goldGradientStart: 'rgba(45, 212, 191, 0.15)',
    goldGradientEnd: 'rgba(45, 212, 191, 0.0)',
    isDark: true,
  },
  temple: {
    background: '#FFFFFF',
    backgroundSecondary: '#F4F4F5',
    card: '#FFFFFF',
    surface: 'rgba(0, 0, 0, 0.03)',
    border: '#E4E4E7',
    borderLight: 'rgba(228, 228, 231, 0.5)',
    text: '#18181B',
    textSecondary: '#3F3F46',
    textTertiary: '#71717A',
    textMuted: '#A1A1AA',
    accent: '#18181B',
    accentBg: '#18181B',
    accentText: '#FFFFFF',
    tabBar: 'rgba(255, 255, 255, 0.95)',
    tabBarActive: '#18181B',
    tabBarInactive: '#A1A1AA',
    goldGradientStart: 'rgba(0, 0, 0, 0.05)',
    goldGradientEnd: 'rgba(0, 0, 0, 0.0)',
    isDark: false,
  },
  bhakti: {
    background: '#FFF1F2', // rose-50
    backgroundSecondary: '#FFE4E6', // rose-100
    card: '#FFFFFF',
    surface: 'rgba(225, 29, 72, 0.05)',
    border: '#FFE4E6',
    borderLight: 'rgba(255, 228, 230, 0.5)',
    text: '#4C0519', // rose-950
    textSecondary: '#881337', // rose-900
    textTertiary: '#BE123C', // rose-700
    textMuted: '#FDA4AF', // rose-300
    accent: '#E11D48', // rose-600
    accentBg: '#E11D48',
    accentText: '#FFFFFF',
    tabBar: 'rgba(255, 255, 255, 0.95)',
    tabBarActive: '#E11D48',
    tabBarInactive: '#FDA4AF',
    goldGradientStart: 'rgba(225, 29, 72, 0.1)',
    goldGradientEnd: 'rgba(225, 29, 72, 0.0)',
    isDark: false,
  },
  vedic: {
    background: '#FFFBEB', // amber-50
    backgroundSecondary: '#FEF3C7', // amber-100
    card: '#FEF3C7',
    surface: 'rgba(185, 28, 28, 0.05)',
    border: '#FDE68A', // amber-200
    borderLight: 'rgba(253, 230, 138, 0.5)',
    text: '#451A03', // amber-950
    textSecondary: '#78350F', // amber-900
    textTertiary: '#B45309', // amber-700
    textMuted: '#FCD34D', // amber-300
    accent: '#B91C1C', // red-700
    accentBg: '#B91C1C',
    accentText: '#FFFBEB',
    tabBar: 'rgba(254, 243, 199, 0.95)',
    tabBarActive: '#B91C1C',
    tabBarInactive: '#D97706',
    goldGradientStart: 'rgba(185, 28, 28, 0.1)',
    goldGradientEnd: 'rgba(185, 28, 28, 0.0)',
    isDark: false,
  },
  amrit: {
    background: '#082f49', // sky-900
    backgroundSecondary: '#0c4a6e', // sky-950
    card: '#0c4a6e',
    surface: 'rgba(255, 255, 255, 0.05)',
    border: '#075985', // sky-800
    borderLight: 'rgba(7, 89, 133, 0.5)',
    text: '#F0F9FF', // sky-50
    textSecondary: '#BAE6FD', // sky-200
    textTertiary: '#7DD3FC', // sky-300
    textMuted: '#38BDF8', // sky-400
    accent: '#7DD3FC', // sky-300
    accentBg: '#38BDF8', // sky-400
    accentText: '#082F49',
    tabBar: 'rgba(8, 47, 73, 0.95)',
    tabBarActive: '#7DD3FC',
    tabBarInactive: '#0284C7',
    goldGradientStart: 'rgba(125, 211, 252, 0.15)',
    goldGradientEnd: 'rgba(125, 211, 252, 0.0)',
    isDark: true,
  },
  dark: {
    background: '#09090b', // zinc-950
    backgroundSecondary: '#18181b', // zinc-900
    card: '#18181b',
    surface: 'rgba(255, 255, 255, 0.05)',
    border: '#27272a', // zinc-800
    borderLight: 'rgba(39, 39, 42, 0.5)',
    text: '#fafafa', // zinc-50
    textSecondary: '#e4e4e7', // zinc-200
    textTertiary: '#a1a1aa', // zinc-400
    textMuted: '#71717a', // zinc-500
    accent: '#fafafa',
    accentBg: '#fafafa',
    accentText: '#09090b',
    tabBar: 'rgba(9, 9, 11, 0.95)',
    tabBarActive: '#fafafa',
    tabBarInactive: '#71717a',
    goldGradientStart: 'rgba(255, 255, 255, 0.1)',
    goldGradientEnd: 'rgba(255, 255, 255, 0.0)',
    isDark: true,
  },
};

export const SacredColors = {
  gold: { 500: '#D4AF37' },
  saffron: { 600: '#EA580C' }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 36,
  full: 9999,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
};

export const Fonts = {
  serif: 'PlayfairDisplay_600SemiBold',
  serifBold: 'PlayfairDisplay_700Bold',
  sans: 'PlusJakartaSans_400Regular',
  sansMedium: 'PlusJakartaSans_500Medium',
  sansBold: 'PlusJakartaSans_700Bold',
};
