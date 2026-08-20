// ============================================================
// Audio Service — Singleton managing expo-av playback
// ============================================================

import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { Alert } from 'react-native';
import { usePlayerStore } from '../store/playerStore';
import type { Stotra, StotraVerse } from '../data/types';

class AudioService {
  private sound: Audio.Sound | null = null;
  private isInitialized = false;
  private statusUpdateInterval: any = null;
  private loadId = 0;

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
    const currentLoadId = ++this.loadId;
    
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
      
      // If another load was triggered while we were waiting, discard this one
      if (this.loadId !== currentLoadId) {
        await sound.unloadAsync();
        return;
      }

      this.sound = sound;

      usePlayerStore.getState().setLoading(false);
    } catch (e) {
      if (this.loadId === currentLoadId) {
        console.error('Failed to load audio', e);
        usePlayerStore.getState().setLoading(false);
      }
    }
  }

  // Removed playStotra. The store calls load() directly via _setCurrentTrack

  async play() {
    try {
      if (this.sound) {
        const status = await this.sound.getStatusAsync();
        if (status.isLoaded) await this.sound.playAsync();
      }
    } catch (e) {
      console.log('Play ignored:', e);
    }
  }

  async pause() {
    try {
      if (this.sound) {
        const status = await this.sound.getStatusAsync();
        if (status.isLoaded) await this.sound.pauseAsync();
      }
    } catch (e) {
      console.log('Pause ignored:', e);
    }
  }

  async seekTo(positionMs: number) {
    try {
      if (this.sound) {
        const status = await this.sound.getStatusAsync();
        if (status.isLoaded) await this.sound.setPositionAsync(positionMs);
      }
    } catch (e) {
      console.log('Seek ignored:', e);
    }
  }

  async setRate(rate: number) {
    try {
      if (this.sound) {
        const status = await this.sound.getStatusAsync();
        if (status.isLoaded) await this.sound.setRateAsync(rate, true);
      }
    } catch (e) {}
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
    await store.nextTrack();
  }
}

export const audioService = new AudioService();
