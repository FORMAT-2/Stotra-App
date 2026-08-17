// ============================================================
// Download Store — Tracks downloaded stotras for offline playback
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DownloadState {
  downloadedStotras: Record<string, string>; // stotraId -> local file URI
  downloading: Record<string, number>; // stotraId -> progress (0-100)

  setDownloadProgress: (stotraId: string, progress: number) => void;
  markDownloaded: (stotraId: string, localUri: string) => void;
  removeDownload: (stotraId: string) => void;
  isDownloaded: (stotraId: string) => boolean;
  getLocalUri: (stotraId: string) => string | undefined;
}

export const useDownloadStore = create<DownloadState>()(
  persist(
    (set, get) => ({
      downloadedStotras: {},
      downloading: {},

      setDownloadProgress: (stotraId, progress) => {
        set((state) => ({
          downloading: {
            ...state.downloading,
            [stotraId]: progress,
          },
        }));
      },

      markDownloaded: (stotraId, localUri) => {
        set((state) => {
          const newDownloading = { ...state.downloading };
          delete newDownloading[stotraId];
          return {
            downloadedStotras: {
              ...state.downloadedStotras,
              [stotraId]: localUri,
            },
            downloading: newDownloading,
          };
        });
      },

      removeDownload: (stotraId) => {
        set((state) => {
          const newDownloaded = { ...state.downloadedStotras };
          delete newDownloaded[stotraId];
          const newDownloading = { ...state.downloading };
          delete newDownloading[stotraId];
          return {
            downloadedStotras: newDownloaded,
            downloading: newDownloading,
          };
        });
      },

      isDownloaded: (stotraId) => {
        return !!get().downloadedStotras[stotraId];
      },

      getLocalUri: (stotraId) => {
        return get().downloadedStotras[stotraId];
      },
    }),
    {
      name: 'stotra-downloads',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ downloadedStotras: state.downloadedStotras }),
    }
  )
);
