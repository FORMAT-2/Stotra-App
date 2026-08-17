// ============================================================
// Library Screen — Favorites, Downloads, Playlists, Recently Played
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSacredTheme } from '../../contexts/ThemeContext';
import { SacredColors, Spacing, BorderRadius, FontSizes } from '../../constants/Theme';
import StotraCard from '../../components/StotraCard';
import SectionHeader from '../../components/SectionHeader';
import { audioService } from '../../services/AudioService';
import { useDownloadStore } from '../../store/downloadStore';
import { useDataStore } from '../../store/dataStore';

import { useFavoritesStore } from '../../store/favoritesStore';

type LibraryTab = 'favorites' | 'downloads' | 'playlists' | 'recent';

export default function LibraryScreen() {
  const { theme } = useSacredTheme();
  const [activeTab, setActiveTab] = useState<LibraryTab>('favorites');

  const { downloadedStotras } = useDownloadStore();
  const { stotras } = useDataStore();
  const { favoriteIds } = useFavoritesStore();

  // Real favorites from store
  const favorites = stotras.filter(s => favoriteIds.includes(s.id));
  
  // Temporary mock logic for recent
  const recentlyPlayed = stotras.slice(2, 6);
  
  // Real downloads
  const downloads = stotras.filter(s => !!downloadedStotras[s.id]);

  const handleStotraPress = async (stotra: typeof stotras[0]) => {
    const { dataService } = await import('../../services/DataService');
    const verses = await dataService.getVersesForStotra(stotra.id);
    audioService.playStotra(stotra, verses);
  };

  const tabs: { key: LibraryTab; label: string; icon: string; count: number }[] = [
    { key: 'favorites', label: 'Favorites', icon: 'heart', count: favorites.length },
    { key: 'downloads', label: 'Downloads', icon: 'download', count: downloads.length },
    { key: 'playlists', label: 'Playlists', icon: 'list', count: 0 },
    { key: 'recent', label: 'Recent', icon: 'time', count: recentlyPlayed.length },
  ];

  const getContent = () => {
    switch (activeTab) {
      case 'favorites':
        return favorites.length > 0 ? (
          <View style={styles.listContainer}>
            {favorites.map(s => (
              <StotraCard key={s.id} stotra={s} variant="list" onPress={handleStotraPress} />
            ))}
          </View>
        ) : renderEmpty('heart-outline', 'No favorites yet', 'Tap the ❤️ on any stotra to save it here');

      case 'downloads':
        return downloads.length > 0 ? (
          <View style={styles.listContainer}>
            {downloads.map(s => (
              <StotraCard key={s.id} stotra={s} variant="list" onPress={handleStotraPress} />
            ))}
          </View>
        ) : renderEmpty('cloud-download-outline', 'No downloads', 'Download stotras for offline chanting');

      case 'playlists':
        return (
          <View style={styles.playlistsContainer}>
            {/* Create playlist button */}
            <TouchableOpacity
              style={[styles.createPlaylist, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <LinearGradient
                colors={[`${SacredColors.gold[500]}15`, `${SacredColors.gold[500]}05`]}
                style={styles.createPlaylistIcon}
              >
                <Ionicons name="add" size={28} color={SacredColors.gold[500]} />
              </LinearGradient>
              <View style={styles.createPlaylistInfo}>
                <Text style={[styles.createPlaylistTitle, { color: theme.text }]}>
                  Create New Playlist
                </Text>
                <Text style={[styles.createPlaylistSub, { color: theme.textTertiary }]}>
                  Organize your daily sadhana
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
            </TouchableOpacity>

            {/* Preset playlists */}
            {[
              { name: 'Morning Sandhya', icon: 'partly-sunny', count: 0 },
              { name: 'Evening Prayers', icon: 'moon', count: 0 },
              { name: 'Bedtime Mantras', icon: 'star', count: 0 },
            ].map((playlist, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.playlistItem, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={styles.playlistIconContainer}>
                  <Ionicons name={playlist.icon as any} size={24} color={SacredColors.gold[500]} />
                </View>
                <View style={styles.playlistInfo}>
                  <Text style={[styles.playlistName, { color: theme.text }]}>{playlist.name}</Text>
                  <Text style={[styles.playlistCount, { color: theme.textTertiary }]}>
                    {playlist.count} stotras · Tap to add
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'recent':
        return recentlyPlayed.length > 0 ? (
          <View style={styles.listContainer}>
            {recentlyPlayed.map(s => (
              <StotraCard key={s.id} stotra={s} variant="list" onPress={handleStotraPress} />
            ))}
          </View>
        ) : renderEmpty('time-outline', 'No recent plays', 'Your recently played stotras will appear here');
    }
  };

  const renderEmpty = (icon: string, title: string, subtitle: string) => (
    <View style={styles.emptyState}>
      <Ionicons name={icon as any} size={52} color={theme.textMuted} />
      <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>{title}</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>{subtitle}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Library</Text>
          <Text style={[styles.subtitle, { color: theme.textTertiary }]}>
            Your personal sacred collection
          </Text>
        </View>

        {/* Tab Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[
                  styles.tab,
                  {
                    backgroundColor: isActive ? SacredColors.gold[500] : theme.surface,
                    borderColor: isActive ? SacredColors.gold[500] : theme.border,
                  },
                ]}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={16}
                  color={isActive ? '#FFF' : theme.textSecondary}
                />
                <Text style={[
                  styles.tabText,
                  { color: isActive ? '#FFF' : theme.textSecondary },
                ]}>
                  {tab.label}
                </Text>
                {tab.count > 0 && (
                  <View style={[styles.tabBadge, {
                    backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : `${SacredColors.gold[500]}20`,
                  }]}>
                    <Text style={[styles.tabBadgeText, {
                      color: isActive ? '#FFF' : SacredColors.gold[500],
                    }]}>
                      {tab.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Content */}
        {getContent()}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
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
  tabsContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
    marginLeft: 2,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['6xl'],
    gap: Spacing.md,
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
  playlistsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  createPlaylist: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: Spacing.md,
  },
  createPlaylistIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createPlaylistInfo: {
    flex: 1,
    gap: 2,
  },
  createPlaylistTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  createPlaylistSub: {
    fontSize: FontSizes.xs,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  playlistIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(212,175,55,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistInfo: {
    flex: 1,
    gap: 2,
  },
  playlistName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  playlistCount: {
    fontSize: FontSizes.xs,
  },
});
