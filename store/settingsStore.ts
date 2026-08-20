import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'english' | 'hindi' | 'sanskrit';
export type ScriptPreference = 'devanagari' | 'iast' | 'meaning' | 'all';
export type LoopMode = '1' | '11' | '108' | 'infinite';
export type PlaybackSpeed = 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 2.0;
export type SleepTimer = 0 | 15 | 30 | 45 | 60; // minutes, 0 = off

interface SettingsState {
  language: Language;
  scriptPreference: ScriptPreference;
  dailyTarget: number;
  remindersEnabled: boolean;
  offlineMode: boolean;
  defaultSleepTimer: SleepTimer;
  defaultPlaybackSpeed: PlaybackSpeed;
  defaultLoopMode: LoopMode;

  setLanguage: (lang: Language) => void;
  setScriptPreference: (pref: ScriptPreference) => void;
  setDailyTarget: (target: number) => void;
  setRemindersEnabled: (enabled: boolean) => void;
  setOfflineMode: (enabled: boolean) => void;
  setDefaultSleepTimer: (timer: SleepTimer) => void;
  setDefaultPlaybackSpeed: (speed: PlaybackSpeed) => void;
  setDefaultLoopMode: (mode: LoopMode) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      language: 'english',
      scriptPreference: 'devanagari',
      dailyTarget: 108,
      remindersEnabled: false,
      offlineMode: false,
      defaultSleepTimer: 30,
      defaultPlaybackSpeed: 1.0,
      defaultLoopMode: '1',

      setLanguage: (language) => set({ language }),
      setScriptPreference: (scriptPreference) => set({ scriptPreference }),
      setDailyTarget: (dailyTarget) => {
        set({ dailyTarget });
        // Update notification if enabled
        const state = get();
        if (state.remindersEnabled) {
          const { notificationService } = require('../services/NotificationService');
          notificationService.scheduleDailyReminder(dailyTarget);
        }
      },
      setRemindersEnabled: async (remindersEnabled) => {
        set({ remindersEnabled });
        const { notificationService } = require('../services/NotificationService');
        if (remindersEnabled) {
          const state = get();
          const success = await notificationService.scheduleDailyReminder(state.dailyTarget);
          if (!success) {
            set({ remindersEnabled: false }); // Revert if permission denied
          }
        } else {
          await notificationService.cancelReminders();
        }
      },
      setOfflineMode: (offlineMode) => set({ offlineMode }),
      setDefaultSleepTimer: (defaultSleepTimer) => set({ defaultSleepTimer }),
      setDefaultPlaybackSpeed: (defaultPlaybackSpeed) => set({ defaultPlaybackSpeed }),
      setDefaultLoopMode: (defaultLoopMode) => set({ defaultLoopMode }),
    }),
    {
      name: 'divine-settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
