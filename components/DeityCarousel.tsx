// ============================================================
// DeityCarousel — Horizontal scrolling deity cards
// ============================================================

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSacredTheme } from '../contexts/ThemeContext';
import { SacredColors, Spacing, BorderRadius, FontSizes } from '../constants/Theme';
import { DEITY_ICONS, DEITY_IMAGES } from '../data/mockData';
import type { Deity } from '../data/types';

interface DeityCarouselProps {
  deities: Deity[];
  onDeityPress?: (deity: Deity) => void;
  selectedDeity?: string | null;
}

export default function DeityCarousel({ deities, onDeityPress, selectedDeity }: DeityCarouselProps) {
  const { theme } = useSacredTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {deities.map((deity) => {
        const isSelected = selectedDeity === deity.slug;
        const emoji = DEITY_ICONS[deity.slug] || '🙏';
        const localImage = DEITY_IMAGES[deity.slug];

        return (
          <TouchableOpacity
            key={deity.id}
            activeOpacity={0.7}
            onPress={() => onDeityPress?.(deity)}
            style={styles.deityCard}
          >
            <View style={[
              styles.iconContainer,
              {
                borderColor: isSelected ? deity.accent_color : theme.border,
                borderWidth: isSelected ? 2 : 1,
              }
            ]}>
              {localImage ? (
                <Image 
                  source={localImage} 
                  style={styles.deityImage} 
                  resizeMode="cover"
                />
              ) : deity.image_url ? (
                <Image 
                  source={{ 
                    uri: deity.image_url,
                    headers: {
                      'User-Agent': 'StotraApp/1.0'
                    }
                  }} 
                  style={styles.deityImage} 
                  resizeMode="cover"
                />
              ) : (
                <LinearGradient
                  colors={[
                    `${deity.accent_color}25`,
                    `${deity.accent_color}08`,
                  ]}
                  style={styles.iconGradient}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </LinearGradient>
              )}
            </View>
            <Text
              style={[
                styles.name,
                {
                  color: isSelected ? deity.accent_color : theme.textSecondary,
                  fontWeight: isSelected ? '700' : '500',
                },
              ]}
              numberOfLines={1}
            >
              {deity.name_english.replace('Lord ', '').replace('Goddess ', '')}
            </Text>
            <Text
              style={[styles.sanskrit, { color: theme.textTertiary }]}
              numberOfLines={1}
            >
              {deity.name_sanskrit}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  deityCard: {
    alignItems: 'center',
    width: 72,
    gap: Spacing.xs,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  iconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deityImage: {
    width: '100%',
    height: '100%',
  },
  emoji: {
    fontSize: 28,
  },
  name: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
  },
  sanskrit: {
    fontSize: 9,
    textAlign: 'center',
  },
});
