// ============================================================
// Player Store — Zustand state management for audio playback
// ============================================================

import { create } from 'zustand';
import type { Stotra, StotraVerse, RepeatMode, PlaybackSpeed, ScriptMode } from '../data/types';

interface PlayerState {
  // Queue state
  queue: Stotra[];
  originalQueue: Stotra[]; // Keeps original order for un-shuffling
  queueIndex: number;
  
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
  repeatMode: RepeatMode;
  isShuffle: boolean;
  playbackSpeed: PlaybackSpeed;
  scriptMode: ScriptMode;

  // Sleep timer
  sleepTimerMinutes: number | null;
  sleepTimerEndTime: number | null;

  // Mini player visibility
  showMiniPlayer: boolean;

  // Actions
  playQueue: (list: Stotra[], startIndex: number) => Promise<void>;
  nextTrack: () => Promise<void>;
  prevTrack: () => Promise<void>;
  
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  
  setPlaying: (playing: boolean) => void;
  setPosition: (ms: number) => void;
  setDuration: (ms: number) => void;
  setLoading: (loading: boolean) => void;
  setBuffering: (buffering: boolean) => void;
  setPlaybackSpeed: (speed: PlaybackSpeed) => void;
  setScriptMode: (mode: ScriptMode) => void;
  setSleepTimer: (minutes: number | null) => void;
  setActiveVerseIndex: (index: number) => void;
  updateActiveVerse: (positionMs: number) => void;
  togglePlay: () => void;
  reset: () => void;
  
  // Internal helper
  _setCurrentTrack: () => Promise<void>;
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  originalQueue: [],
  queueIndex: -1,
  
  currentStotra: null,
  currentVerses: [],
  activeVerseIndex: -1,

  isPlaying: false,
  positionMs: 0,
  durationMs: 0,
  isLoading: false,
  isBuffering: false,

  repeatMode: 'off',
  isShuffle: false,
  playbackSpeed: 1.0,
  scriptMode: 'devanagari',

  sleepTimerMinutes: null,
  sleepTimerEndTime: null,

  showMiniPlayer: false,

  playQueue: async (list, startIndex) => {
    const { isShuffle } = get();
    
    // If empty list, do nothing
    if (!list || list.length === 0) return;

    let targetQueue = [...list];
    let targetIndex = startIndex;
    
    // Ensure startIndex is valid
    if (targetIndex < 0 || targetIndex >= targetQueue.length) {
      targetIndex = 0;
    }
    
    const targetStotra = targetQueue[targetIndex];

    if (isShuffle) {
      // Create a shuffled queue that starts with the selected track
      const others = targetQueue.filter((_, i) => i !== targetIndex);
      targetQueue = [targetStotra, ...shuffleArray(others)];
      targetIndex = 0;
    }

    set({
      originalQueue: list,
      queue: targetQueue,
      queueIndex: targetIndex,
      currentStotra: targetStotra,
      showMiniPlayer: true,
      positionMs: 0,
      activeVerseIndex: -1,
    });

    await get()._setCurrentTrack();
  },

  _setCurrentTrack: async () => {
    const { currentStotra, queueIndex } = get();
    if (!currentStotra) return;
    
    const { dataService } = require('../services/DataService');
    const verses = await dataService.getVersesForStotra(currentStotra.id);
    
    // Abort if track changed
    if (get().queueIndex !== queueIndex) return;
    
    set({
      currentVerses: verses.sort((a: any, b: any) => a.verse_number - b.verse_number),
      activeVerseIndex: -1,
      positionMs: 0,
      isPlaying: true,
    });
    
    // Check offline mode constraints
    const { useDownloadStore } = require('./downloadStore');
    const { useSettingsStore } = require('./settingsStore');
    
    const localUri = useDownloadStore.getState().getLocalUri(currentStotra.id);
    const isOfflineMode = useSettingsStore.getState().offlineMode;
    
    if (isOfflineMode && !localUri) {
      const { Alert } = require('react-native');
      Alert.alert(
        'Offline Mode Active',
        'This chant is not downloaded. Please disable offline mode in settings to stream it, or download it first.'
      );
      set({ isPlaying: false });
      return;
    }

    const playUrl = localUri || currentStotra.audio_url;
    const { audioService } = require('../services/AudioService');
    await audioService.load(playUrl, true);
  },

  nextTrack: async () => {
    const state = get();
    if (state.queue.length === 0) return;
    const { audioService } = require('../services/AudioService');

    // Repeat One logic: don't advance the index, just replay
    if (state.repeatMode === 'one') {
      await audioService.seekTo(0);
      await audioService.play();
      return;
    }

    let nextIndex = state.queueIndex + 1;
    let shouldAutoPlay = true;

    // End of queue logic
    if (nextIndex >= state.queue.length) {
      if (state.repeatMode === 'all') {
        nextIndex = 0; // Wrap around and play
      } else {
        nextIndex = 0; // Wrap around to the start
        shouldAutoPlay = false; // But do NOT play
      }
    }

    set({
      queueIndex: nextIndex,
      currentStotra: state.queue[nextIndex],
    });

    const { currentStotra } = get();
    if (!currentStotra) return;
    
    const { dataService } = require('../services/DataService');
    const verses = await dataService.getVersesForStotra(currentStotra.id);
    
    // If the user skipped to another track while we were fetching verses, abort
    if (get().queueIndex !== nextIndex) return;
    
    set({
      currentVerses: verses.sort((a: any, b: any) => a.verse_number - b.verse_number),
      activeVerseIndex: -1,
      positionMs: 0,
      isPlaying: shouldAutoPlay, // Only play if autoPlay is true
    });
    
    const { useDownloadStore } = require('./downloadStore');
    const { useSettingsStore } = require('./settingsStore');
    
    const localUri = useDownloadStore.getState().getLocalUri(currentStotra.id);
    const isOfflineMode = useSettingsStore.getState().offlineMode;
    
    if (isOfflineMode && !localUri) {
      const { Alert } = require('react-native');
      Alert.alert(
        'Offline Mode Active',
        'This chant is not downloaded.'
      );
      set({ isPlaying: false });
      return;
    }

    const playUrl = localUri || currentStotra.audio_url;
    await audioService.load(playUrl, shouldAutoPlay);
  },

  prevTrack: async () => {
    const state = get();
    if (state.queue.length === 0) return;
    const { audioService } = require('../services/AudioService');

    // If we're more than 3 seconds in, just restart current track
    if (state.positionMs > 3000) {
      audioService.seekTo(0);
      return;
    }

    let prevIndex = state.queueIndex - 1;

    if (prevIndex < 0) {
      if (state.repeatMode === 'all') {
        prevIndex = state.queue.length - 1; // Wrap around to end
      } else {
        audioService.seekTo(0);
        return; // Stick to start without reloading
      }
    }

    set({
      queueIndex: prevIndex,
      currentStotra: state.queue[prevIndex],
    });

    // Inline _setCurrentTrack logic with abort check
    const currentStotra = state.queue[prevIndex];
    if (!currentStotra) return;
    
    const { dataService } = require('../services/DataService');
    const verses = await dataService.getVersesForStotra(currentStotra.id);
    
    // If the user skipped to another track while we were fetching verses, abort
    if (get().queueIndex !== prevIndex) return;
    
    set({
      currentVerses: verses.sort((a: any, b: any) => a.verse_number - b.verse_number),
      activeVerseIndex: -1,
      positionMs: 0,
      isPlaying: true,
    });
    
    const { useDownloadStore } = require('./downloadStore');
    const { useSettingsStore } = require('./settingsStore');
    
    const localUri = useDownloadStore.getState().getLocalUri(currentStotra.id);
    const isOfflineMode = useSettingsStore.getState().offlineMode;
    
    if (isOfflineMode && !localUri) {
      const { Alert } = require('react-native');
      Alert.alert('Offline Mode Active', 'This chant is not downloaded.');
      set({ isPlaying: false });
      return;
    }

    const playUrl = localUri || currentStotra.audio_url;
    await audioService.load(playUrl, true);
  },

  toggleRepeat: () => {
    const current = get().repeatMode;
    let next: RepeatMode = 'off';
    if (current === 'off') next = 'all';
    else if (current === 'all') next = 'one';
    
    set({ repeatMode: next });
  },

  toggleShuffle: () => {
    const { isShuffle, originalQueue, currentStotra } = get();
    const nextShuffle = !isShuffle;
    
    if (nextShuffle) {
      // Turn Shuffle ON
      if (originalQueue.length > 0 && currentStotra) {
        const others = originalQueue.filter(s => s.id !== currentStotra.id);
        const shuffledQueue = [currentStotra, ...shuffleArray(others)];
        set({
          isShuffle: true,
          queue: shuffledQueue,
          queueIndex: 0,
        });
      } else {
        set({ isShuffle: true });
      }
    } else {
      // Turn Shuffle OFF
      if (originalQueue.length > 0 && currentStotra) {
        const originalIndex = originalQueue.findIndex(s => s.id === currentStotra.id);
        set({
          isShuffle: false,
          queue: [...originalQueue],
          queueIndex: Math.max(0, originalIndex),
        });
      } else {
        set({ isShuffle: false });
      }
    }
  },

  setPlaying: (playing) => set({ isPlaying: playing }),
  setPosition: (ms) => set({ positionMs: ms }),
  setDuration: (ms) => set({ durationMs: ms }),
  setLoading: (loading) => set({ isLoading: loading }),
  setBuffering: (buffering) => set({ isBuffering: buffering }),
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

  togglePlay: () => {
    const state = get();
    const { audioService } = require('../services/AudioService');
    if (state.isPlaying) {
      audioService.pause();
    } else {
      audioService.play();
    }
  },

  reset: () => set({
    queue: [],
    originalQueue: [],
    queueIndex: -1,
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
