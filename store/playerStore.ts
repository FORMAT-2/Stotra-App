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

  setStotra: (stotra, verses = []) => set({
    currentStotra: stotra,
    currentVerses: verses.sort((a, b) => a.verse_number - b.verse_number),
    activeVerseIndex: -1,
    positionMs: 0,
    isPlaying: false,
    showMiniPlayer: true,
    currentLoop: 0,
  }),

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
