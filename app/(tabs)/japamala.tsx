// ============================================================
// Japamala Screen — Digital Counter (Bento Design)
// ============================================================

import React, { useCallback, useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Modal,
  Image,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Bell, BellOff, RotateCcw, Target, Flame, Music, X } from 'lucide-react-native';
import { useSacredTheme } from '../../contexts/ThemeContext';
import { Spacing, BorderRadius, Fonts } from '../../constants/Theme';
import { useJapamalaStore } from '../../store/japamalaStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useDataStore } from '../../store/dataStore';
import { audioService } from '../../services/AudioService';
import { getStotraImageSource } from '../../data/mockData';
import { useTranslation } from '../../locales';

export default function JapamalaScreen() {
  const { theme, isDark } = useSacredTheme();
  const { t } = useTranslation();
  const { dailyTarget: targetCount, setDailyTarget: setTarget } = useSettingsStore();

  const {
    count,
    currentStreak,
    increment,
    reset,
    completeSession,
  } = useJapamalaStore();

  const [soundEnabled, setSoundEnabled] = useState(true);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isComplete = count >= targetCount;

  const [showMusicModal, setShowMusicModal] = useState(false);
  const { stotras } = useDataStore();
  const [selectedStotra, setSelectedStotra] = useState<any>(null);

  const handleSelectMusic = async (stotra: any) => {
    setSelectedStotra(stotra);
    setShowMusicModal(false);
    
    // Play it immediately
    const { dataService } = await import('../../services/DataService');
    const verses = await dataService.getVersesForStotra(stotra.id);
    
    // Set to infinite loop for japamala background
    const store = require('../../store/playerStore').usePlayerStore.getState();
    store.setLoopMode('infinite');
    
    audioService.playStotra(stotra, verses);
  };

  // Pulse animation on tap
  const animateTap = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(pulseAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pulseAnim]);

  const handleTap = useCallback(() => {
    if (isComplete) {
      completeSession();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }
    increment(targetCount);
    animateTap();
    if (soundEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [isComplete, increment, animateTap, count, targetCount, soundEnabled]);

  const handleReset = () => {
    reset();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* Top Right Controls */}
      <View style={styles.topRightControls}>
        <TouchableOpacity 
          style={[styles.controlBtn, { backgroundColor: theme.card, shadowColor: theme.text }]}
          onPress={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? (
             <Bell size={20} color={theme.text} />
          ) : (
             <BellOff size={20} color={theme.textMuted} />
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.controlBtn, { backgroundColor: theme.card, shadowColor: theme.text }]}
          onPress={handleReset}
        >
          <RotateCcw size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.serif }]}>{t('japamala')}</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>{t('digitalCounter')}</Text>
      </View>

      {/* Big Tap Button */}
      <View style={styles.centerArea}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleTap}
            style={[
              styles.giantButton, 
              { 
                backgroundColor: isComplete ? theme.success || '#10B981' : theme.accentBg,
                borderColor: theme.border,
                shadowColor: theme.accentBg
              }
            ]}
          >
            <Text style={[styles.countText, { color: theme.accentText, fontFamily: Fonts.serif }]}>
              {count}
            </Text>
            <Text style={[styles.tapHintText, { color: theme.accentText }]}>
              {isComplete ? t('complete') : t('tapToChant')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Target Selector */}
      <View style={styles.targetSelector}>
        <Target size={20} color={theme.textMuted} />
        <View style={[styles.chipGroup, { backgroundColor: theme.card }]}>
          {[11, 21, 51, 108].map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => { setTarget(t); reset(); }}
              style={[
                styles.targetChip,
                targetCount === t && { backgroundColor: theme.accentBg }
              ]}
            >
              <Text style={[
                styles.targetChipText,
                { color: targetCount === t ? theme.accentText : theme.text }
              ]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bento Stats */}
      <View style={styles.bentoGrid}>
        <View style={[styles.bentoCard, { backgroundColor: theme.card, shadowColor: theme.text }]}>
          <Flame size={32} color="#F97316" style={{ marginBottom: 8 }} />
          <Text style={[styles.bentoValue, { color: theme.text }]}>{currentStreak}</Text>
          <Text style={[styles.bentoLabel, { color: theme.textMuted }]}>{t('dayStreak')}</Text>
        </View>

        <View style={[styles.bentoCard, { backgroundColor: theme.card, shadowColor: theme.text }]}>
          <Target size={32} color={theme.accent} style={{ marginBottom: 8 }} />
          <Text style={[styles.bentoValue, { color: theme.text }]}>{targetCount}</Text>
          <Text style={[styles.bentoLabel, { color: theme.textMuted }]}>{t('targetMalas')}</Text>
        </View>
      </View>

      {/* Music Selector Button */}
      <View style={{ alignItems: 'center', marginBottom: Platform.OS === 'ios' ? 100 : 80 }}>
        <TouchableOpacity 
          style={[styles.musicBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => setShowMusicModal(true)}
        >
          <Music size={20} color={theme.accent} />
          <Text style={[styles.musicBtnText, { color: theme.text }]}>
            {selectedStotra ? selectedStotra.title_english : t('selectBackgroundChant')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Music Selection Modal */}
      <Modal visible={showMusicModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text, fontFamily: Fonts.serif }]}>{t('selectBackgroundChant')}</Text>
            <TouchableOpacity onPress={() => setShowMusicModal(false)}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={{ padding: Spacing.xl, gap: Spacing.md }}>
            <TouchableOpacity 
              style={[styles.stotraItem, { backgroundColor: theme.card }]}
              onPress={() => {
                setSelectedStotra(null);
                setShowMusicModal(false);
                audioService.pause();
              }}
            >
              <View style={[styles.stotraImage, { backgroundColor: theme.border, justifyContent: 'center', alignItems: 'center' }]}>
                <BellOff size={24} color={theme.textMuted} />
              </View>
              <Text style={{ color: theme.text, fontSize: 16, fontWeight: '500' }}>{t('noBackgroundMusic')}</Text>
            </TouchableOpacity>

            {stotras.map((s) => (
              <TouchableOpacity 
                key={s.id}
                style={[styles.stotraItem, { backgroundColor: theme.card }]}
                onPress={() => handleSelectMusic(s)}
              >
                <Image source={getStotraImageSource(s)} style={styles.stotraImage} resizeMethod="resize" />
                <View>
                  <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600', fontFamily: Fonts.serif }}>{s.title_english}</Text>
                  <Text style={{ color: theme.textMuted, fontSize: 13, marginTop: 4 }}>{s.deity?.name_english || 'Mantra'}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
  },
  topRightControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 70 : 50,
    right: Spacing.xl,
    gap: Spacing.md,
    zIndex: 10,
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing['3xl'],
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  giantButton: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  countText: {
    fontSize: 72,
    fontWeight: '700',
  },
  tapHintText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 8,
    opacity: 0.9,
  },
  targetSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  chipGroup: {
    flexDirection: 'row',
    padding: 6,
    borderRadius: BorderRadius.full,
  },
  targetChip: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetChipText: {
    fontSize: 15,
    fontWeight: '700',
  },
  bentoGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  bentoCard: {
    flex: 1,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  bentoValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  bentoLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  musicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  musicBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  stotraItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  stotraImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  }
});
