// ============================================================
// StotraCard — Individual stotra list/card item
// ============================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSacredTheme } from '../contexts/ThemeContext';
import { SacredColors, Spacing, BorderRadius, FontSizes } from '../constants/Theme';
import { DEITY_ICONS, formatDuration } from '../data/mockData';
import type { Stotra } from '../data/types';
import { ActivityIndicator } from 'react-native';
import { useDownloadStore } from '../store/downloadStore';
import { downloadService } from '../services/DownloadService';
import { useFavoritesStore } from '../store/favoritesStore';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'expo-router';

interface StotraCardProps {
  stotra: Stotra;
  onPress?: (stotra: Stotra) => void;
  variant?: 'list' | 'featured' | 'compact';
}

export default function StotraCard({ stotra, onPress, variant = 'list' }: StotraCardProps) {
  const { theme } = useSacredTheme();
  const router = useRouter();
  const deityEmoji = stotra.deity ? DEITY_ICONS[stotra.deity.slug] || '🙏' : '🙏';
  const accentColor = stotra.deity?.accent_color || SacredColors.gold[500];

  const downloaded = useDownloadStore(state => !!state.downloadedStotras[stotra.id]);
  const progress = useDownloadStore(state => state.downloading[stotra.id]);
  const isDownloading = progress !== undefined;

  const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);
  const isFavorite = useFavoritesStore(state => state.favoriteIds.includes(stotra.id));
  const { user, subscriptionStatus } = useAuthStore();

  const handleDownloadPress = () => {
    // TEMPORARILY DISABLED PAYWALL FOR TESTING
    // if (subscriptionStatus !== 'active') {
    //   router.push('/paywall');
    //   return;
    // }
    if (downloaded) {
      downloadService.removeDownloadedStotra(stotra.id);
    } else if (isDownloading) {
      downloadService.cancelDownload(stotra.id);
    } else {
      downloadService.downloadStotra(stotra.id, stotra.audio_url);
    }
  };

  const handleFavoritePress = async () => {
    await toggleFavorite(stotra.id);
  };

  const handlePlayPress = () => {
    // TEMPORARILY DISABLED PAYWALL FOR TESTING
    // if (subscriptionStatus !== 'active') {
    //   router.push('/paywall');
    //   return;
    // }
    onPress?.(stotra);
  };

  if (variant === 'featured') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePlayPress}
        style={styles.featuredContainer}
      >
        <LinearGradient
          colors={[`${accentColor}20`, `${accentColor}08`, theme.card]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.featuredCard, { borderColor: `${accentColor}30` }]}
        >
          <View style={styles.featuredHeader}>
            <View style={[styles.featuredCover, { backgroundColor: `${accentColor}25` }]}>
              <Text style={styles.featuredEmoji}>{deityEmoji}</Text>
            </View>
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={10} color={SacredColors.gold[500]} />
              <Text style={[styles.badgeText, { color: SacredColors.gold[500] }]}>Featured</Text>
            </View>
          </View>

          <Text style={[styles.featuredTitle, { color: theme.text }]} numberOfLines={2}>
            {stotra.title_english}
          </Text>
          <Text style={[styles.featuredSanskrit, { color: accentColor }]} numberOfLines={1}>
            {stotra.title_sanskrit}
          </Text>

          <View style={styles.featuredMeta}>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={12} color={theme.textTertiary} />
              <Text style={[styles.metaText, { color: theme.textTertiary }]}>
                {formatDuration(stotra.duration_seconds)}
              </Text>
            </View>
            {stotra.category && (
              <View style={[styles.categoryBadge, { backgroundColor: `${accentColor}15` }]}>
                <Text style={[styles.categoryText, { color: accentColor }]}>
                  {stotra.category.title_english}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePlayPress}
        style={[styles.compactCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      >
        <View style={[styles.compactCover, { backgroundColor: `${accentColor}20` }]}>
          <Text style={styles.compactEmoji}>{deityEmoji}</Text>
        </View>
        <View style={styles.compactInfo}>
          <Text style={[styles.compactTitle, { color: theme.text }]} numberOfLines={1}>
            {stotra.title_english}
          </Text>
          <Text style={[styles.compactSub, { color: theme.textTertiary }]} numberOfLines={1}>
            {formatDuration(stotra.duration_seconds)}
          </Text>
        </View>
        <TouchableOpacity onPress={handleDownloadPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ marginRight: 8 }}>
          {isDownloading ? (
            <ActivityIndicator size="small" color={accentColor} />
          ) : (
            <Ionicons
              name={downloaded ? 'checkmark-circle' : 'cloud-download-outline'}
              size={24}
              color={downloaded ? SacredColors.gold[500] : theme.textTertiary}
            />
          )}
        </TouchableOpacity>
        <Ionicons name="play-circle" size={28} color={accentColor} />
      </TouchableOpacity>
    );
  }

  // Default 'list' variant
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePlayPress}
      style={[styles.listCard, { backgroundColor: theme.card, borderColor: theme.border }]}
    >
      {/* Cover art */}
      <View style={[styles.listCover, { backgroundColor: `${accentColor}20` }]}>
        <Text style={styles.listEmoji}>{deityEmoji}</Text>
      </View>

      {/* Info */}
      <View style={styles.listInfo}>
        <Text style={[styles.listTitle, { color: theme.text }]} numberOfLines={1}>
          {stotra.title_english}
        </Text>
        <Text style={[styles.listSanskrit, { color: theme.textSecondary }]} numberOfLines={1}>
          {stotra.title_sanskrit}
        </Text>
        <View style={styles.listMeta}>
          <Ionicons name="time-outline" size={11} color={theme.textTertiary} />
          <Text style={[styles.listMetaText, { color: theme.textTertiary }]}>
            {formatDuration(stotra.duration_seconds)}
          </Text>
          {stotra.deity && (
            <>
              <Text style={[styles.listDot, { color: theme.textMuted }]}>·</Text>
              <Text style={[styles.listMetaText, { color: theme.textTertiary }]}>
                {stotra.deity.name_english}
              </Text>
            </>
          )}
          {stotra.category && (
            <>
              <Text style={[styles.listDot, { color: theme.textMuted }]}>·</Text>
              <Text style={[styles.listMetaText, { color: theme.textTertiary }]}>
                {stotra.category.title_english}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
        <TouchableOpacity onPress={handleFavoritePress} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? SacredColors.lotus[500] : theme.textTertiary}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDownloadPress} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          {isDownloading ? (
            <ActivityIndicator size="small" color={accentColor} />
          ) : (
            <Ionicons
              name={downloaded ? 'checkmark-circle' : 'cloud-download-outline'}
              size={24}
              color={downloaded ? SacredColors.gold[500] : theme.textTertiary}
            />
          )}
        </TouchableOpacity>

        {/* Play button */}
        <TouchableOpacity
          onPress={handlePlayPress}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="play-circle" size={36} color={accentColor} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Featured variant
  featuredContainer: {
    width: 200,
  },
  featuredCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  featuredCover: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredEmoji: {
    fontSize: 26,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  featuredTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    lineHeight: 20,
  },
  featuredSanskrit: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FontSizes.xs,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '600',
  },

  // Compact variant
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  compactCover: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactEmoji: {
    fontSize: 20,
  },
  compactInfo: {
    flex: 1,
    gap: 2,
  },
  compactTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  compactSub: {
    fontSize: FontSizes.xs,
  },

  // List variant
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  listCover: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listEmoji: {
    fontSize: 24,
  },
  listInfo: {
    flex: 1,
    gap: 2,
  },
  listTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  listSanskrit: {
    fontSize: FontSizes.sm,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  listMetaText: {
    fontSize: FontSizes.xs,
  },
  listDot: {
    fontSize: FontSizes.xs,
  },
});
