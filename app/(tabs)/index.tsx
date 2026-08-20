// ============================================================
// Home Screen — Carousel / Cover-Flow Feed
// ============================================================

import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Play } from 'lucide-react-native';
import { useSacredTheme } from '../../contexts/ThemeContext';
import { Spacing, BorderRadius, Fonts } from '../../constants/Theme';
import { useDataStore } from '../../store/dataStore';
import { usePlayerStore } from '../../store/playerStore';
import { getDeityImageSource, getStotraImageSource } from '../../data/mockData';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../locales';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.72;
const CARD_SPACING = 20;

export default function HomeScreen() {
  const { theme } = useSacredTheme();
  const { deities, stotras, isLoading, fetchData } = useDataStore();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const featuredStotras = useMemo(() => stotras.filter(s => s.is_featured), [stotras]);

  const handleStotraPress = async (stotra: typeof stotras[0]) => {
    const isAlreadyShowing = usePlayerStore.getState().showMiniPlayer;
    if (!isAlreadyShowing) {
      router.push('/player');
    }
    
    const stotraIndex = featuredStotras.findIndex(s => s.id === stotra.id);
    await usePlayerStore.getState().playQueue(featuredStotras, Math.max(0, stotraIndex));
  };

  if (isLoading && stotras.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text, fontFamily: Fonts.serif }]}>
            {t('home')}
          </Text>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/search')}>
            <Search size={24} color={theme.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Deities Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>{t('popularDeities').toUpperCase()}</Text>
          <TouchableOpacity onPress={() => router.push('/deities')}>
            <Text style={[styles.seeAllText, { color: theme.accent }]}>{t('seeAll')}</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.deitiesScroll}
        >
          {deities.map((deity) => (
            <TouchableOpacity 
              key={deity.slug} 
              style={styles.deityItem}
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
              <Text style={[styles.deityName, { color: theme.text }]}>{deity.name_english}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Chants Carousel */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>{t('recommendedForYou').toUpperCase()}</Text>
        </View>
        
        <FlatList
          data={featuredStotras}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          decelerationRate="fast"
          contentContainerStyle={styles.carouselContainer}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.carouselCardContainer, { width: CARD_WIDTH, marginRight: CARD_SPACING }]}>
              <TouchableOpacity 
                activeOpacity={0.9} 
                onPress={() => handleStotraPress(item)}
                style={[
                  styles.carouselCard, 
                  { 
                    borderColor: theme.border,
                    shadowColor: theme.text,
                  }
                ]}
              >
                <Image 
                  source={getStotraImageSource(item)} 
                  style={styles.cardImage} 
                  resizeMethod="resize"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.cardGradient}
                />
                
                {/* Floating Play Button */}
                <View style={styles.playButtonWrapper}>
                  <View style={[styles.playButton, { backgroundColor: theme.accentBg }]}>
                    <Play size={24} color={theme.accentText} fill={theme.accentText} style={{ marginLeft: 3 }} />
                  </View>
                </View>
              </TouchableOpacity>
              
              <Text 
                style={[styles.cardTitle, { color: theme.text, fontFamily: Fonts.serif }]}
                numberOfLines={1}
              >
                {item.title_english}
              </Text>
              <Text style={[styles.cardMeta, { color: theme.textTertiary }]}>
                {item.deity?.name_english || 'Unknown Deity'} • {Math.floor(item.duration_seconds / 60)}:{(item.duration_seconds % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          )}
        />

        {/* Bottom spacer for tab bar & mini player */}
        <View style={{ height: 160 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '600',
  },
  iconBtn: {
    padding: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  deitiesScroll: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  deityItem: {
    alignItems: 'center',
    gap: 8,
    marginRight: 12,
  },
  deityAvatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deityAvatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    overflow: 'hidden',
  },
  deityName: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  carouselContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  carouselCardContainer: {
    alignItems: 'center',
  },
  carouselCard: {
    width: '100%',
    height: 380,
    borderRadius: 40,
    borderWidth: 4,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  playButtonWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 32,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardMeta: {
    fontSize: 14,
    fontWeight: '500',
  },
});
