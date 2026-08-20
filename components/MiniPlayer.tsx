// ============================================================
// MiniPlayer — Persistent bottom bar showing current track
// ============================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { Play, Pause, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSacredTheme } from '../contexts/ThemeContext';
import { usePlayerStore } from '../store/playerStore';
import { audioService } from '../services/AudioService';
import { BorderRadius, Spacing, Fonts } from '../constants/Theme';
import { getStotraImageSource } from '../data/mockData';

export default function MiniPlayer() {
  const { theme, isDark } = useSacredTheme();
  const router = useRouter();
  const {
    currentStotra,
    isPlaying,
    showMiniPlayer,
    positionMs,
    durationMs,
  } = usePlayerStore();

  if (!showMiniPlayer || !currentStotra) return null;

  const progress = durationMs > 0 ? positionMs / durationMs : 0;

  return (
    <View style={[styles.wrapper, { bottom: Platform.OS === 'ios' ? 88 : 65 }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push('/player')}
        style={[styles.container, {
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: theme.border,
          shadowColor: theme.text,
        }]}
      >
        <View style={styles.content}>
          
          <View style={styles.imageRing}>
            <Image 
              source={getStotraImageSource(currentStotra)} 
              style={styles.coverArt} 
            />
          </View>

          <View style={styles.info}>
            <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.serif }]} numberOfLines={1}>
              {currentStotra.title_english}
            </Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]} numberOfLines={1}>
              {currentStotra.deity?.name_english || 'Mantra'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              if (isPlaying) {
                audioService.pause();
              } else {
                audioService.play();
              }
            }}
            style={[styles.playButton, { backgroundColor: theme.accentBg }]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            {isPlaying ? (
               <Pause size={18} color={theme.accentText} fill={theme.accentText} />
            ) : (
               <Play size={18} color={theme.accentText} fill={theme.accentText} style={{ marginLeft: 2 }} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              audioService.pause();
              usePlayerStore.getState().reset();
            }}
            style={styles.closeButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={20} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: 'transparent' }]}>
          <View
            style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: theme.accentBg }]}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 10,
    marginBottom: Spacing.sm,
  },
  container: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  imageRing: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  coverArt: {
    width: 44,
    height: 44,
    resizeMode: 'cover',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: Spacing.xs,
  },
  progressTrack: {
    height: 2,
    width: '100%',
  },
  progressFill: {
    height: '100%',
  },
});
