// ============================================================
// Home Screen — Daily Darshan, Deity Carousel, Featured Stotras
// ============================================================

import React, { useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSacredTheme } from '../../contexts/ThemeContext';
import { SacredColors, Spacing, BorderRadius, FontSizes } from '../../constants/Theme';
import DeityCarousel from '../../components/DeityCarousel';
import StotraCard from '../../components/StotraCard';
import SectionHeader from '../../components/SectionHeader';
import { audioService } from '../../services/AudioService';
import {
  DEITY_ICONS,
  DAY_NAMES,
  getDailyDarshan,
  formatDuration,
} from '../../data/mockData';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';
import { useSearchStore } from '../../store/searchStore';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { theme, isDark } = useSacredTheme();
  
  const { deities, stotras, categories, isLoading, fetchData } = useDataStore();
  const { setSelectedDeity, setSelectedCategory, clearFilters } = useSearchStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [selectedDeity, setHomeSelectedDeity] = useState<string | null>(null);
  const [selectedCategory, setHomeSelectedCategory] = useState<string | null>(null);

  const homeFilteredStotras = useMemo(() => {
    let results = [...stotras];
    if (selectedDeity) {
      results = results.filter(s => s.deity?.slug === selectedDeity);
    }
    if (selectedCategory) {
      results = results.filter(s => s.category?.slug === selectedCategory);
    }
    return results;
  }, [stotras, selectedDeity, selectedCategory]);


  // If stotras exist, use them for the daily darshan. Otherwise use fallback mock getter.
  const dailyStotra = useMemo(() => (stotras.length > 0 ? stotras[0] : getDailyDarshan()), [stotras]);
  const featuredStotras = useMemo(() => stotras.filter(s => s.is_featured), [stotras]);
  const todayName = DAY_NAMES[new Date().getDay()];

  const { subscriptionStatus } = useAuthStore();
  const router = useRouter();

  const handleStotraPress = async (stotra: typeof stotras[0]) => {
    // TEMPORARILY DISABLED PAYWALL FOR TESTING
    // if (subscriptionStatus !== 'active') {
    //   router.push('/paywall');
    //   return;
    // }
    // We dynamically fetch verses when playing to avoid loading all text in memory up front
    const { dataService } = await import('../../services/DataService');
    const verses = await dataService.getVersesForStotra(stotra.id);
    audioService.playStotra(stotra, verses);
    router.push('/player');
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

        {isLoading && categories.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <>
            {/* Daily Darshan */}

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
                <TouchableOpacity onPress={() => handleStotraPress(dailyStotra)}>
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
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </>
        )}

        {/* Deity Carousel */}
        <SectionHeader 
          title="Deities" 
          subtitle="Browse by divine manifestation" 
          actionText={selectedDeity ? "Clear" : undefined} 
          onAction={() => {
            if (selectedDeity) {
              setHomeSelectedDeity(null);
            }
          }} 
        />
        <DeityCarousel 
          deities={deities} 
          selectedDeity={selectedDeity}
          onDeityPress={(deity) => {
            if (selectedDeity === deity.slug) {
              setHomeSelectedDeity(null);
            } else {
              setHomeSelectedDeity(deity.slug);
            }
          }} 
        />

        {/* Featured Stotras */}
        <SectionHeader 
          title="Featured" 
          icon="sparkles"
          subtitle="Most sacred hymns" 
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredScroll}
        >
          {featuredStotras.map((stotra, index) => (
            <StotraCard
              key={stotra.id || stotra.slug || `featured-${index}`}
              stotra={stotra}
              variant="featured"
              onPress={handleStotraPress}
            />
          ))}
        </ScrollView>

        {/* Content Type Chips */}
        <SectionHeader 
          title="Browse by Type" 
          subtitle="Mantras, Stotras, Aartis & more" 
          actionText={selectedCategory ? "Clear" : undefined}
          onAction={() => setHomeSelectedCategory(null)}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {categories.map((cat, index) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <TouchableOpacity
                key={cat.id || cat.slug || `cat-${index}`}
                style={[
                  styles.chip, 
                  { 
                    backgroundColor: isSelected ? theme.primary : theme.surface, 
                    borderColor: isSelected ? theme.primary : theme.border 
                  }
                ]}
                onPress={() => {
                  if (selectedCategory === cat.slug) {
                    setHomeSelectedCategory(null);
                  } else {
                    setHomeSelectedCategory(cat.slug);
                  }
                }}
              >
                <Text style={[styles.chipText, { color: isSelected ? '#FFF' : theme.text }]}>{cat.title_english}</Text>
                <Text style={[styles.chipHindi, { color: isSelected ? 'rgba(255,255,255,0.8)' : theme.textTertiary }]}>{cat.title_hindi}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* All Stotras */}
        <SectionHeader 
          title={selectedDeity || selectedCategory ? "Filtered Stotras" : "All Stotras"} 
          subtitle={selectedDeity || selectedCategory ? `${homeFilteredStotras.length} matches found` : `${stotras.length} sacred chants`} 
        />
        <View style={styles.listContainer}>
          {homeFilteredStotras.slice(0, selectedDeity || selectedCategory ? 20 : 5).map((stotra, index) => (
            <StotraCard
              key={stotra.id || stotra.slug || `list-${index}`}
              stotra={stotra}
              variant="list"
              onPress={handleStotraPress}
            />
          ))}
          
          {(selectedDeity || selectedCategory) && homeFilteredStotras.length === 0 && (
            <Text style={{ textAlign: 'center', color: theme.textSecondary, marginTop: 20 }}>
              No stotras found for this filter.
            </Text>
          )}
        </View>
          </>
        )}

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
