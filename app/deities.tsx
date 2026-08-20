import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useSacredTheme } from '../contexts/ThemeContext';
import { Spacing, Fonts, BorderRadius } from '../constants/Theme';
import { useDataStore } from '../store/dataStore';
import { getDeityImageSource } from '../data/mockData';
import { useTranslation } from '../locales';

export default function DeitiesScreen() {
  const { theme } = useSacredTheme();
  const router = useRouter();
  const { deities } = useDataStore();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.serif }]}>
          {t('allDeities')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {deities.map((deity) => (
            <TouchableOpacity 
              key={deity.slug} 
              style={styles.gridItem}
              onPress={() => router.push(`/deity/${deity.slug}`)}
            >
              <View style={[styles.deityAvatarRing, { backgroundColor: theme.accentBg }]}>
                <Image 
                  source={getDeityImageSource(deity)} 
                  style={styles.deityAvatar} 
                  resizeMode="cover"
                  resizeMethod="resize"
                />
              </View>
              <Text style={[styles.deityName, { color: theme.text }]} numberOfLines={1}>
                {deity.name_english}
              </Text>
            </TouchableOpacity>
          ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
    marginLeft: -Spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.lg,
  },
  gridItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  deityAvatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  deityAvatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    overflow: 'hidden',
  },
  deityName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
