// ============================================================
// Player Screen — Cover-Flow Mode & Verses Mode
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  Image,
  Modal,
} from 'react-native';
import { ChevronDown, Play, Pause, SkipForward, SkipBack, Heart, Repeat, Repeat1, Shuffle, Share2, Plus, X, ListMusic } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';

import { useSacredTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius, Fonts } from '../constants/Theme';
import { usePlayerStore } from '../store/playerStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { audioService } from '../services/AudioService';
import { formatDuration, getStotraImageSource } from '../data/mockData';
import { AddToPlaylistModal } from '../components/AddToPlaylistModal';
import type { LoopMode } from '../data/types';
import { useTranslation } from '../locales';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LOOP_OPTIONS: LoopMode[] = ['1x', '3x', '11x', '21x', '108x', 'infinite'];

export default function PlayerScreen() {
  const { theme, isDark } = useSacredTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const {
    currentStotra,
    currentVerses,
    activeVerseIndex,
    isPlaying,
    positionMs,
    durationMs,
    repeatMode,
    isShuffle,
    toggleRepeat,
    toggleShuffle,
    nextTrack,
    prevTrack,
  } = usePlayerStore();

  const { favoriteIds } = useFavoritesStore();
  const [showVerses, setShowVerses] = useState(false);
  const [isPlaylistModalVisible, setIsPlaylistModalVisible] = useState(false);

  if (!currentStotra) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.textSecondary }}>{t('noStotraSelected')}</Text>
      </View>
    );
  }

  const isFavorite = favoriteIds.includes(currentStotra.id);
  const totalDuration = currentStotra.duration_seconds;
  const displayPosition = Math.floor(positionMs / 1000);
  const displayDuration = Math.floor(durationMs > 0 ? durationMs / 1000 : totalDuration);

  const handleTogglePlay = () => {
    usePlayerStore.getState().togglePlay();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={[styles.headerBtn, { backgroundColor: theme.card }]}
        >
          <ChevronDown size={24} color={theme.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerCenter}
          activeOpacity={0.7}
          onPress={() => setShowVerses(!showVerses)}
        >
          <Text style={[styles.headerLabel, { color: theme.accent }]}>
            {showVerses ? t('nowPlaying') : t('verses')}
          </Text>
          <Text style={[styles.headerSub, { color: theme.text }]}>{t('tapToToggle')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.headerBtn, { backgroundColor: theme.card }]}>
          <Share2 size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {!showVerses ? (
        <View style={styles.contentArea}>
          
          {/* Artwork Area */}
          <View style={styles.artworkContainer}>
            <View style={[styles.artworkWrapper, { shadowColor: theme.text }]}>
              <Image 
                source={getStotraImageSource(currentStotra)} 
                style={styles.artworkImage}
                resizeMethod="resize"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.4)']}
                style={styles.artworkGradient}
              />
            </View>
          </View>

          {/* Controls Area */}
          <View style={styles.controlsContainer}>
            
            <View style={styles.infoRow}>
              <View style={styles.infoText}>
                <Text style={[styles.titleText, { color: theme.text, fontFamily: Fonts.serif }]} numberOfLines={1}>
                  {currentStotra.title_english}
                </Text>
                <Text style={[styles.subtitleText, { color: theme.textMuted }]} numberOfLines={1}>
                  {currentStotra.deity?.name_english || 'Mantra'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsPlaylistModalVisible(true)}>
                <Heart size={28} color={isFavorite ? theme.accent : theme.textMuted} fill={isFavorite ? theme.accent : 'transparent'} />
              </TouchableOpacity>
            </View>

            {/* Slider */}
            <View style={styles.sliderContainer}>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0}
                maximumValue={durationMs > 0 ? durationMs : totalDuration * 1000}
                value={positionMs}
                minimumTrackTintColor={theme.accentBg}
                maximumTrackTintColor={theme.card}
                thumbTintColor={theme.accentBg}
                onSlidingComplete={(value) => {
                  audioService.seekTo(value);
                }}
              />
              <View style={styles.timeRow}>
                <Text style={[styles.timeText, { color: theme.textMuted }]}>{formatDuration(displayPosition)}</Text>
                <Text style={[styles.timeText, { color: theme.textMuted }]}>{formatDuration(displayDuration)}</Text>
              </View>
            </View>

            {/* Playback Buttons */}
            <View style={styles.playbackRow}>
              <TouchableOpacity onPress={toggleShuffle}>
                <Shuffle size={24} color={isShuffle ? theme.accent : theme.textMuted} />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={prevTrack}>
                <SkipBack size={32} color={theme.text} fill={theme.text} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={handleTogglePlay}
                style={[styles.playButtonBig, { backgroundColor: theme.accentBg, shadowColor: theme.accentBg }]}
              >
                {isPlaying ? (
                  <Pause size={32} color={theme.accentText} fill={theme.accentText} />
                ) : (
                  <Play size={32} color={theme.accentText} fill={theme.accentText} style={{ marginLeft: 4 }} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity onPress={nextTrack}>
                <SkipForward size={32} color={theme.text} fill={theme.text} />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={toggleRepeat}>
                {repeatMode === 'one' ? (
                  <Repeat1 size={24} color={theme.accent} />
                ) : (
                  <Repeat size={24} color={repeatMode === 'all' ? theme.accent : theme.textMuted} />
                )}
              </TouchableOpacity>
            </View>

          </View>
        </View>
      ) : (
        <View style={styles.contentArea}>
          
          {/* Verses Scroll */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.versesContent}
          >
            {currentVerses.length > 0 ? (
              currentVerses.map((verse, index) => {
                const isActive = index === activeVerseIndex;
                return (
                  <TouchableOpacity
                    key={verse.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      audioService.seekTo(verse.start_time_ms);
                      usePlayerStore.getState().setActiveVerseIndex(index);
                    }}
                    style={[
                      styles.verseRow,
                      isActive && { transform: [{ scale: 1.05 }] }
                    ]}
                  >
                    <Text style={[
                      styles.verseText,
                      { 
                        color: theme.text, 
                        fontFamily: Fonts.serif,
                        opacity: isActive ? 1 : 0.4,
                        fontSize: isActive ? 24 : 20,
                        fontWeight: isActive ? '700' : '500',
                      }
                    ]}>
                      {verse.transliteration_iast || verse.sanskrit_text}
                    </Text>
                    <Text style={[
                      styles.verseMeaning,
                      { 
                        color: isActive ? theme.accent : theme.textMuted,
                        opacity: isActive ? 1 : 0.4,
                        fontSize: isActive ? 16 : 14,
                      }
                    ]}>
                      {verse.meaning_english}
                    </Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.noVerses}>
                <Text style={{ color: theme.textMuted }}>{t('noVerses')}</Text>
              </View>
            )}
          </ScrollView>

          {/* Verses Mini Player */}
          <View style={[styles.versesMiniPlayer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
            <View style={{ flex: 1, marginRight: Spacing.lg }}>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0}
                maximumValue={durationMs > 0 ? durationMs : totalDuration * 1000}
                value={positionMs}
                minimumTrackTintColor={theme.accentBg}
                maximumTrackTintColor={theme.background}
                thumbTintColor={theme.accentBg}
                onSlidingComplete={(value) => {
                  audioService.seekTo(value);
                }}
              />
            </View>
            <TouchableOpacity 
              onPress={handleTogglePlay}
              style={[styles.playButtonSmall, { backgroundColor: theme.accentBg }]}
            >
              {isPlaying ? (
                <Pause size={20} color={theme.accentText} fill={theme.accentText} />
              ) : (
                <Play size={20} color={theme.accentText} fill={theme.accentText} style={{ marginLeft: 2 }} />
              )}
            </TouchableOpacity>
          </View>

        </View>
      )}

      <AddToPlaylistModal 
        visible={isPlaylistModalVisible} 
        onClose={() => setIsPlaylistModalVisible(false)} 
        stotra={currentStotra} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerSub: {
    fontSize: 13,
    fontWeight: '500',
  },
  contentArea: {
    flex: 1,
  },
  artworkContainer: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  artworkWrapper: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    maxWidth: 360,
    maxHeight: 360,
    borderRadius: BorderRadius['3xl'],
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  artworkImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  artworkGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  controlsContainer: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
    paddingTop: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.xl,
  },
  infoText: {
    flex: 1,
    paddingRight: Spacing.lg,
  },
  titleText: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 15,
  },
  sliderContainer: {
    marginBottom: Spacing.xl,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  playbackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  playButtonBig: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  loopBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  loopBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  versesContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.xl,
    paddingBottom: 140, // Space for mini player
  },
  verseRow: {
    marginBottom: Spacing['3xl'],
  },
  verseText: {
    marginBottom: Spacing.sm,
    lineHeight: 32,
  },
  verseMeaning: {
    fontWeight: '500',
    lineHeight: 22,
  },
  noVerses: {
    padding: Spacing['3xl'],
    alignItems: 'center',
  },
  versesMiniPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  playButtonSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
