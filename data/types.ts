// ============================================================
// Divine Stotra & Mantra — TypeScript Types
// Local copy for mobile app (mirrors packages/database/types.ts)
// ============================================================

export interface Deity {
  id: string;
  slug: string;
  name_english: string;
  name_sanskrit: string;
  name_hindi?: string;
  image_url?: string;
  banner_url?: string;
  accent_color: string;
  description?: string;
  display_order: number;
  created_at: string;
}

export interface Category {
  id: string;
  slug: string;
  title_english: string;
  title_hindi?: string;
  description?: string;
  icon_url?: string;
  display_order: number;
  created_at: string;
}

export interface Stotra {
  id: string;
  slug: string;
  title_english: string;
  title_sanskrit: string;
  title_hindi?: string;
  deity_id?: string;
  category_id?: string;
  duration_seconds: number;
  audio_url: string;
  language?: string;
  cover_image_url?: string;
  reciter_name?: string;
  significance_english?: string;
  significance_hindi?: string;
  benefits?: string[];
  is_featured: boolean;
  is_published: boolean;
  view_count: number;
  play_count: number;
  day_of_week?: number;
  created_at: string;
  updated_at: string;
  deity?: Deity;
  category?: Category;
  verses?: StotraVerse[];
}

export interface StotraVerse {
  id: string;
  stotra_id: string;
  verse_number: number;
  start_time_ms: number;
  end_time_ms: number;
  sanskrit_text: string;
  transliteration_iast: string;
  meaning_english?: string;
  meaning_hindi?: string;
  created_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  stotra_id: string;
  created_at: string;
  stotra?: Stotra;
}

export interface UserPlaylist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
  items?: PlaylistItem[];
}

export interface PlaylistItem {
  id: string;
  playlist_id: string;
  stotra_id: string;
  position: number;
  added_at: string;
  stotra?: Stotra;
}

export interface JapamalaSession {
  id: string;
  user_id: string;
  mantra_name?: string;
  stotra_id?: string;
  total_count: number;
  target_count: number;
  completed: boolean;
  session_date: string;
  created_at: string;
}

export interface RecentlyPlayed {
  id: string;
  user_id: string;
  stotra_id: string;
  played_at: string;
  progress_ms: number;
  stotra?: Stotra;
}

export type ScriptMode = 'devanagari' | 'iast' | 'meaning';
export type ThemeMode = 'dark' | 'light';
export type RepeatMode = 'off' | 'all' | 'one';
export type PlaybackSpeed = 0.75 | 1.0 | 1.25 | 1.5;

export const DAY_DEITY_MAP: Record<number, string> = {
  0: 'surya',
  1: 'shiva',
  2: 'hanuman',
  3: 'ganesha',
  4: 'vishnu',
  5: 'durga',
  6: 'saturn',
};

export const CONTENT_TYPES = [
  'Mantra', 'Stotra', 'Bhajan', 'Chalisa', 'Aarti', 'Kavacham', 'Suktam',
] as const;

export type ContentType = typeof CONTENT_TYPES[number];

export const DURATION_FILTERS = [
  { label: 'Under 5 min', min: 0, max: 300 },
  { label: '5-15 min', min: 300, max: 900 },
  { label: '15-30 min', min: 900, max: 1800 },
  { label: '30+ min', min: 1800, max: Infinity },
] as const;
