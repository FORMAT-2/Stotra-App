import { supabase } from '../lib/supabase';

// Types (You can later generate these using supabase-cli, but for now we define manually)
export interface Deity {
  id: string;
  slug: string;
  name_english: string;
  name_sanskrit: string;
  image_url: string;
  accent_color: string;
}

export interface Category {
  id: string;
  slug: string;
  title_english: string;
  title_hindi: string;
  icon_url: string;
}

export interface Stotra {
  id: string;
  slug: string;
  title_english: string;
  title_sanskrit: string;
  title_hindi: string;
  deity_id: string;
  category_id: string;
  duration_seconds: number;
  audio_url: string;
  cover_image_url: string;
  reciter_name: string;
  deities?: Deity;
  categories?: Category;
}

export interface StotraVerse {
  id: string;
  stotra_id: string;
  verse_number: number;
  start_time_ms: number;
  end_time_ms: number;
  sanskrit_text: string;
  transliteration_iast: string;
  meaning_english: string;
}

// Fetch all Deities
export const fetchDeities = async () => {
  const { data, error } = await supabase
    .from('deities')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data as Deity[];
};

// Fetch all Categories
export const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data as Category[];
};

// Fetch all Stotras with their Deity and Category info
export const fetchStotras = async () => {
  const { data, error } = await supabase
    .from('stotras')
    .select(`
      *,
      deities ( * ),
      categories ( * )
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Stotra[];
};

// Fetch a single Stotra by slug
export const fetchStotraBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('stotras')
    .select(`
      *,
      deities ( * ),
      categories ( * )
    `)
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data as Stotra;
};

// Fetch verses for a specific Stotra
export const fetchStotraVerses = async (stotraId: string) => {
  const { data, error } = await supabase
    .from('stotra_verses')
    .select('*')
    .eq('stotra_id', stotraId)
    .order('verse_number', { ascending: true });
  if (error) throw error;
  return data as StotraVerse[];
};
