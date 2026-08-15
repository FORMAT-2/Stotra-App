// ============================================================
// DIVINE STOTRA — Sacred Design System Theme
// "Sacred Serenity & Divine Stillness"
// ============================================================

export const SacredColors = {
  // Primary — Sacred Gold
  gold: {
    50: '#FFFDF5',
    100: '#FFF9E0',
    200: '#FFF0B8',
    300: '#FFE380',
    400: '#F5C842',
    500: '#D4AF37', // Primary accent
    600: '#B8942A',
    700: '#8B6F1F',
    800: '#5E4A14',
    900: '#3A2E0C',
  },

  // Secondary — Deep Saffron / Ochre
  saffron: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F59E0B',
    600: '#EA580C', // Secondary accent
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },

  // Dark Theme — Midnight Temple Obsidian
  obsidian: {
    50: '#F5F3FF',
    100: '#2A2640',
    200: '#221F38',
    300: '#1D1A30',
    400: '#191628',
    500: '#16141F', // Dark background alternate
    600: '#131120',
    700: '#0F0E17', // Primary dark background
    800: '#0B0A12',
    900: '#07060D',
  },

  // Light Theme — Ivory & Sandalwood
  ivory: {
    50: '#FFFFFF',
    100: '#FEFDFB',
    200: '#FBF9F5',
    300: '#FAF7F2', // Primary light background
    400: '#F0ECE3',
    500: '#E5DFD3', // Sandalwood accent
    600: '#C9C1B0',
    700: '#A89E8E',
    800: '#7A7166',
    900: '#4D4640',
  },

  // Accent — Divine Lotus Pink
  lotus: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#F472B6', // Lotus highlight
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
  },

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Success / Error / Warning
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export const DarkTheme = {
  background: SacredColors.obsidian[700],       // #0F0E17
  backgroundSecondary: SacredColors.obsidian[500], // #16141F
  backgroundTertiary: SacredColors.obsidian[300],  // #1D1A30
  card: SacredColors.obsidian[400],              // #191628
  cardElevated: SacredColors.obsidian[200],      // #221F38
  surface: 'rgba(255, 255, 255, 0.05)',
  surfaceHover: 'rgba(255, 255, 255, 0.08)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.04)',

  text: '#FAF7F2',
  textSecondary: 'rgba(250, 247, 242, 0.7)',
  textTertiary: 'rgba(250, 247, 242, 0.45)',
  textMuted: 'rgba(250, 247, 242, 0.3)',

  accent: SacredColors.gold[500],
  accentLight: SacredColors.gold[400],
  accentDark: SacredColors.gold[600],
  secondary: SacredColors.saffron[600],
  lotus: SacredColors.lotus[500],

  tabBar: 'rgba(15, 14, 23, 0.95)',
  tabBarBorder: 'rgba(212, 175, 55, 0.15)',
  tabBarActive: SacredColors.gold[500],
  tabBarInactive: 'rgba(250, 247, 242, 0.35)',

  miniPlayer: 'rgba(25, 22, 40, 0.98)',
  miniPlayerBorder: 'rgba(212, 175, 55, 0.2)',

  gradientStart: SacredColors.obsidian[700],
  gradientEnd: SacredColors.obsidian[500],
  goldGradientStart: 'rgba(212, 175, 55, 0.15)',
  goldGradientEnd: 'rgba(212, 175, 55, 0.0)',
};

export const LightTheme = {
  background: SacredColors.ivory[300],
  backgroundSecondary: SacredColors.ivory[200],
  backgroundTertiary: SacredColors.ivory[100],
  card: SacredColors.white,
  cardElevated: SacredColors.white,
  surface: 'rgba(0, 0, 0, 0.03)',
  surfaceHover: 'rgba(0, 0, 0, 0.06)',
  border: 'rgba(0, 0, 0, 0.08)',
  borderLight: 'rgba(0, 0, 0, 0.04)',

  text: SacredColors.obsidian[700],
  textSecondary: 'rgba(15, 14, 23, 0.65)',
  textTertiary: 'rgba(15, 14, 23, 0.4)',
  textMuted: 'rgba(15, 14, 23, 0.25)',

  accent: SacredColors.gold[600],
  accentLight: SacredColors.gold[500],
  accentDark: SacredColors.gold[700],
  secondary: SacredColors.saffron[700],
  lotus: SacredColors.lotus[600],

  tabBar: 'rgba(255, 255, 255, 0.98)',
  tabBarBorder: 'rgba(0, 0, 0, 0.06)',
  tabBarActive: SacredColors.gold[600],
  tabBarInactive: 'rgba(15, 14, 23, 0.35)',

  miniPlayer: 'rgba(255, 255, 255, 0.98)',
  miniPlayerBorder: 'rgba(212, 175, 55, 0.25)',

  gradientStart: SacredColors.ivory[300],
  gradientEnd: SacredColors.ivory[200],
  goldGradientStart: 'rgba(212, 175, 55, 0.1)',
  goldGradientEnd: 'rgba(212, 175, 55, 0.0)',
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
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  full: 9999,
};

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
};

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export type ThemeType = typeof DarkTheme;
