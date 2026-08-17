import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

interface FavoritesState {
  favoriteIds: string[];
  isLoading: boolean;
  
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (stotraId: string) => Promise<boolean>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: [],
  isLoading: false,

  fetchFavorites: async () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      set({ favoriteIds: [] });
      return;
    }

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('stotra_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      set({ 
        favoriteIds: data ? data.map(row => row.stotra_id) : [],
        isLoading: false
      });
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
      set({ isLoading: false });
    }
  },

  toggleFavorite: async (stotraId: string) => {
    console.log("toggleFavorite called with id:", stotraId);
    console.log("authStore:", useAuthStore);
    console.log("authStore.getState:", useAuthStore ? useAuthStore.getState : 'undefined');

    const authState = useAuthStore.getState();
    const user = authState ? authState.user : null;
    
    if (!user) {
      console.log("User is null, cannot toggle favorite");
      return false;
    }

    const { favoriteIds } = get();
    const isFavorite = favoriteIds.includes(stotraId);

    try {
      if (isFavorite) {
        // Optimistic update
        set({ favoriteIds: favoriteIds.filter(id => id !== stotraId) });
        
        await supabase
          .from('user_favorites')
          .delete()
          .match({ user_id: user.id, stotra_id: stotraId });
      } else {
        // Optimistic update
        set({ favoriteIds: [...favoriteIds, stotraId] });
        
        await supabase
          .from('user_favorites')
          .insert({ user_id: user.id, stotra_id: stotraId });
      }
      return true;
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      // Revert optimistic update
      await get().fetchFavorites();
      return false;
    }
  }
}));
