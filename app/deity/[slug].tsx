import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Play } from 'lucide-react-native';
import { useSacredTheme } from '../../contexts/ThemeContext';
import { Spacing, Fonts, BorderRadius } from '../../constants/Theme';
import { useDataStore } from '../../store/dataStore';
import { getDeityImageSource, getStotraImageSource } from '../../data/mockData';
import { audioService } from '../../services/AudioService';
import { usePlayerStore } from '../../store/playerStore';
import { useTranslation } from '../../locales';

export default function DeityDetailsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { theme } = useSacredTheme();
  const router = useRouter();
  const { deities, stotras } = useDataStore();
  const { t } = useTranslation();

  const deity = useMemo(() => deities.find(d => d.slug === slug), [deities, slug]);
  
  const deityStotras = useMemo(() => {
    if (!deity) return [];
    return stotras.filter(s => s.deity?.slug === deity.slug);
  }, [stotras, deity]);

  const handlePlayPress = async (stotra: typeof stotras[0]) => {
    const isAlreadyShowing = usePlayerStore.getState().showMiniPlayer;
    if (!isAlreadyShowing) {
      router.push('/player');
    }
    
    const stotraIndex = deityStotras.findIndex(s => s.id === stotra.id);
    await usePlayerStore.getState().playQueue(deityStotras, Math.max(0, stotraIndex));
  };

  if (!deity) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.text }}>Deity not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: theme.accent }}>{t('goBack')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.serif }]} numberOfLines={1}>
          {deity.name_english}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerBanner}>
          <View style={[styles.deityAvatarRing, { backgroundColor: theme.accentBg }]}>
            <Image 
              source={getDeityImageSource(deity)} 
              style={styles.deityAvatar} 
              resizeMode="cover"
              resizeMethod="resize"
            />
          </View>
          <Text style={[styles.deityDescription, { color: theme.textMuted }]}>
            {deity.description || `Sacred chants and stotras dedicated to ${deity.name_english}.`}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>{t('songsAndChants').toUpperCase()}</Text>
        
        <View style={styles.resultsList}>
          {deityStotras.length > 0 ? (
            deityStotras.map((stotra) => (
              <TouchableOpacity 
                key={stotra.id}
                activeOpacity={0.7}
                onPress={() => handlePlayPress(stotra)}
                style={[styles.resultCard, { backgroundColor: theme.card }]}
              >
                <Image 
                  source={getStotraImageSource(stotra)} 
                  style={styles.resultImage} 
                  resizeMethod="resize"
                />
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultTitle, { color: theme.text, fontFamily: Fonts.serif }]} numberOfLines={1}>
                    {stotra.title_english}
                  </Text>
                  <Text style={[styles.resultSubtitle, { color: theme.textMuted }]} numberOfLines={1}>
                    {Math.floor(stotra.duration_seconds / 60)}:{(stotra.duration_seconds % 60).toString().padStart(2, '0')}
                  </Text>
                </View>
                <View style={styles.playIconWrapper}>
                  <Play size={20} color={theme.accent} fill={theme.accent} />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noResults}>
              <Text style={{ color: theme.textMuted, fontSize: 16 }}>{t('noChantsAvailable')}</Text>
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
    fontSize: 24,
    fontWeight: '600',
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  headerBanner: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
    marginTop: Spacing.md,
  },
  deityAvatarRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  deityAvatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    overflow: 'hidden',
  },
  deityDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Spacing.md,
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
  playIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResults: {
    paddingVertical: 40,
    alignItems: 'center',
  },
});
