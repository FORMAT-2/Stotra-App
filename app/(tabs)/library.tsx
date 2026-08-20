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
  Modal,
  TextInput,
} from 'react-native';
import { Heart, Download, Play, ListMusic, Plus, X } from 'lucide-react-native';
import { useSacredTheme } from '../../contexts/ThemeContext';
import { Spacing, BorderRadius, Fonts } from '../../constants/Theme';
import { useDataStore } from '../../store/dataStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useDownloadStore } from '../../store/downloadStore';
import { usePlaylistStore } from '../../store/playlistStore';
import { usePlayerStore } from '../../store/playerStore';
import { getStotraImageSource } from '../../data/mockData';
import { useRouter } from 'expo-router';
import { audioService } from '../../services/AudioService';
import { useTranslation } from '../../locales';
import { AddToPlaylistModal } from '../../components/AddToPlaylistModal';
import { MoreVertical } from 'lucide-react-native';
import type { Stotra } from '../../data/types';

export default function LibraryScreen() {
  const { theme } = useSacredTheme();
  const { stotras, fetchData } = useDataStore();
  const { favoriteIds } = useFavoritesStore();
  const { downloadedStotras } = useDownloadStore();
  const { playlists, fetchPlaylists } = usePlaylistStore();
  const router = useRouter();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'downloads' | 'playlists'>('playlists');
  
  // State for Create Playlist Modal
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  
  // State for Add to Playlist Modal
  const [selectedStotra, setSelectedStotra] = useState<Stotra | null>(null);
  
  const { createPlaylist } = usePlaylistStore();

  useEffect(() => {
    if (stotras.length === 0) {
      fetchData();
    }
    fetchPlaylists();
  }, [stotras.length, fetchData, fetchPlaylists]);

  const favoritesList = useMemo(() => {
    return stotras.filter(s => favoriteIds.includes(s.id));
  }, [stotras, favoriteIds]);

  const downloadsList = useMemo(() => {
    return stotras.filter(s => !!downloadedStotras[s.id]);
  }, [stotras, downloadedStotras]);

  // Create a virtual "Favorites" playlist object
  const favoritesPlaylist = useMemo(() => {
    const items = stotras
      .filter(s => favoriteIds.includes(s.id))
      .map((stotra, index) => ({
        id: `fav-item-${stotra.id}`,
        playlist_id: 'favorites',
        stotra_id: stotra.id,
        position: index,
        added_at: new Date().toISOString(),
        stotra,
      }));
      
    return {
      id: 'favorites',
      user_id: 'local',
      name: 'Favorites',
      description: 'Your favorite chants',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items,
    };
  }, [stotras, favoriteIds]);

  const currentList = downloadsList;

  const handlePlayPress = async (stotra: typeof stotras[0]) => {
    const isAlreadyShowing = usePlayerStore.getState().showMiniPlayer;
    if (!isAlreadyShowing) {
      router.push('/player');
    }
    
    const stotraIndex = currentList.findIndex(s => s.id === stotra.id);
    await usePlayerStore.getState().playQueue(currentList, Math.max(0, stotraIndex));
  };

  const handlePlayAll = async () => {
    if (activeTab === 'downloads' && currentList.length > 0) {
      const isAlreadyShowing = usePlayerStore.getState().showMiniPlayer;
      if (!isAlreadyShowing) {
        router.push('/player');
      }
      await usePlayerStore.getState().playQueue(currentList, 0);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    await createPlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setIsCreateModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: Fonts.serif }]}>
          {t('yourLibrary')}
        </Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <View style={[styles.tabSegment, { backgroundColor: theme.card }]}>
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
              {t('downloads')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'playlists' ? { backgroundColor: theme.accentBg } : null
            ]}
            onPress={() => setActiveTab('playlists')}
          >
            <ListMusic size={16} color={activeTab === 'playlists' ? theme.accentText : theme.textMuted} />
            <Text style={[
              styles.tabText,
              { color: activeTab === 'playlists' ? theme.accentText : theme.textMuted }
            ]}>
              Playlists
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'downloads' && (
          <TouchableOpacity 
            style={[styles.playAllBtn, { backgroundColor: theme.accentBg }]}
            onPress={handlePlayAll}
            activeOpacity={0.8}
          >
            <Play size={20} color={theme.accentText} fill={theme.accentText} style={{ marginLeft: 2 }} />
            <Text style={[styles.playAllText, { color: theme.accentText }]}>
              Play All Downloads
            </Text>
          </TouchableOpacity>
        )}

        {activeTab === 'playlists' && (
          <TouchableOpacity 
            style={[styles.createPlaylistBtn, { backgroundColor: theme.card, borderColor: theme.accent }]}
            onPress={() => setIsCreateModalVisible(true)}
            activeOpacity={0.7}
          >
            <Plus size={20} color={theme.accent} />
            <Text style={[styles.createPlaylistText, { color: theme.accent }]}>
              Create New Playlist
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.resultsList}>
          {activeTab === 'playlists' ? (
            <>
              {/* Virtual Favorites Playlist */}
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => router.push(`/playlist/favorites`)}
                style={[styles.resultCard, { backgroundColor: theme.card }]}
              >
                <View style={[styles.imageWrapper, { backgroundColor: '#FF4B4B', justifyContent: 'center', alignItems: 'center' }]}>
                  <Heart size={32} color="#FFF" fill="#FFF" />
                </View>
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultTitle, { color: theme.text, fontFamily: Fonts.serif }]} numberOfLines={1}>
                    Favorites
                  </Text>
                  <Text style={[styles.resultSubtitle, { color: theme.textMuted }]} numberOfLines={1}>
                    {favoritesPlaylist.items?.length || 0} items
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Custom Playlists */}
              {playlists.map((playlist) => (
                <TouchableOpacity 
                  key={playlist.id}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/playlist/${playlist.id}`)}
                  style={[styles.resultCard, { backgroundColor: theme.card }]}
                >
                  <View style={[styles.imageWrapper, { backgroundColor: theme.border, justifyContent: 'center', alignItems: 'center' }]}>
                    <ListMusic size={32} color={theme.text} />
                  </View>
                  <View style={styles.resultInfo}>
                    <Text style={[styles.resultTitle, { color: theme.text, fontFamily: Fonts.serif }]} numberOfLines={1}>
                      {playlist.name}
                    </Text>
                    <Text style={[styles.resultSubtitle, { color: theme.textMuted }]} numberOfLines={1}>
                      {playlist.items?.length || 0} items
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          ) : currentList.length > 0 ? (
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
                <TouchableOpacity 
                  style={{ padding: Spacing.sm }}
                  onPress={() => setSelectedStotra(stotra)}
                >
                  <MoreVertical size={20} color={theme.textMuted} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noResults}>
                <Text style={{ color: theme.textMuted, fontSize: 15, textAlign: 'center' }}>
                  You haven't downloaded any chants yet.
                </Text>
              </View>
          )}
        </View>
      </ScrollView>

      {/* Create Playlist Modal */}
      <Modal
        visible={isCreateModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>New Playlist</Text>
              <TouchableOpacity onPress={() => setIsCreateModalVisible(false)}>
                <X size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={[styles.modalInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="Playlist name"
              placeholderTextColor={theme.textMuted}
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: theme.background }]}
                onPress={() => setIsCreateModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: theme.accentBg, opacity: newPlaylistName.trim() ? 1 : 0.5 }]}
                onPress={handleCreatePlaylist}
                disabled={!newPlaylistName.trim()}
              >
                <Text style={[styles.modalBtnText, { color: theme.accentText }]}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AddToPlaylistModal
        visible={!!selectedStotra}
        onClose={() => setSelectedStotra(null)}
        stotra={selectedStotra}
      />
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
  createPlaylistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: BorderRadius.xl,
    gap: 8,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  createPlaylistText: {
    fontSize: 15,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    width: '100%',
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: 16,
    marginBottom: Spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
