// ============================================================
// Search Screen — Find Stotras & Deities
// ============================================================

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Image,
  Modal,
  Keyboard,
} from 'react-native';
import { Search as SearchIcon, X, Clock, Play, SlidersHorizontal } from 'lucide-react-native';
import { useSacredTheme } from '../../contexts/ThemeContext';
import { Spacing, BorderRadius, Fonts } from '../../constants/Theme';
import { useDataStore } from '../../store/dataStore';
import { getStotraImageSource } from '../../data/mockData';
import { useRouter, useFocusEffect } from 'expo-router';
import { audioService } from '../../services/AudioService';
import { useSearchStore } from '../../store/searchStore';
import { usePlayerStore } from '../../store/playerStore';
import { useTranslation } from '../../locales';

export default function SearchScreen() {
  const { theme } = useSacredTheme();
  const { stotras } = useDataStore();
  const router = useRouter();
  const { t } = useTranslation();

  const [query, setQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [tempSelectedLanguage, setTempSelectedLanguage] = useState<string | null>(null);
  
  const { recentSearches, addRecentSearch, clearRecentSearches } = useSearchStore();
  const inputRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeout);
    }, [])
  );

  const availableLanguages = useMemo(() => {
    const langs = stotras.map(s => s.language).filter(Boolean) as string[];
    return Array.from(new Set(langs));
  }, [stotras]);

  const filteredStotras = useMemo(() => {
    let result = stotras;
    
    if (selectedLanguage) {
      result = result.filter(s => s.language === selectedLanguage);
    }
    
    if (!query) return result.length === stotras.length ? [] : result;
    
    const q = query.toLowerCase();
    return result.filter(s => 
      s.title_english.toLowerCase().includes(q) || 
      s.title_sanskrit.toLowerCase().includes(q) ||
      (s.deity && s.deity.name_english.toLowerCase().includes(q))
    );
  }, [query, stotras, selectedLanguage]);

  const handlePlayPress = async (stotra: typeof stotras[0]) => {
    const isAlreadyShowing = usePlayerStore.getState().showMiniPlayer;
    if (!isAlreadyShowing) {
      router.push('/player');
    }
    
    const stotraIndex = filteredStotras.findIndex(s => s.id === stotra.id);
    await usePlayerStore.getState().playQueue(filteredStotras, Math.max(0, stotraIndex));
    
    // Add to recent
    addRecentSearch(stotra.title_english);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <SearchIcon size={20} color={theme.textMuted} />
            <TextInput
              ref={inputRef}
              style={[styles.searchInput, { color: theme.text }]}
              placeholder={t('searchPlaceholder')}
              placeholderTextColor={theme.textMuted}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => {
                if (query.trim()) {
                  addRecentSearch(query);
                }
              }}
              autoFocus={true}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={[styles.filterButton, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => {
              Keyboard.dismiss();
              setTempSelectedLanguage(selectedLanguage);
              setIsFilterVisible(true);
            }}
          >
            <SlidersHorizontal size={20} color={selectedLanguage ? theme.accent : theme.text} />
            {selectedLanguage && <View style={[styles.filterActiveDot, { backgroundColor: theme.accent }]} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {!query && !selectedLanguage ? (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: Fonts.serif }]}>{t('recentSearches')}</Text>
              <TouchableOpacity onPress={clearRecentSearches}>
                <Text style={[styles.clearText, { color: theme.accent }]}>{t('clearAll')}</Text>
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

      <Modal
        visible={isFilterVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setIsFilterVisible(false);
          inputRef.current?.focus();
        }}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => {
              setIsFilterVisible(false);
              inputRef.current?.focus();
            }} 
          />
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Filters</Text>
              <TouchableOpacity onPress={() => {
                setIsFilterVisible(false);
                inputRef.current?.focus();
              }}>
                <X size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={[styles.filterLabel, { color: theme.text }]}>Language</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    !tempSelectedLanguage && { backgroundColor: theme.accentBg, borderColor: theme.accent }
                  ]}
                  onPress={() => setTempSelectedLanguage(null)}
                >
                  <Text style={[
                    styles.filterChipText,
                    { color: !tempSelectedLanguage ? theme.accentText : theme.text }
                  ]}>
                    All Languages
                  </Text>
                </TouchableOpacity>
                {availableLanguages.map(lang => (
                  <TouchableOpacity
                    key={lang}
                    style={[
                      styles.filterChip,
                      tempSelectedLanguage === lang && { backgroundColor: theme.accentBg, borderColor: theme.accent }
                    ]}
                    onPress={() => setTempSelectedLanguage(lang)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      { color: tempSelectedLanguage === lang ? theme.accentText : theme.text }
                    ]}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: theme.border, borderWidth: 1 }]}
                onPress={() => {
                  setTempSelectedLanguage(null);
                }}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: theme.accent }]}
                onPress={() => {
                  setSelectedLanguage(tempSelectedLanguage);
                  setIsFilterVisible(false);
                  inputRef.current?.focus();
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary, { color: theme.background }]}>
                  Apply Filters
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: Spacing.sm,
  },
  headerTopRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderWidth: 1,
  },
  filterButton: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterActiveDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.2)',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
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
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius['3xl'],
    borderTopRightRadius: BorderRadius['3xl'],
    padding: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
    borderTopWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalBody: {
    marginBottom: Spacing['2xl'],
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonPrimary: {
    borderWidth: 0,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextPrimary: {
    fontWeight: '700',
  },
});
