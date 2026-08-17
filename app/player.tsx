// ============================================================
// Full-Screen Player — Sacred Audio Player with Karaoke Lyrics
// ============================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSacredTheme } from '../contexts/ThemeContext';
import { SacredColors, Spacing, BorderRadius, FontSizes } from '../constants/Theme';
import { usePlayerStore } from '../store/playerStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { audioService } from '../services/AudioService';
import { formatDuration, DEITY_ICONS } from '../data/mockData';
import type { LoopMode, PlaybackSpeed, ScriptMode } from '../data/types';
import Slider from '@react-native-community/slider';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const LOOP_OPTIONS: LoopMode[] = ['1x', '3x', '11x', '21x', '108x', 'infinite'];
const SPEED_OPTIONS: PlaybackSpeed[] = [0.75, 1.0, 1.25, 1.5];
const SCRIPT_OPTIONS: { key: ScriptMode; label: string; labelShort: string }[] = [
  { key: 'devanagari', label: 'Devanagari', labelShort: 'देव' },
  { key: 'iast', label: 'IAST', labelShort: 'IAST' },
  { key: 'meaning', label: 'Meaning', labelShort: 'Eng' },
];

export default function PlayerScreen() {
  const { theme, isDark } = useSacredTheme();
  const router = useRouter();

  const {
    currentStotra,
    currentVerses,
    activeVerseIndex,
    isPlaying,
    positionMs,
    durationMs,
    loopMode,
    playbackSpeed,
    scriptMode,
    setPlaybackSpeed,
    setScriptMode,
    setLoopMode,
  } = usePlayerStore();

  const { favoriteIds, toggleFavorite } = useFavoritesStore();
  const [showSleepTimer, setShowSleepTimer] = useState(false);

  if (!currentStotra) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          No stotra selected
        </Text>
      </View>
    );
  }

  const isFavorite = favoriteIds.includes(currentStotra.id);

  const deityEmoji = currentStotra.deity ? DEITY_ICONS[currentStotra.deity.slug] || '🪔' : '🪔';
  const accentColor = currentStotra.deity?.accent_color || SacredColors.gold[500];
  const progress = durationMs > 0 ? positionMs / durationMs : 0;
  const totalDuration = currentStotra.duration_seconds;

  const displayPosition = Math.floor(positionMs / 1000);
  const displayDuration = Math.floor(durationMs > 0 ? durationMs / 1000 : totalDuration);

  const cycleLoop = () => {
    const currentIdx = LOOP_OPTIONS.indexOf(loopMode);
    const nextIdx = (currentIdx + 1) % LOOP_OPTIONS.length;
    setLoopMode(LOOP_OPTIONS[nextIdx]);
  };

  const cycleSpeed = () => {
    const currentIdx = SPEED_OPTIONS.indexOf(playbackSpeed);
    const nextIdx = (currentIdx + 1) % SPEED_OPTIONS.length;
    const newSpeed = SPEED_OPTIONS[nextIdx];
    setPlaybackSpeed(newSpeed);
    audioService.setRate(newSpeed);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioService.pause();
    } else {
      audioService.play();
    }
  };

  const getVerseDisplay = (verse: typeof currentVerses[0], isActive: boolean) => {
    switch (scriptMode) {
      case 'devanagari':
        return (
          <View style={styles.verseContent}>
            <Text style={[
              styles.verseSanskrit,
              {
                color: isActive ? accentColor : theme.textSecondary,
                fontSize: isActive ? 22 : 18,
                fontWeight: isActive ? '700' : '400',
              },
            ]}>
              {verse.sanskrit_text}
            </Text>
          </View>
        );
      case 'iast':
        return (
          <View style={styles.verseContent}>
            <Text style={[
              styles.verseIAST,
              {
                color: isActive ? accentColor : theme.textSecondary,
                fontSize: isActive ? 19 : 16,
                fontWeight: isActive ? '600' : '400',
              },
            ]}>
              {verse.transliteration_iast}
            </Text>
          </View>
        );
      case 'meaning':
        return (
          <View style={styles.verseContent}>
            <Text style={[
              styles.verseSanskrit,
              {
                color: isActive ? accentColor : theme.textTertiary,
                fontSize: isActive ? 18 : 15,
                fontWeight: isActive ? '600' : '400',
              },
            ]}>
              {verse.sanskrit_text}
            </Text>
            <Text style={[
              styles.verseMeaning,
              {
                color: isActive ? theme.text : theme.textSecondary,
                fontSize: isActive ? 15 : 13,
                fontWeight: isActive ? '500' : '400',
              },
            ]}>
              {verse.meaning_english}
            </Text>
            {verse.meaning_hindi && (
              <Text style={[
                styles.verseMeaningHindi,
                {
                  color: isActive ? theme.textSecondary : theme.textTertiary,
                  fontSize: isActive ? 14 : 12,
                },
              ]}>
                {verse.meaning_hindi}
              </Text>
            )}
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Background gradient */}
      <LinearGradient
        colors={[`${accentColor}15`, `${accentColor}05`, theme.background]}
        style={styles.bgGradient}
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.topButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-down" size={28} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={[styles.topLabel, { color: theme.textTertiary }]}>NOW PLAYING</Text>
          <Text style={[styles.topCategory, { color: accentColor }]}>
            {currentStotra.category?.title_english || 'Stotra'}
          </Text>
        </View>
        <TouchableOpacity style={styles.topButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Cover Art */}
      <View style={styles.coverContainer}>
        <LinearGradient
          colors={[`${accentColor}30`, `${accentColor}10`]}
          style={[styles.coverArt, { borderColor: `${accentColor}25` }]}
        >
          <Text style={styles.coverEmoji}>{deityEmoji}</Text>
        </LinearGradient>
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={[styles.stotraTitle, { color: theme.text }]} numberOfLines={1}>
          {currentStotra.title_english}
        </Text>
        <Text style={[styles.stotraSanskrit, { color: accentColor }]} numberOfLines={1}>
          {currentStotra.title_sanskrit}
        </Text>
        <Text style={[styles.stotraDeity, { color: theme.textTertiary }]} numberOfLines={1}>
          {currentStotra.deity?.name_english} · {currentStotra.reciter_name}
        </Text>
      </View>

      {/* Script Mode Toggle */}
      <View style={styles.scriptToggleContainer}>
        {SCRIPT_OPTIONS.map((opt) => {
          const isActive = scriptMode === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => setScriptMode(opt.key)}
              style={[
                styles.scriptTab,
                {
                  backgroundColor: isActive ? `${accentColor}20` : 'transparent',
                  borderColor: isActive ? accentColor : theme.border,
                },
              ]}
            >
              <Text style={[
                styles.scriptTabText,
                { color: isActive ? accentColor : theme.textTertiary },
              ]}>
                {opt.labelShort}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Lyrics / Verses */}
      <ScrollView
        style={styles.lyricsScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.lyricsContent}
      >
        {currentVerses.length > 0 ? (
          currentVerses.map((verse, index) => {
            const isActive = index === activeVerseIndex;
            return (
              <TouchableOpacity
                key={verse.id}
                activeOpacity={0.7}
                onPress={() => {
                  // Tap to seek to this verse
                  audioService.seekTo(verse.start_time_ms);
                  usePlayerStore.getState().setActiveVerseIndex(index);
                }}
                style={[
                  styles.verseRow,
                  {
                    backgroundColor: isActive ? `${accentColor}10` : 'transparent',
                    borderLeftColor: isActive ? accentColor : 'transparent',
                  },
                ]}
              >
                <Text style={[styles.verseNumber, { color: isActive ? accentColor : theme.textMuted }]}>
                  {verse.verse_number}
                </Text>
                {getVerseDisplay(verse, isActive)}
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.noVerses}>
            <Text style={styles.noVersesEmoji}>📜</Text>
            <Text style={[styles.noVersesText, { color: theme.textTertiary }]}>
              Synchronized verses not available yet
            </Text>
            <Text style={[styles.noVersesSub, { color: theme.textMuted }]}>
              Verses will be synced from the Admin Portal
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={0}
          maximumValue={durationMs > 0 ? durationMs : totalDuration * 1000}
          value={positionMs}
          minimumTrackTintColor={accentColor}
          maximumTrackTintColor={theme.surface}
          thumbTintColor={accentColor}
          onSlidingComplete={(value) => {
            audioService.seekTo(value);
          }}
        />
        <View style={styles.timeRow}>
          <Text style={[styles.timeText, { color: theme.textTertiary }]}>
            {formatDuration(displayPosition)}
          </Text>
          <Text style={[styles.timeText, { color: theme.textTertiary }]}>
            {formatDuration(displayDuration)}
          </Text>
        </View>
      </View>

      {/* Main Controls */}
      <View style={styles.controls}>
        {/* Loop */}
        <TouchableOpacity onPress={cycleLoop} style={styles.sideControl}>
          <Ionicons
            name="repeat"
            size={20}
            color={loopMode !== '1x' ? accentColor : theme.textTertiary}
          />
          <Text style={[styles.sideControlText, {
            color: loopMode !== '1x' ? accentColor : theme.textTertiary,
          }]}>
            {loopMode === 'infinite' ? '∞' : loopMode}
          </Text>
        </TouchableOpacity>

        {/* Previous */}
        <TouchableOpacity style={styles.navControl}>
          <Ionicons name="play-skip-back" size={28} color={theme.text} />
        </TouchableOpacity>

        {/* Play/Pause */}
        <TouchableOpacity
          onPress={handleTogglePlay}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[accentColor, SacredColors.saffron[600]]}
            style={styles.playButton}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={32}
              color="#FFF"
              style={isPlaying ? {} : { marginLeft: 3 }}
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* Next */}
        <TouchableOpacity style={styles.navControl}>
          <Ionicons name="play-skip-forward" size={28} color={theme.text} />
        </TouchableOpacity>

        {/* Speed */}
        <TouchableOpacity onPress={cycleSpeed} style={styles.sideControl}>
          <MaterialCommunityIcons name="speedometer" size={20} color={playbackSpeed !== 1.0 ? accentColor : theme.textTertiary} />
          <Text style={[styles.sideControlText, {
            color: playbackSpeed !== 1.0 ? accentColor : theme.textTertiary,
          }]}>
            {playbackSpeed}x
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.bottomAction} onPress={() => toggleFavorite(currentStotra.id)}>
          <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={22} color={isFavorite ? SacredColors.lotus[500] : theme.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomAction}>
          <Ionicons name="download-outline" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowSleepTimer(!showSleepTimer)}
          style={styles.bottomAction}
        >
          <Ionicons name="moon-outline" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomAction}>
          <Ionicons name="share-outline" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Sleep Timer Overlay */}
      {showSleepTimer && (
        <View style={[styles.sleepOverlay, { backgroundColor: `${theme.background}F5` }]}>
          <View style={[styles.sleepCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sleepTitle, { color: theme.text }]}>🌙 Sleep Timer</Text>
            {[15, 30, 45, 60].map((mins) => (
              <TouchableOpacity
                key={mins}
                onPress={() => {
                  usePlayerStore.getState().setSleepTimer(mins);
                  setShowSleepTimer(false);
                }}
                style={[styles.sleepOption, { borderColor: theme.border }]}
              >
                <Text style={[styles.sleepOptionText, { color: theme.text }]}>{mins} minutes</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => {
                usePlayerStore.getState().setSleepTimer(null);
                setShowSleepTimer(false);
              }}
              style={styles.sleepCancel}
            >
              <Text style={[styles.sleepCancelText, { color: theme.textTertiary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: FontSizes.lg,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  topButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topCenter: {
    alignItems: 'center',
    gap: 2,
  },
  topLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  topCategory: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },

  // Cover Art
  coverContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  coverArt: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverEmoji: {
    fontSize: 56,
  },

  // Title
  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing['3xl'],
    gap: 4,
  },
  stotraTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    textAlign: 'center',
  },
  stotraSanskrit: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  stotraDeity: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },

  // Script Toggle
  scriptToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  scriptTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  scriptTabText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },

  // Lyrics
  lyricsScroll: {
    flex: 1,
    marginHorizontal: Spacing.lg,
  },
  lyricsContent: {
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  verseRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    gap: Spacing.md,
  },
  verseNumber: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    width: 18,
    paddingTop: 3,
  },
  verseContent: {
    flex: 1,
    gap: 4,
  },
  verseSanskrit: {
    lineHeight: 28,
  },
  verseIAST: {
    lineHeight: 24,
    fontStyle: 'italic',
  },
  verseMeaning: {
    lineHeight: 20,
  },
  verseMeaningHindi: {
    lineHeight: 18,
  },
  noVerses: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
    gap: Spacing.sm,
  },
  noVersesEmoji: {
    fontSize: 40,
  },
  noVersesText: {
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  noVersesSub: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },

  // Progress
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'visible',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: -6,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  timeText: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
  },

  // Controls
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.xl,
  },
  sideControl: {
    alignItems: 'center',
    gap: 2,
    width: 44,
  },
  sideControlText: {
    fontSize: 9,
    fontWeight: '700',
  },
  navControl: {
    padding: Spacing.sm,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Bottom Actions
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing['3xl'],
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  bottomAction: {
    padding: Spacing.sm,
  },

  // Sleep Timer Overlay
  sleepOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['3xl'],
  },
  sleepCard: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  sleepTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  sleepOption: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  sleepOptionText: {
    fontSize: FontSizes.lg,
    fontWeight: '500',
  },
  sleepCancel: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  sleepCancelText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
