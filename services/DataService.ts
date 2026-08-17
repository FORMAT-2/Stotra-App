// ============================================================
// Data Service — Abstracts fetching from Supabase or Mock Data
// ============================================================

import { supabase, hasValidSupabaseKeys } from '../lib/supabase';
import { MOCK_DEITIES, MOCK_STOTRAS, MOCK_VERSES, MOCK_CATEGORIES } from '../data/mockData';
import type { Stotra, Deity, Category, StotraVerse } from '../data/types';

export const dataService = {
  async getDeities(): Promise<Deity[]> {
    if (!hasValidSupabaseKeys) return MOCK_DEITIES;
    
    const { data, error } = await supabase
      .from('deities')
      .select('*')
      .order('display_order', { ascending: true });
      
    if (error) {
      console.error('Error fetching deities:', error);
      return MOCK_DEITIES;
    }
    return data as Deity[];
  },

  async getCategories(): Promise<Category[]> {
    if (!hasValidSupabaseKeys) return MOCK_CATEGORIES;
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
      
    if (error) {
      console.error('Error fetching categories:', error);
      return MOCK_CATEGORIES;
    }
    return data as Category[];
  },

  async getStotras(): Promise<Stotra[]> {
    if (!hasValidSupabaseKeys) return MOCK_STOTRAS;
    
    const { data, error } = await supabase
      .from('stotras')
      .select(`
        *,
        deity:deities(*),
        category:categories(*)
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching stotras:', error);
      return MOCK_STOTRAS;
    }
    return data as Stotra[];
  },

  async getVersesForStotra(stotraId: string): Promise<StotraVerse[]> {
    if (!hasValidSupabaseKeys) {
      return MOCK_VERSES.filter(v => v.stotra_id === stotraId);
    }
    
    const { data, error } = await supabase
      .from('stotra_verses')
      .select('*')
      .eq('stotra_id', stotraId)
      .order('verse_number', { ascending: true });
      
    if (error) {
      console.error('Error fetching verses:', error);
      return MOCK_VERSES.filter(v => v.stotra_id === stotraId);
    }
    return data as StotraVerse[];
  }
};
