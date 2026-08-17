// ============================================================
// Search Screen — Real-time search with deity & duration filters
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSacredTheme } from '../../contexts/ThemeContext';
import { SacredColors, Spacing, BorderRadius, FontSizes } from '../../constants/Theme';
import { audioService } from '../../services/AudioService';
import DeityCarousel from '../../components/DeityCarousel';
import StotraCard from '../../components/StotraCard';
import SectionHeader from '../../components/SectionHeader';
import { usePlayerStore } from '../../store/playerStore';
import { useDataStore } from '../../store/dataStore';
import {
  formatDuration,
} from '../../data/mockData';
import { DURATION_FILTERS } from '../../data/types';

export default function SearchScreen() {
  const { theme } = useSacredTheme();
  const setPlaying = usePlayerStore(s => s.setPlaying);
  const { deities, stotras, categories } = useDataStore();

  const [query, setQuery] = useState('');
  const [selectedDeity, setSelectedDeity] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredStotras = useMemo(() => {
    let results = [...stotras];

    // Text search (case-insensitive, matches English, Sanskrit, Hindi, deity, category)
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      results = results.filter(s =>
        s.title_english.toLowerCase().includes(q) ||
        s.title_sanskrit.includes(q) ||
        (s.title_hindi && s.title_hindi.includes(q)) ||
        (s.deity?.name_english.toLowerCase().includes(q)) ||
        (s.deity?.name_sanskrit.includes(q)) ||
        (s.category?.title_english.toLowerCase().includes(q)) ||
        (s.significance_english?.toLowerCase().includes(q))
      );
    }

    // Deity filter
    if (selectedDeity) {
      results = results.filter(s => s.deity?.slug === selectedDeity);
    }

    // Duration filter
    if (selectedDuration !== null) {
      const filter = DURATION_FILTERS[selectedDuration];
      results = results.filter(s =>
        s.duration_seconds >= filter.min && s.duration_seconds < filter.max
      );
    }

    // Category filter
    if (selectedCategory) {
      results = results.filter(s => s.category?.slug === selectedCategory);
    }

    return results;
  }, [query, selectedDeity, selectedDuration, selectedCategory, stotras]);

  const handleStotraPress = async (stotra: typeof stotras[0]) => {
    const { dataService } = await import('../../services/DataService');
    const verses = await dataService.getVersesForStotra(stotra.id);
    audioService.playStotra(stotra, verses);
  };

  const clearFilters = () => {
    setSelectedDeity(null);
    setSelectedDuration(null);
    setSelectedCategory(null);
    setQuery('');
  };

  const hasFilters = selectedDeity || selectedDuration !== null || selectedCategory || query.trim();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Search</Text>
          <Text style={[styles.subtitle, { color: theme.textTertiary }]}>
            Find mantras, stotras, aartis & more
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="search" size={18} color={theme.textTertiary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder='Search "Hanuman Chalisa" or "हनुमान"...'
              placeholderTextColor={theme.textMuted}
              style={[styles.searchInput, { color: theme.text }]}
              returnKeyType="search"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color={theme.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Deity Filter */}
        <SectionHeader title="By Deity" />
        <DeityCarousel
          deities={deities}
          selectedDeity={selectedDeity}
          onDeityPress={(d) => setSelectedDeity(selectedDeity === d.slug ? null : d.slug)}
        />

        {/* Duration Filter */}
        <SectionHeader title="By Duration" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {DURATION_FILTERS.map((filter, index) => {
            const isActive = selectedDuration === index;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedDuration(isActive ? null : index)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? SacredColors.gold[500] : theme.surface,
                    borderColor: isActive ? SacredColors.gold[500] : theme.border,
                  },
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={13}
                  color={isActive ? '#FFF' : theme.textSecondary}
                />
                <Text style={[
                  styles.filterText,
                  { color: isActive ? '#FFF' : theme.textSecondary },
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Category Filter */}
        <SectionHeader title="By Type" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(isActive ? null : cat.slug)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? SacredColors.gold[500] : theme.surface,
                    borderColor: isActive ? SacredColors.gold[500] : theme.border,
                  },
                ]}
              >
                <Text style={[
                  styles.filterText,
                  { color: isActive ? '#FFF' : theme.textSecondary },
                ]}>
                  {cat.title_english}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Clear Filters */}
        {hasFilters && (
          <View style={styles.clearContainer}>
            <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
              <Ionicons name="close" size={14} color={SacredColors.gold[500]} />
              <Text style={[styles.clearText, { color: SacredColors.gold[500] }]}>
                Clear all filters
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Results */}
        <SectionHeader
          title="Results"
          subtitle={`${filteredStotras.length} stotra${filteredStotras.length !== 1 ? 's' : ''} found`}
        />
        <View style={styles.results}>
          {filteredStotras.length > 0 ? (
            filteredStotras.map((stotra) => (
              <StotraCard
                key={stotra.id}
                stotra={stotra}
                variant="list"
                onPress={handleStotraPress}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>
                No stotras found
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>
                Try a different search or adjust your filters
              </Text>
            </View>
          )}
        </View>

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
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes['3xl'],
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    padding: 0,
  },
  filterScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  clearContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  clearText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  results: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['5xl'],
    gap: Spacing.sm,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
});
