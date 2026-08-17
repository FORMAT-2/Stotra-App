// ============================================================
// Download Service — Handles file system operations
// ============================================================

import * as FileSystem from 'expo-file-system/legacy';
import { useDownloadStore } from '../store/downloadStore';

class DownloadService {
  private activeDownloads: Record<string, FileSystem.DownloadResumable> = {};

  async downloadStotra(stotraId: string, url: string) {
    if (!url) return;

    // Create a local path for the audio file
    const fileExtension = url.split('.').pop() || 'mp3';
    const localUri = `${FileSystem.documentDirectory}stotra_${stotraId}.${fileExtension}`;

    // Initialize progress in store
    useDownloadStore.getState().setDownloadProgress(stotraId, 1);

    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      localUri,
      {},
      (downloadProgress) => {
        const progress = (downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100;
        useDownloadStore.getState().setDownloadProgress(stotraId, progress);
      }
    );

    this.activeDownloads[stotraId] = downloadResumable;

    try {
      const result = await downloadResumable.downloadAsync();
      if (result && result.uri) {
        useDownloadStore.getState().markDownloaded(stotraId, result.uri);
      }
    } catch (e) {
      console.error(`Failed to download stotra ${stotraId}:`, e);
      useDownloadStore.getState().removeDownload(stotraId);
    } finally {
      delete this.activeDownloads[stotraId];
    }
  }

  async removeDownloadedStotra(stotraId: string) {
    const localUri = useDownloadStore.getState().getLocalUri(stotraId);
    if (localUri) {
      try {
        await FileSystem.deleteAsync(localUri, { idempotent: true });
        useDownloadStore.getState().removeDownload(stotraId);
      } catch (e) {
        console.error(`Failed to delete local stotra ${stotraId}:`, e);
      }
    }
  }

  cancelDownload(stotraId: string) {
    const download = this.activeDownloads[stotraId];
    if (download) {
      download.pauseAsync();
      useDownloadStore.getState().removeDownload(stotraId);
      delete this.activeDownloads[stotraId];
    }
  }
}

export const downloadService = new DownloadService();
