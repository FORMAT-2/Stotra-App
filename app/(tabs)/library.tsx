// ============================================================
// Library Screen — Favorites & Downloads
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { Heart, Download, Play } from 'lucide-react-native';
import { useSacredTheme } from '../../contexts/ThemeContext';
import { Spacing, BorderRadius, Fonts } from '../../constants/Theme';
import { useDataStore } from '../../store/dataStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useDownloadStore } from '../../store/downloadStore';
import { getStotraImageSource } from '../../data/mockData';
import { useRouter } from 'expo-router';
import { audioService } from '../../services/AudioService';

export default function LibraryScreen() {
  const { theme } = useSacredTheme();
  const { stotras, fetchData } = useDataStore();
  const { favoriteIds } = useFavoritesStore();
  const { downloadedStotras } = useDownloadStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'favorites' | 'downloads'>('favorites');

  useEffect(() => {
    if (stotras.length === 0) {
      fetchData();
    }
  }, [stotras.length, fetchData]);

  const favoritesList = useMemo(() => {
    return stotras.filter(s => favoriteIds.includes(s.id));
  }, [stotras, favoriteIds]);

  const downloadsList = useMemo(() => {
    return stotras.filter(s => !!downloadedStotras[s.id]);
  }, [stotras, downloadedStotras]);

  const currentList = activeTab === 'favorites' ? favoritesList : downloadsList;

  const handlePlayPress = async (stotra: typeof stotras[0]) => {
    const { dataService } = await import('../../services/DataService');
    const verses = await dataService.getVersesForStotra(stotra.id);
    audioService.playStotra(stotra, verses);
    router.push('/player');
  };

  const handlePlayAll = async () => {
    if (currentList.length === 0) return;
    // For now, just play the first one
    handlePlayPress(currentList[0]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: Fonts.serif }]}>
          Your Library
        </Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <View style={[styles.tabSegment, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'favorites' ? { backgroundColor: theme.accentBg } : null
            ]}
            onPress={() => setActiveTab('favorites')}
          >
            <Heart size={16} color={activeTab === 'favorites' ? theme.accentText : theme.textMuted} />
            <Text style={[
              styles.tabText,
              { color: activeTab === 'favorites' ? theme.accentText : theme.textMuted }
            ]}>
              Favorites
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'downloads' ? { backgroundColor: theme.accentBg } : null
            ]}
            onPress={() => setActiveTab('downloads')}
          >
            <Download size={16} color={activeTab === 'downloads' ? theme.accentText : theme.textMuted} />
            <Text style={[
              styles.tabText,
              { color: activeTab === 'downloads' ? theme.accentText : theme.textMuted }
            ]}>
              Downloads
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Play All Button */}
        <TouchableOpacity 
          style={[styles.playAllBtn, { backgroundColor: theme.accentBg }]}
          onPress={handlePlayAll}
          activeOpacity={0.8}
        >
          <Play size={20} color={theme.accentText} fill={theme.accentText} style={{ marginLeft: 2 }} />
          <Text style={[styles.playAllText, { color: theme.accentText }]}>
            Play All {activeTab === 'favorites' ? 'Favorites' : 'Downloads'}
          </Text>
        </TouchableOpacity>

        <View style={styles.resultsList}>
          {currentList.length > 0 ? (
            currentList.map((stotra) => (
              <TouchableOpacity 
                key={stotra.id}
                activeOpacity={0.7}
                onPress={() => handlePlayPress(stotra)}
                style={[styles.resultCard, { backgroundColor: theme.card }]}
              >
                <View style={styles.imageWrapper}>
                  <Image 
                    source={getStotraImageSource(stotra)} 
                    style={styles.resultImage} 
                  />
                  {activeTab === 'downloads' && (
                    <View style={styles.downloadBadge}>
                      <Download size={12} color="#FFF" />
                    </View>
                  )}
                </View>
                
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
              <Text style={{ color: theme.textMuted, fontSize: 15, textAlign: 'center' }}>
                {activeTab === 'favorites' 
                  ? "You haven't favorited any chants yet." 
                  : "You haven't downloaded any chants yet."}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '600',
  },
  tabContainer: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  tabSegment: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 120,
  },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: BorderRadius.xl,
    gap: 8,
    marginBottom: Spacing.xl,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  playAllText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resultsList: {
    gap: Spacing.md,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius['2xl'],
    gap: Spacing.md,
  },
  imageWrapper: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  resultImage: {
    width: 64,
    height: 64,
  },
  downloadBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 4,
    borderRadius: 12,
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
