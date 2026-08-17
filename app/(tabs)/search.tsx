// ============================================================
// Search Screen — Minimalist, YouTube Music style search
// ============================================================

import React, { useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  FlatList,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSacredTheme } from '../../contexts/ThemeContext';
import { SacredColors, Spacing, BorderRadius, FontSizes } from '../../constants/Theme';
import { audioService } from '../../services/AudioService';
import StotraCard from '../../components/StotraCard';
import SectionHeader from '../../components/SectionHeader';
import { useDataStore } from '../../store/dataStore';
import { useSearchStore } from '../../store/searchStore';

export default function SearchScreen() {
  const { theme } = useSacredTheme();
  const { stotras } = useDataStore();

  const {
    query,
    setQuery,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  } = useSearchStore();

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

    return results;
  }, [query, stotras]);

  const handleStotraPress = async (stotra: typeof stotras[0]) => {
    // Add to recent search history
    if (query.trim()) {
      addRecentSearch(query);
    } else {
      addRecentSearch(stotra.title_english);
    }

    const { dataService } = await import('../../services/DataService');
    const verses = await dataService.getVersesForStotra(stotra.id);
    audioService.playStotra(stotra, verses);
  };

  const handleSearchSubmit = () => {
    if (query.trim()) {
      addRecentSearch(query);
    }
  };

  const isSearching = query.trim().length > 0;

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search" size={20} color={theme.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search stotras, mantras, deities..."
          placeholderTextColor={theme.textTertiary}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCorrect={false}
          autoFocus={true}
          onSubmitEditing={handleSearchSubmit}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={theme.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderRecentSearches = () => {
    if (recentSearches.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={48} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.textSecondary, marginTop: Spacing.md }]}>
            Search for Stotras
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>
            Find your favorite chants, deities, or meanings
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.recentContainer}>
        <View style={styles.recentHeader}>
          <Text style={[styles.recentTitle, { color: theme.text }]}>Recent searches</Text>
          <TouchableOpacity onPress={clearRecentSearches}>
            <Text style={[styles.clearText, { color: theme.accent }]}>Clear all</Text>
          </TouchableOpacity>
        </View>

        {recentSearches.map((searchQuery, index) => (
          <TouchableOpacity
            key={`recent-${index}`}
            style={[styles.recentItem, { borderBottomColor: theme.border }]}
            onPress={() => setQuery(searchQuery)}
          >
            <Ionicons name="time-outline" size={20} color={theme.textSecondary} style={{ marginRight: Spacing.md }} />
            <Text style={[styles.recentText, { color: theme.text }]}>{searchQuery}</Text>
            <TouchableOpacity onPress={() => removeRecentSearch(searchQuery)} style={styles.removeRecent}>
              <Ionicons name="close" size={18} color={theme.textTertiary} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {renderHeader()}

      {!isSearching ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {renderRecentSearches()}
        </ScrollView>
      ) : (
        <FlatList
          data={filteredStotras}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: Spacing.lg }}>
              <StotraCard
                stotra={item}
                variant="list"
                onPress={handleStotraPress}
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.textSecondary, marginTop: Spacing.md }]}>
                No stotras found
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>
                Try a different search
              </Text>
            </View>
          }
          ListFooterComponent={<View style={{ height: 120 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
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
  scrollContent: {
    paddingBottom: 20,
    paddingTop: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['5xl'],
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
    maxWidth: 240,
  },
  recentContainer: {
    paddingHorizontal: Spacing.lg,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.xs,
  },
  recentTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  clearText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  recentText: {
    flex: 1,
    fontSize: FontSizes.md,
  },
  removeRecent: {
    padding: Spacing.xs,
  },
});
