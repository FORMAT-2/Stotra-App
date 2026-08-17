// ============================================================
// Data Store — Global state for deities, stotras, categories
// ============================================================

import { create } from 'zustand';
import { dataService } from '../services/DataService';
import type { Deity, Stotra, Category } from '../data/types';

interface DataState {
  deities: Deity[];
  stotras: Stotra[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  fetchData: () => Promise<void>;
}

export const useDataStore = create<DataState>((set) => ({
  deities: [],
  stotras: [],
  categories: [],
  isLoading: false,
  error: null,

  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [deities, stotras, categories] = await Promise.all([
        dataService.getDeities(),
        dataService.getStotras(),
        dataService.getCategories(),
      ]);
      const enrichedStotras = stotras.map(stotra => ({
        ...stotra,
        id: stotra.id || stotra.slug,
        title_sanskrit: stotra.title_sanskrit || stotra.title || '',
        title_english: stotra.title_english || stotra.title || '',
        category: typeof stotra.category === 'string' 
          ? { title_english: stotra.category, slug: stotra.category } 
          : stotra.category,
        deity: typeof stotra.deity === 'string'
          ? { name_english: stotra.deity, slug: stotra.deity }
          : stotra.deity,
      }));
      set({ deities, stotras: enrichedStotras, categories, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'Failed to fetch data', isLoading: false });
    }
  },
}));
