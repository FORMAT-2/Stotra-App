// ============================================================
// Japamala Store — Zustand state for the 108-bead counter
// ============================================================

import { create } from 'zustand';

interface JapamalaState {
  count: number;
  targetCount: number;
  totalSessions: number;
  totalLifetimeCount: number;
  currentStreak: number;
  isActive: boolean;
  mantraName: string;

  increment: () => void;
  reset: () => void;
  setTarget: (target: number) => void;
  setMantraName: (name: string) => void;
  setActive: (active: boolean) => void;
  completeSession: () => void;
}

export const useJapamalaStore = create<JapamalaState>((set, get) => ({
  count: 0,
  targetCount: 108,
  totalSessions: 0,
  totalLifetimeCount: 0,
  currentStreak: 0,
  isActive: false,
  mantraName: 'Om Namah Shivaya',

  increment: () => {
    const { count, targetCount } = get();
    if (count < targetCount) {
      set(state => ({
        count: state.count + 1,
        totalLifetimeCount: state.totalLifetimeCount + 1,
      }));
    }
  },

  reset: () => set({ count: 0, isActive: false }),

  setTarget: (target) => set({ targetCount: target, count: 0 }),

  setMantraName: (name) => set({ mantraName: name }),

  setActive: (active) => set({ isActive: active }),

  completeSession: () => set(state => ({
    totalSessions: state.totalSessions + 1,
    currentStreak: state.currentStreak + 1,
    count: 0,
    isActive: false,
  })),
}));
