import React, { useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Modal, TextInput, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSacredTheme } from '../../contexts/ThemeContext';
import { Spacing, BorderRadius, Fonts } from '../../constants/Theme';
import { usePlaylistStore } from '../../store/playlistStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useDataStore } from '../../store/dataStore';
import { usePlayerStore } from '../../store/playerStore';
import { ArrowLeft, Play, MoreVertical, Trash2, Edit3, Heart, X } from 'lucide-react-native';
import { getStotraImageSource } from '../../data/mockData';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HEADER_SCROLL_DISTANCE = 150; // Distance over which header fades

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useSacredTheme();
  const insets = useSafeAreaInsets();
  
  const { playlists, renamePlaylist, deletePlaylist, removeStotraFromPlaylist } = usePlaylistStore();
  const { favoriteIds, toggleFavorite } = useFavoritesStore();
  const { stotras } = useDataStore();

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  
  const scrollY = useRef(new Animated.Value(0)).current;

  const isFavorites = id === 'favorites';

  const playlist = useMemo(() => {
    if (isFavorites) {
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
        items,
      };
    }
    return playlists.find(p => p.id === id);
  }, [id, playlists, stotras, favoriteIds, isFavorites]);

  if (!playlist) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.text }}>Playlist not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: theme.accent }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handlePlayAll = async () => {
    if (!playlist.items || playlist.items.length === 0) return;
    const isAlreadyShowing = usePlayerStore.getState().showMiniPlayer;
    if (!isAlreadyShowing) {
      router.push('/player');
    }
    
    const items = playlist.items.map(i => i.stotra).filter(Boolean) as typeof stotras;
    await usePlayerStore.getState().playQueue(items, 0);
  };

  const handlePlayStotra = async (stotra: typeof stotras[0]) => {
    if (!playlist.items) return;
    const isAlreadyShowing = usePlayerStore.getState().showMiniPlayer;
    if (!isAlreadyShowing) {
      router.push('/player');
    }
    
    const items = playlist.items.map(i => i.stotra).filter(Boolean) as typeof stotras;
    const stotraIndex = items.findIndex(s => s.id === stotra.id);
    await usePlayerStore.getState().playQueue(items, Math.max(0, stotraIndex));
  };

  const handleDeletePlaylist = () => {
    Alert.alert('Delete Playlist', `Are you sure you want to delete "${playlist.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deletePlaylist(playlist.id);
        router.back();
      }}
    ]);
  };

  const handleRenameSubmit = async () => {
    if (newName.trim()) {
      await renamePlaylist(playlist.id, newName.trim());
    }
    setIsRenameModalVisible(false);
  };

  const handleRemoveStotra = (stotraId: string) => {
    if (isFavorites) {
      toggleFavorite(stotraId);
    } else {
      removeStotraFromPlaylist(playlist.id, stotraId);
    }
  };

  // Animations
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  
  const stickyTitleOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE - 40, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const stickyTitleTranslateX = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE - 40, HEADER_SCROLL_DISTANCE],
    outputRange: [20, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* Sticky Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top, backgroundColor: theme.background, zIndex: 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        
        <Animated.View style={{ flex: 1, opacity: stickyTitleOpacity, transform: [{ translateX: stickyTitleTranslateX }] }}>
          <Text style={[styles.stickyTitle, { color: theme.text, fontFamily: Fonts.serif }]} numberOfLines={1}>
            {playlist.name}
          </Text>
        </Animated.View>
        
        {!isFavorites ? (
          <TouchableOpacity onPress={() => setIsMenuVisible(!isMenuVisible)} style={styles.iconBtn}>
            <MoreVertical size={24} color={theme.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} /> // Placeholder for alignment
        )}
      </View>

      {/* Main Scroll Content */}
      <Animated.ScrollView 
        contentContainerStyle={{ paddingTop: 90 }} // Space for top bar
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Animated Big Header (in normal flow to prevent overlap) */}
        <Animated.View style={[
          styles.playlistInfo, 
          { opacity: headerOpacity }
        ]}>
          <View style={[styles.artworkBig, { backgroundColor: isFavorites ? '#FF4B4B' : theme.accentBg }]}>
            {isFavorites ? (
              <Heart size={64} color="#FFF" fill="#FFF" />
            ) : (
              <Text style={[styles.artworkLetter, { color: theme.accent }]}>
                {playlist.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.serif }]}>
            {playlist.name}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            {playlist.items?.length || 0} chants
          </Text>

          <TouchableOpacity 
            style={[styles.playBtn, { backgroundColor: theme.accentBg, opacity: playlist.items?.length ? 1 : 0.5 }]}
            onPress={handlePlayAll}
            disabled={!playlist.items?.length}
          >
            <Play size={20} color={theme.accentText} fill={theme.accentText} style={{ marginLeft: 4 }} />
            <Text style={[styles.playBtnText, { color: theme.accentText }]}>Play</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.trackList}>
          {playlist.items?.map((item) => {
            const stotra = item.stotra;
            if (!stotra) return null;
            return (
              <View key={item.id} style={[styles.trackItem, { backgroundColor: theme.card }]}>
                <TouchableOpacity style={styles.trackTouchable} onPress={() => handlePlayStotra(stotra)}>
                  <Image source={getStotraImageSource(stotra)} style={styles.trackImage} />
                  <View style={styles.trackInfo}>
                    <Text style={[styles.trackTitle, { color: theme.text, fontFamily: Fonts.serif }]} numberOfLines={1}>
                      {stotra.title_english}
                    </Text>
                    <Text style={[styles.trackSubtitle, { color: theme.textMuted }]} numberOfLines={1}>
                      {stotra.deity?.name_english || 'Mantra'}
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.removeBtn}
                  onPress={() => handleRemoveStotra(stotra.id)}
                  hitSlop={{top:10, bottom:10, left:10, right:10}}
                >
                  <Trash2 size={18} color={theme.textMuted} />
                </TouchableOpacity>
              </View>
            );
          })}
          {(!playlist.items || playlist.items.length === 0) && (
            <View style={styles.emptyState}>
              <Text style={{ color: theme.textMuted, textAlign: 'center' }}>
                No chants in this playlist yet.
              </Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Action Menu */}
      {isMenuVisible && !isFavorites && (
        <View style={[styles.menu, { backgroundColor: theme.card, borderColor: theme.border, top: insets.top + 40 }]}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setNewName(playlist.name);
              setIsMenuVisible(false);
              setIsRenameModalVisible(true);
            }}
          >
            <Edit3 size={18} color={theme.text} />
            <Text style={[styles.menuText, { color: theme.text }]}>Rename</Text>
          </TouchableOpacity>
          <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setIsMenuVisible(false);
              handleDeletePlaylist();
            }}
          >
            <Trash2 size={18} color="#FF3B30" />
            <Text style={[styles.menuText, { color: "#FF3B30" }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Rename Modal */}
      <Modal
        visible={isRenameModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsRenameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Rename Playlist</Text>
              <TouchableOpacity onPress={() => setIsRenameModalVisible(false)}>
                <X size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={[styles.modalInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="Playlist name"
              placeholderTextColor={theme.textMuted}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: theme.background }]}
                onPress={() => setIsRenameModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: theme.accentBg, opacity: newName.trim() ? 1 : 0.5 }]}
                onPress={handleRenameSubmit}
                disabled={!newName.trim()}
              >
                <Text style={[styles.modalBtnText, { color: theme.accentText }]}>Save</Text>
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
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 90,
  },
  iconBtn: {
    padding: Spacing.sm,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  playlistInfo: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  artworkBig: {
    width: 140,
    height: 140,
    borderRadius: BorderRadius['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  artworkLetter: {
    fontSize: 72,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: BorderRadius.full,
    gap: 8,
  },
  playBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  menu: {
    position: 'absolute',
    right: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 100,
    minWidth: 160,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 12,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    width: '100%',
  },
  trackList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
    gap: Spacing.sm,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    padding: Spacing.sm,
  },
  trackTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  trackImage: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  trackSubtitle: {
    fontSize: 13,
  },
  removeBtn: {
    padding: Spacing.sm,
  },
  emptyState: {
    paddingTop: 40,
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
