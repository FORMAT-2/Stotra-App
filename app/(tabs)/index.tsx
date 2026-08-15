// ============================================================
// Home Screen — Daily Darshan, Deity Carousel, Featured Stotras
// ============================================================

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSacredTheme } from '../../contexts/ThemeContext';
import { SacredColors, Spacing, BorderRadius, FontSizes } from '../../constants/Theme';
import DeityCarousel from '../../components/DeityCarousel';
import StotraCard from '../../components/StotraCard';
import SectionHeader from '../../components/SectionHeader';
import { usePlayerStore } from '../../store/playerStore';
import {
  MOCK_DEITIES,
  MOCK_STOTRAS,
  MOCK_CATEGORIES,
  MOCK_VERSES,
  DEITY_ICONS,
  DAY_NAMES,
  getDailyDarshan,
  formatDuration,
} from '../../data/mockData';

export default function HomeScreen() {
  const { theme, isDark } = useSacredTheme();
  const setStotra = usePlayerStore(s => s.setStotra);
  const setPlaying = usePlayerStore(s => s.setPlaying);

  const dailyStotra = useMemo(() => getDailyDarshan(), []);
  const featuredStotras = useMemo(() => MOCK_STOTRAS.filter(s => s.is_featured), []);
  const todayName = DAY_NAMES[new Date().getDay()];

  const handleStotraPress = (stotra: typeof MOCK_STOTRAS[0]) => {
    const verses = MOCK_VERSES.filter(v => v.stotra_id === stotra.id);
    setStotra(stotra, verses);
    setPlaying(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <LinearGradient
          colors={[theme.goldGradientStart, theme.goldGradientEnd, theme.background]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: theme.textTertiary }]}>
                🙏 Namaste
              </Text>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                Divine Stotra
              </Text>
            </View>
            <View style={[styles.notifBadge, { backgroundColor: theme.surface }]}>
              <Ionicons name="notifications-outline" size={22} color={theme.textSecondary} />
            </View>
          </View>
        </LinearGradient>

        {/* Daily Darshan */}
        {dailyStotra && (
          <>
            <SectionHeader
              title="🪔 Today's Darshan"
              subtitle={`${todayName} · ${dailyStotra.deity?.name_english || ''}`}
            />
            <View style={styles.dailyContainer}>
              <LinearGradient
                colors={[
                  `${dailyStotra.deity?.accent_color || SacredColors.gold[500]}18`,
                  `${dailyStotra.deity?.accent_color || SacredColors.gold[500]}06`,
                  theme.card,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.dailyCard, { borderColor: `${dailyStotra.deity?.accent_color}25` }]}
              >
                <View style={styles.dailyTop}>
                  <View style={[styles.dailyCover, { backgroundColor: `${dailyStotra.deity?.accent_color}20` }]}>
                    <Text style={styles.dailyEmoji}>
                      {DEITY_ICONS[dailyStotra.deity?.slug || ''] || '🪔'}
                    </Text>
                  </View>
                  <View style={styles.dailyInfo}>
                    <Text style={[styles.dailyTitle, { color: theme.text }]}>
                      {dailyStotra.title_english}
                    </Text>
                    <Text style={[styles.dailySanskrit, { color: dailyStotra.deity?.accent_color || SacredColors.gold[500] }]}>
                      {dailyStotra.title_sanskrit}
                    </Text>
                    <View style={styles.dailyMeta}>
                      <Ionicons name="time-outline" size={12} color={theme.textTertiary} />
                      <Text style={[styles.dailyMetaText, { color: theme.textTertiary }]}>
                        {formatDuration(dailyStotra.duration_seconds)}
                      </Text>
                      <Text style={[styles.dailyDot, { color: theme.textMuted }]}>·</Text>
                      <Text style={[styles.dailyMetaText, { color: theme.textTertiary }]}>
                        {dailyStotra.category?.title_english}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={[styles.dailySignificance, { color: theme.textSecondary }]} numberOfLines={2}>
                  {dailyStotra.significance_english}
                </Text>
                <LinearGradient
                  colors={[
                    dailyStotra.deity?.accent_color || SacredColors.gold[500],
                    SacredColors.saffron[600],
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.playNowButton}
                >
                  <Ionicons name="play" size={16} color="#FFF" />
                  <Text style={styles.playNowText}>Play Now</Text>
                </LinearGradient>
              </LinearGradient>
            </View>
          </>
        )}

        {/* Deity Carousel */}
        <SectionHeader title="Deities" subtitle="Browse by divine manifestation" actionText="See All" onAction={() => {}} />
        <DeityCarousel deities={MOCK_DEITIES} onDeityPress={() => {}} />

        {/* Featured Stotras */}
        <SectionHeader title="✨ Featured" subtitle="Most sacred hymns" actionText="See All" onAction={() => {}} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredScroll}
        >
          {featuredStotras.map((stotra) => (
            <StotraCard
              key={stotra.id}
              stotra={stotra}
              variant="featured"
              onPress={handleStotraPress}
            />
          ))}
        </ScrollView>

        {/* Content Type Chips */}
        <SectionHeader title="Browse by Type" subtitle="Mantras, Stotras, Aartis & more" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {MOCK_CATEGORIES.map((cat) => (
            <View
              key={cat.id}
              style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <Text style={[styles.chipText, { color: theme.text }]}>{cat.title_english}</Text>
              <Text style={[styles.chipHindi, { color: theme.textTertiary }]}>{cat.title_hindi}</Text>
            </View>
          ))}
        </ScrollView>

        {/* All Stotras */}
        <SectionHeader title="All Stotras" subtitle={`${MOCK_STOTRAS.length} sacred chants`} />
        <View style={styles.listContainer}>
          {MOCK_STOTRAS.map((stotra) => (
            <StotraCard
              key={stotra.id}
              stotra={stotra}
              variant="list"
              onPress={handleStotraPress}
            />
          ))}
        </View>

        {/* Bottom spacer for mini player */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  greeting: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: FontSizes['3xl'],
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  notifBadge: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Daily Darshan
  dailyContainer: {
    paddingHorizontal: Spacing.lg,
  },
  dailyCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  dailyTop: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  dailyCover: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dailyEmoji: {
    fontSize: 32,
  },
  dailyInfo: {
    flex: 1,
    gap: 2,
  },
  dailyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  dailySanskrit: {
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  dailyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dailyMetaText: {
    fontSize: FontSizes.xs,
  },
  dailyDot: {
    fontSize: FontSizes.xs,
  },
  dailySignificance: {
    fontSize: FontSizes.sm,
    lineHeight: 19,
  },
  playNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xs,
  },
  playNowText: {
    color: '#FFF',
    fontSize: FontSizes.md,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Featured scroll
  featuredScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },

  // Chips
  chipsScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
  },
  chipText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  chipHindi: {
    fontSize: 9,
    marginTop: 1,
  },

  // List
  listContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
});
