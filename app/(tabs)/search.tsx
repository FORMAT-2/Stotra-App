// ============================================================
// Search Screen — Find Stotras & Deities
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { Search as SearchIcon, X, Clock, Play } from 'lucide-react-native';
import { useSacredTheme } from '../../contexts/ThemeContext';
import { Spacing, BorderRadius, Fonts } from '../../constants/Theme';
import { useDataStore } from '../../store/dataStore';
import { getStotraImageSource } from '../../data/mockData';
import { useRouter } from 'expo-router';
import { audioService } from '../../services/AudioService';
import { useSearchStore } from '../../store/searchStore';

export default function SearchScreen() {
  const { theme } = useSacredTheme();
  const { stotras } = useDataStore();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const { recentSearches, addRecentSearch, clearRecentSearches } = useSearchStore();

  const filteredStotras = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return stotras.filter(s => 
      s.title_english.toLowerCase().includes(q) || 
      s.title_sanskrit.toLowerCase().includes(q) ||
      (s.deity && s.deity.name_english.toLowerCase().includes(q))
    );
  }, [query, stotras]);

  const handlePlayPress = async (stotra: typeof stotras[0]) => {
    const { dataService } = await import('../../services/DataService');
    const verses = await dataService.getVersesForStotra(stotra.id);
    audioService.playStotra(stotra, verses);
    router.push('/player');
    
    // Add to recent
    addRecentSearch(stotra.title_english);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <SearchIcon size={20} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search stotras, mantras, deities..."
            placeholderTextColor={theme.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => {
              if (query.trim()) {
                addRecentSearch(query);
              }
            }}
            autoFocus={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{top:10, bottom:10, left:10, right:10}}>
              <X size={20} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {!query ? (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: Fonts.serif }]}>Recent Searches</Text>
              <TouchableOpacity onPress={clearRecentSearches}>
                <Text style={[styles.clearText, { color: theme.accent }]}>Clear all</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.recentList}>
              {recentSearches.map(term => (
                <TouchableOpacity 
                  key={term} 
                  style={styles.recentItem}
                  onPress={() => setQuery(term)}
                >
                  <Clock size={20} color={theme.textMuted} />
                  <Text style={[styles.recentText, { color: theme.text }]}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.resultsList}>
            {filteredStotras.length > 0 ? (
              filteredStotras.map((stotra) => (
                <TouchableOpacity 
                  key={stotra.id}
                  activeOpacity={0.7}
                  onPress={() => handlePlayPress(stotra)}
                  style={[styles.resultCard, { backgroundColor: theme.card }]}
                >
                  <Image 
                    source={getStotraImageSource(stotra)} 
                    style={styles.resultImage} 
                  />
                  <View style={styles.resultInfo}>
                    <Text style={[styles.resultTitle, { color: theme.text, fontFamily: Fonts.serif }]} numberOfLines={1}>
                      {stotra.title_english}
                    </Text>
                    <Text style={[styles.resultSubtitle, { color: theme.textMuted }]} numberOfLines={1}>
                      {stotra.deity?.name_english || 'Mantra'}
                    </Text>
                  </View>
                  <View style={styles.resultDuration}>
                    <Text style={[styles.durationText, { color: theme.textMuted }]}>
                      {Math.floor(stotra.duration_seconds / 60)}:{(stotra.duration_seconds % 60).toString().padStart(2, '0')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noResults}>
                <Text style={{ color: theme.textMuted, fontSize: 16 }}>No results found for "{query}"</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 120,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
  },
  recentList: {
    gap: Spacing.lg,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  recentText: {
    fontSize: 16,
    fontWeight: '500',
  },
  resultsList: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius['2xl'],
    gap: Spacing.md,
  },
  resultImage: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.xl,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 12,
  },
  resultDuration: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  durationText: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  noResults: {
    paddingVertical: 40,
    alignItems: 'center',
  },
});
