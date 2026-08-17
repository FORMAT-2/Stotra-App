// ============================================================
// Player Store — Zustand state management for audio playback
// ============================================================

import { create } from 'zustand';
import type { Stotra, StotraVerse, LoopMode, PlaybackSpeed, ScriptMode } from '../data/types';

interface PlayerState {
  // Current track
  currentStotra: Stotra | null;
  currentVerses: StotraVerse[];
  activeVerseIndex: number;

  // Playback state
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  isLoading: boolean;
  isBuffering: boolean;

  // Settings
  loopMode: LoopMode;
  loopCount: number;
  currentLoop: number;
  playbackSpeed: PlaybackSpeed;
  scriptMode: ScriptMode;

  // Sleep timer
  sleepTimerMinutes: number | null;
  sleepTimerEndTime: number | null;

  // Mini player visibility
  showMiniPlayer: boolean;

  // Actions
  setStotra: (stotra: Stotra, verses?: StotraVerse[]) => void;
  setPlaying: (playing: boolean) => void;
  setPosition: (ms: number) => void;
  setDuration: (ms: number) => void;
  setLoading: (loading: boolean) => void;
  setBuffering: (buffering: boolean) => void;
  setLoopMode: (mode: LoopMode) => void;
  setPlaybackSpeed: (speed: PlaybackSpeed) => void;
  setScriptMode: (mode: ScriptMode) => void;
  setSleepTimer: (minutes: number | null) => void;
  setActiveVerseIndex: (index: number) => void;
  updateActiveVerse: (positionMs: number) => void;
  setCurrentLoop: (loop: number) => void;
  togglePlay: () => void;
  reset: () => void;
}

const LOOP_COUNTS: Record<LoopMode, number> = {
  '1x': 1,
  '3x': 3,
  '11x': 11,
  '21x': 21,
  '108x': 108,
  'infinite': Infinity,
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentStotra: null,
  currentVerses: [],
  activeVerseIndex: -1,

  isPlaying: false,
  positionMs: 0,
  durationMs: 0,
  isLoading: false,
  isBuffering: false,

  loopMode: '1x',
  loopCount: 1,
  currentLoop: 0,
  playbackSpeed: 1.0,
  scriptMode: 'devanagari',

  sleepTimerMinutes: null,
  sleepTimerEndTime: null,

  showMiniPlayer: false,

  setStotra: (stotra, verses = []) => {
    // Dynamically require to avoid circular dependencies if any
    const { useSettingsStore } = require('./settingsStore');
    const settings = useSettingsStore.getState();

    // The player's LoopMode type might differ slightly from the settings (e.g. '1x' vs '1')
    let mappedLoopMode: LoopMode = '1x';
    if (settings.defaultLoopMode === '1') mappedLoopMode = '1x';
    else if (settings.defaultLoopMode === '11') mappedLoopMode = '11x';
    else if (settings.defaultLoopMode === '108') mappedLoopMode = '108x';
    else if (settings.defaultLoopMode === 'infinite') mappedLoopMode = 'infinite';

    set({
      currentStotra: stotra,
      currentVerses: verses.sort((a, b) => a.verse_number - b.verse_number),
      activeVerseIndex: -1,
      positionMs: 0,
      isPlaying: false,
      showMiniPlayer: true,
      currentLoop: 0,
      
      // Apply defaults from Settings
      playbackSpeed: settings.defaultPlaybackSpeed,
      scriptMode: settings.scriptPreference === 'all' ? 'devanagari' : 
                  settings.scriptPreference === 'meaning' ? 'english' : 
                  settings.scriptPreference as any,
      loopMode: mappedLoopMode,
      loopCount: LOOP_COUNTS[mappedLoopMode],
      
      sleepTimerMinutes: settings.defaultSleepTimer === 0 ? null : settings.defaultSleepTimer,
      sleepTimerEndTime: settings.defaultSleepTimer === 0 ? null : Date.now() + settings.defaultSleepTimer * 60 * 1000,
    });
  },

  setPlaying: (playing) => set({ isPlaying: playing }),
  setPosition: (ms) => set({ positionMs: ms }),
  setDuration: (ms) => set({ durationMs: ms }),
  setLoading: (loading) => set({ isLoading: loading }),
  setBuffering: (buffering) => set({ isBuffering: buffering }),

  setLoopMode: (mode) => set({
    loopMode: mode,
    loopCount: LOOP_COUNTS[mode],
    currentLoop: 0,
  }),

  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setScriptMode: (mode) => set({ scriptMode: mode }),

  setSleepTimer: (minutes) => set({
    sleepTimerMinutes: minutes,
    sleepTimerEndTime: minutes ? Date.now() + minutes * 60 * 1000 : null,
  }),

  setActiveVerseIndex: (index) => set({ activeVerseIndex: index }),

  updateActiveVerse: (positionMs) => {
    const { currentVerses } = get();
    const index = currentVerses.findIndex(
      v => positionMs >= v.start_time_ms && positionMs < v.end_time_ms
    );
    if (index !== get().activeVerseIndex) {
      set({ activeVerseIndex: index });
    }
  },

  setCurrentLoop: (loop) => set({ currentLoop: loop }),

  togglePlay: () => set(state => ({ isPlaying: !state.isPlaying })),

  reset: () => set({
    currentStotra: null,
    currentVerses: [],
    activeVerseIndex: -1,
    isPlaying: false,
    positionMs: 0,
    durationMs: 0,
    isLoading: false,
    showMiniPlayer: false,
    sleepTimerMinutes: null,
    sleepTimerEndTime: null,
  }),
}));
