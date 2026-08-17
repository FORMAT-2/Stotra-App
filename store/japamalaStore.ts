// ============================================================
// Japamala Store — Zustand state for the 108-bead counter
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface JapamalaState {
  count: number;
  totalSessions: number;
  totalLifetimeCount: number;
  currentStreak: number;
  isActive: boolean;
  mantraName: string;

  increment: (targetCount: number) => void;
  reset: () => void;
  setMantraName: (name: string) => void;
  setActive: (active: boolean) => void;
  completeSession: () => void;
}

export const useJapamalaStore = create<JapamalaState>()(
  persist(
    (set, get) => ({
      count: 0,
      totalSessions: 0,
      totalLifetimeCount: 0,
      currentStreak: 0,
      isActive: false,
      mantraName: 'ॐ नमः शिवाय (Om Namah Shivaya)',

      increment: (targetCount: number) => {
        const { count } = get();
        if (count < targetCount) {
          set(state => ({
            count: state.count + 1,
            totalLifetimeCount: state.totalLifetimeCount + 1,
          }));
        }
      },

      reset: () => set({ count: 0, isActive: false }),

      setMantraName: (name) => set({ mantraName: name }),

      setActive: (active) => set({ isActive: active }),

      completeSession: () => set(state => ({
        totalSessions: state.totalSessions + 1,
        currentStreak: state.currentStreak + 1, // Basic streak implementation
        count: 0,
        isActive: false,
      })),
    }),
    {
      name: 'japamala-storage', // unique name
      storage: createJSONStorage(() => AsyncStorage),
      // Don't persist active session states if they close the app
      partialize: (state) => ({ 
        totalSessions: state.totalSessions,
        totalLifetimeCount: state.totalLifetimeCount,
        currentStreak: state.currentStreak,
        mantraName: state.mantraName,
      }),
    }
  )
);
