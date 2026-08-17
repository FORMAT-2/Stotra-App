import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'english' | 'hindi';
export type ScriptPreference = 'devanagari' | 'iast' | 'meaning' | 'all';
export type LoopMode = '1' | '11' | '108' | 'infinite';
export type PlaybackSpeed = 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 2.0;
export type SleepTimer = 0 | 15 | 30 | 45 | 60; // minutes, 0 = off

interface SettingsState {
  language: Language;
  scriptPreference: ScriptPreference;
  dailyTarget: number;
  remindersEnabled: boolean;
  defaultSleepTimer: SleepTimer;
  defaultPlaybackSpeed: PlaybackSpeed;
  defaultLoopMode: LoopMode;

  setLanguage: (lang: Language) => void;
  setScriptPreference: (pref: ScriptPreference) => void;
  setDailyTarget: (target: number) => void;
  setRemindersEnabled: (enabled: boolean) => void;
  setDefaultSleepTimer: (timer: SleepTimer) => void;
  setDefaultPlaybackSpeed: (speed: PlaybackSpeed) => void;
  setDefaultLoopMode: (mode: LoopMode) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'english',
      scriptPreference: 'devanagari',
      dailyTarget: 108,
      remindersEnabled: false,
      defaultSleepTimer: 30,
      defaultPlaybackSpeed: 1.0,
      defaultLoopMode: '1',

      setLanguage: (language) => set({ language }),
      setScriptPreference: (scriptPreference) => set({ scriptPreference }),
      setDailyTarget: (dailyTarget) => set({ dailyTarget }),
      setRemindersEnabled: (remindersEnabled) => set({ remindersEnabled }),
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
