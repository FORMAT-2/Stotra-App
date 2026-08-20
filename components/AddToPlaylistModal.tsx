import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, Platform } from 'react-native';
import { Heart, ListMusic, X } from 'lucide-react-native';
import { useSacredTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius } from '../constants/Theme';
import { usePlaylistStore } from '../store/playlistStore';
import { useFavoritesStore } from '../store/favoritesStore';
import type { Stotra } from '../data/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  stotra: Stotra | null;
}

export function AddToPlaylistModal({ visible, onClose, stotra }: Props) {
  const { theme } = useSacredTheme();
  const { playlists, addStotraToPlaylist } = usePlaylistStore();
  const { favoriteIds, toggleFavorite } = useFavoritesStore();

  if (!stotra) return null;

  const isFavorite = favoriteIds.includes(stotra.id);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={[styles.modalSheet, { backgroundColor: theme.card }]} onStartShouldSetResponder={() => true}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add to Playlist</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.playlistScroll} showsVerticalScrollIndicator={false}>
            <TouchableOpacity 
              style={[styles.playlistOption]}
              onPress={() => {
                toggleFavorite(stotra.id);
                onClose();
              }}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#FF4B4B' }]}>
                <Heart size={24} color="#FFF" fill="#FFF" />
              </View>
              <Text style={[styles.optionText, { color: theme.text }]}>
                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </Text>
            </TouchableOpacity>

            {playlists.map(playlist => (
              <TouchableOpacity 
                key={playlist.id}
                style={[styles.playlistOption]}
                onPress={() => {
                  addStotraToPlaylist(playlist.id, stotra);
                  onClose();
                }}
              >
                <View style={[styles.optionIcon, { backgroundColor: theme.border }]}>
                  <ListMusic size={24} color={theme.text} />
                </View>
                <Text style={[styles.optionText, { color: theme.text }]}>
                  {playlist.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: BorderRadius['3xl'],
    borderTopRightRadius: BorderRadius['3xl'],
    padding: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
    maxHeight: '70%',
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
  playlistScroll: {
    marginBottom: Spacing.md,
  },
  playlistOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
