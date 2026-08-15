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
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSacredTheme } from '../contexts/ThemeContext';
import { usePlayerStore } from '../store/playerStore';
import { SacredColors, BorderRadius, Spacing, FontSizes } from '../constants/Theme';
import { formatDuration } from '../data/mockData';

export default function MiniPlayer() {
  const { theme } = useSacredTheme();
  const router = useRouter();
  const {
    currentStotra,
    isPlaying,
    showMiniPlayer,
    togglePlay,
    positionMs,
    durationMs,
  } = usePlayerStore();

  if (!showMiniPlayer || !currentStotra) return null;

  const progress = durationMs > 0 ? positionMs / durationMs : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push('/player')}
      style={[styles.container, {
        backgroundColor: theme.miniPlayer,
        borderTopColor: theme.miniPlayerBorder,
        bottom: Platform.OS === 'ios' ? 88 : 65,
      }]}
    >
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <LinearGradient
          colors={[SacredColors.gold[500], SacredColors.saffron[600]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${progress * 100}%` }]}
        />
      </View>

      <View style={styles.content}>
        {/* Cover art placeholder */}
        <View style={[styles.coverArt, { backgroundColor: currentStotra.deity?.accent_color || SacredColors.gold[500] }]}>
          <Text style={styles.coverEmoji}>🪔</Text>
        </View>

        {/* Track info */}
        <View style={styles.info}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {currentStotra.title_english}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
            {currentStotra.title_sanskrit} · {currentStotra.deity?.name_english}
          </Text>
        </View>

        {/* Controls */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation?.();
            togglePlay();
          }}
          style={styles.playButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={24}
            color={SacredColors.gold[500]}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation?.();
            usePlayerStore.getState().reset();
          }}
          style={styles.closeButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="close" size={20} color={theme.textTertiary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    overflow: 'hidden',
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  coverArt: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverEmoji: {
    fontSize: 22,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: FontSizes.xs,
  },
  playButton: {
    padding: Spacing.xs,
  },
  closeButton: {
    padding: Spacing.xs,
  },
});
