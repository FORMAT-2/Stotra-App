import { create } from 'zustand';
import { supabase, hasValidSupabaseKeys } from '../lib/supabase';
import { useAuthStore } from './authStore';
import type { UserPlaylist, PlaylistItem, Stotra } from '../data/types';
import { Alert } from 'react-native';

interface PlaylistState {
  playlists: UserPlaylist[];
  isLoading: boolean;
  
  fetchPlaylists: () => Promise<void>;
  createPlaylist: (name: string, description?: string) => Promise<void>;
  renamePlaylist: (playlistId: string, newName: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addStotraToPlaylist: (playlistId: string, stotra: Stotra) => Promise<void>;
  removeStotraFromPlaylist: (playlistId: string, stotraId: string) => Promise<void>;
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [],
  isLoading: false,

  fetchPlaylists: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    const { useSettingsStore } = require('./settingsStore');
    if (useSettingsStore.getState().offlineMode) {
      // Cannot fetch new playlists in offline mode
      return;
    }

    if (!hasValidSupabaseKeys) {
      // Mock data handling if needed
      return;
    }

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('user_playlists')
        .select(`
          *,
          items:playlist_items(
            *,
            stotra:stotras(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ playlists: data as unknown as UserPlaylist[] });
    } catch (e) {
      console.error('Failed to fetch playlists:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  createPlaylist: async (name, description) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to create playlists.');
      return;
    }

    const { useSettingsStore } = require('./settingsStore');
    if (useSettingsStore.getState().offlineMode) {
      Alert.alert('Offline Mode Active', 'Cannot create playlists while offline.');
      return;
    }

    if (!hasValidSupabaseKeys) {
      Alert.alert('Demo Mode', 'Playlists are not supported in demo mode.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_playlists')
        .insert({
          user_id: user.id,
          name,
          description,
        })
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({
        playlists: [
          { ...(data as unknown as UserPlaylist), items: [] },
          ...state.playlists
        ]
      }));
    } catch (e) {
      console.error('Failed to create playlist:', e);
      Alert.alert('Error', 'Failed to create playlist.');
    }
  },

  renamePlaylist: async (playlistId, newName) => {
    const { useSettingsStore } = require('./settingsStore');
    if (useSettingsStore.getState().offlineMode) {
      Alert.alert('Offline Mode Active', 'Cannot rename playlists while offline.');
      return;
    }

    if (!hasValidSupabaseKeys) return;

    try {
      const { error } = await supabase
        .from('user_playlists')
        .update({ name: newName })
        .eq('id', playlistId);

      if (error) throw error;
      await get().fetchPlaylists(); // Refresh
    } catch (e) {
      console.error('Failed to rename playlist:', e);
      Alert.alert('Error', 'Failed to rename playlist.');
    }
  },

  deletePlaylist: async (playlistId) => {
    const { useSettingsStore } = require('./settingsStore');
    if (useSettingsStore.getState().offlineMode) {
      Alert.alert('Offline Mode Active', 'Cannot delete playlists while offline.');
      return;
    }

    if (!hasValidSupabaseKeys) return;

    try {
      const { error } = await supabase
        .from('user_playlists')
        .delete()
        .eq('id', playlistId);

      if (error) throw error;
      
      set((state) => ({
        playlists: state.playlists.filter(p => p.id !== playlistId)
      }));
    } catch (e) {
      console.error('Failed to delete playlist:', e);
      Alert.alert('Error', 'Failed to delete playlist.');
    }
  },

  addStotraToPlaylist: async (playlistId, stotra) => {
    const { useSettingsStore } = require('./settingsStore');
    if (useSettingsStore.getState().offlineMode) {
      Alert.alert('Offline Mode Active', 'Cannot add items to playlists while offline.');
      return;
    }

    if (!hasValidSupabaseKeys) return;

    try {
      const playlist = get().playlists.find(p => p.id === playlistId);
      const position = playlist?.items?.length || 0;

      const { error } = await supabase
        .from('playlist_items')
        .insert({
          playlist_id: playlistId,
          stotra_id: stotra.id,
          position,
        });

      if (error) {
        if (error.code === '23505') {
          Alert.alert('Already added', 'This chant is already in the playlist.');
          return;
        }
        throw error;
      }

      await get().fetchPlaylists(); // Refresh
      Alert.alert('Added', 'Successfully added to playlist.');
    } catch (e) {
      console.error('Failed to add to playlist:', e);
    }
  },

  removeStotraFromPlaylist: async (playlistId, stotraId) => {
    const { useSettingsStore } = require('./settingsStore');
    if (useSettingsStore.getState().offlineMode) {
      Alert.alert('Offline Mode Active', 'Cannot remove items while offline.');
      return;
    }

    if (!hasValidSupabaseKeys) return;

    try {
      const { error } = await supabase
        .from('playlist_items')
        .delete()
        .match({ playlist_id: playlistId, stotra_id: stotraId });

      if (error) throw error;
      
      await get().fetchPlaylists(); // Refresh
    } catch (e) {
      console.error('Failed to remove from playlist:', e);
    }
  },
}));
