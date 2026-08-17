import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SearchState {
  query: string;
  selectedDeity: string | null;
  selectedCategory: string | null;
  recentSearches: string[];
  setQuery: (q: string) => void;
  setSelectedDeity: (d: string | null) => void;
  setSelectedCategory: (c: string | null) => void;
  clearFilters: () => void;
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      query: '',
      selectedDeity: null,
      selectedCategory: null,
      recentSearches: [],
      
      setQuery: (q) => set({ query: q }),
      setSelectedDeity: (d) => set({ selectedDeity: d }),
      setSelectedCategory: (c) => set({ selectedCategory: c }),
      clearFilters: () => set({ query: '', selectedDeity: null, selectedCategory: null }),
      
      addRecentSearch: (query) => set((state) => {
        const trimmed = query.trim();
        if (!trimmed) return state;
        
        // Remove if it already exists to move it to the top
        const filtered = state.recentSearches.filter(s => s !== trimmed);
        
        return {
          recentSearches: [trimmed, ...filtered].slice(0, 10) // Keep last 10
        };
      }),
      
      removeRecentSearch: (query) => set((state) => ({
        recentSearches: state.recentSearches.filter(s => s !== query)
      })),
      
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'divine-stotra-search-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ recentSearches: state.recentSearches }), // Only persist history
    }
  )
);
