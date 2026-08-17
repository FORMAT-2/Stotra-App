import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  subscriptionStatus: 'none' | 'active' | 'past_due' | 'canceled';
  isGuest: boolean;
  isLoading: boolean;
  
  initialize: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  setGuestMode: (value: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  subscriptionStatus: 'none',
  isGuest: false,
  isLoading: true,

  fetchProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('subscription_status')
        .eq('id', userId)
        .single();
        
      if (!error && data) {
        set({ subscriptionStatus: data.subscription_status });
      }
    } catch (e) {
      console.error("Error fetching profile", e);
    }
  },

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user || null, isLoading: false, isGuest: false });
      
      if (session?.user) {
        await get().fetchProfile(session.user.id);
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        set({ session, user: session?.user || null, isGuest: false });
        if (session?.user) {
          await get().fetchProfile(session.user.id);
        } else {
          set({ subscriptionStatus: 'none' });
        }
      });
    } catch (error) {
      console.error("Auth init error:", error);
      set({ isLoading: false });
    }
  },

  setGuestMode: (value: boolean) => {
    set({ isGuest: value });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, isGuest: true, subscriptionStatus: 'none' });
  }
}));
