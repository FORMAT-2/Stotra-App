// ============================================================
// Audio Service — Singleton managing expo-av playback
// ============================================================

import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { usePlayerStore } from '../store/playerStore';
import type { Stotra, StotraVerse } from '../data/types';

class AudioService {
  private sound: Audio.Sound | null = null;
  private isInitialized = false;
  private statusUpdateInterval: any = null;

  async init() {
    if (this.isInitialized) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false,
      });
      this.isInitialized = true;
      console.log('Audio Engine initialized');
    } catch (e) {
      console.error('Failed to init audio engine', e);
    }
  }

  async load(url: string, autoplay = true) {
    try {
      if (!this.isInitialized) await this.init();

      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      usePlayerStore.getState().setLoading(true);

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: autoplay },
        this.onPlaybackStatusUpdate
      );
      this.sound = sound;

      usePlayerStore.getState().setLoading(false);
    } catch (e) {
      console.error('Failed to load audio', e);
      usePlayerStore.getState().setLoading(false);
    }
  }

  async playStotra(stotra: Stotra, verses: StotraVerse[] = []) {
    const store = usePlayerStore.getState();
    store.setStotra(stotra, verses);
    store.setPlaying(true);
    
    // Check if we have a local downloaded version
    const { useDownloadStore } = require('../store/downloadStore');
    const localUri = useDownloadStore.getState().getLocalUri(stotra.id);
    
    const playUrl = localUri || stotra.audio_url;
    await this.load(playUrl, true);
  }

  async play() {
    if (this.sound) await this.sound.playAsync();
  }

  async pause() {
    if (this.sound) await this.sound.pauseAsync();
  }

  async seekTo(positionMs: number) {
    if (this.sound) await this.sound.setPositionAsync(positionMs);
  }

  async setRate(rate: number) {
    if (this.sound) await this.sound.setRateAsync(rate, true);
  }

  // Handle status updates from expo-av to sync with our UI store
  private onPlaybackStatusUpdate = (status: any) => {
    if (!status.isLoaded) {
      if (status.error) console.error(`Error loading audio: ${status.error}`);
      return;
    }

    const store = usePlayerStore.getState();

    // Update time and duration
    store.setPosition(status.positionMillis);
    if (status.durationMillis && store.durationMs !== status.durationMillis) {
      store.setDuration(status.durationMillis);
    }

    // Update playing state
    if (store.isPlaying !== status.isPlaying) {
      store.setPlaying(status.isPlaying);
    }

    // Update buffering
    if (store.isBuffering !== status.isBuffering) {
      store.setBuffering(status.isBuffering);
    }

    // Update karaoke verse based on time
    store.updateActiveVerse(status.positionMillis);

    // Handle loop/end
    if (status.didJustFinish) {
      this.handleTrackEnd();
    }
  };

  private async handleTrackEnd() {
    const store = usePlayerStore.getState();
    const nextLoop = store.currentLoop + 1;

    if (store.loopMode === 'infinite' || nextLoop < store.loopCount) {
      // Loop it
      store.setCurrentLoop(nextLoop);
      if (this.sound) await this.sound.replayAsync();
    } else {
      // End playback and move to next track if available
      store.setPlaying(false);
      store.setPosition(0);
      store.setCurrentLoop(0);
      this.playNext();
    }
  }

  async playNext() {
    const store = usePlayerStore.getState();
    if (!store.currentStotra) return;
    
    // Lazy require to avoid cycles
    const { useDataStore } = require('../store/dataStore');
    const { dataService } = require('./DataService');
    const stotras = useDataStore.getState().stotras;
    
    const currentIndex = stotras.findIndex((s: any) => s.id === store.currentStotra?.id);
    if (currentIndex >= 0 && currentIndex < stotras.length - 1) {
      const nextStotra = stotras[currentIndex + 1];
      const verses = await dataService.getVersesForStotra(nextStotra.id);
      this.playStotra(nextStotra, verses);
    }
  }

  async playPrevious() {
    const store = usePlayerStore.getState();
    if (!store.currentStotra) return;

    // If we're more than 3 seconds in, just restart current track
    if (store.positionMs > 3000) {
      this.seekTo(0);
      return;
    }
    
    const { useDataStore } = require('../store/dataStore');
    const { dataService } = require('./DataService');
    const stotras = useDataStore.getState().stotras;
    
    const currentIndex = stotras.findIndex((s: any) => s.id === store.currentStotra?.id);
    if (currentIndex > 0) {
      const prevStotra = stotras[currentIndex - 1];
      const verses = await dataService.getVersesForStotra(prevStotra.id);
      this.playStotra(prevStotra, verses);
    }
  }
}

export const audioService = new AudioService();
