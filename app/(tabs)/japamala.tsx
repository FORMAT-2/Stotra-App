// ============================================================
// Japamala Screen — Interactive 108-bead chanting counter
// ============================================================

import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSacredTheme } from '../../contexts/ThemeContext';
import { SacredColors, Spacing, BorderRadius, FontSizes } from '../../constants/Theme';
import { useJapamalaStore } from '../../store/japamalaStore';
import { useSettingsStore } from '../../store/settingsStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function JapamalaScreen() {
  const { theme } = useSacredTheme();
  
  const { dailyTarget: targetCount, setDailyTarget: setTarget } = useSettingsStore();

  const {
    count,
    totalSessions,
    totalLifetimeCount,
    currentStreak,
    mantraName,
    increment,
    reset,
    setMantraName,
    completeSession,
  } = useJapamalaStore();

  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalConfig, setModalConfig] = React.useState<{ title: string; options: any[]; onSelect: (val: any) => void }>({
    title: '', options: [], onSelect: () => {}
  });

  const openOptions = (title: string, options: { label: string, value: any }[], onSelect: (val: any) => void) => {
    setModalConfig({ title, options, onSelect });
    setModalVisible(true);
  };

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const completionAnim = useRef(new Animated.Value(0)).current;

  const progress = count / targetCount;
  const isComplete = count >= targetCount;

  // Pulse animation on tap
  const animateTap = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.92,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.spring(pulseAnim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pulseAnim]);

  // Glow on milestones
  useEffect(() => {
    if (count > 0 && count % 27 === 0) {
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    }
  }, [count, glowAnim]);

  // Completion animation
  useEffect(() => {
    if (isComplete) {
      Animated.spring(completionAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      completionAnim.setValue(0);
    }
  }, [isComplete, completionAnim]);

  const handleTap = useCallback(() => {
    if (isComplete) return;
    increment(targetCount);
    animateTap();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Stronger haptic on every 27th count (quarter mala)
    if ((count + 1) % 27 === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [isComplete, increment, animateTap, count, targetCount]);

  const handleComplete = () => {
    completeSession();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleReset = () => {
    reset();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Generate bead positions in a circle
  const beadCount = 27; // Show 27 beads visually (quarter sections)
  const beads = Array.from({ length: beadCount }, (_, i) => {
    const angle = (i / beadCount) * 2 * Math.PI - Math.PI / 2;
    const radius = (SCREEN_WIDTH - 100) / 2 - 15;
    const cx = SCREEN_WIDTH / 2 - 8;
    const cy = SCREEN_WIDTH / 2 - 60;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      filled: i < Math.floor((count / targetCount) * beadCount),
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <TouchableOpacity 
        style={styles.header}
        activeOpacity={0.7}
        onPress={() => openOptions('Select Mantra', [
          { label: 'ॐ नमः शिवाय (Om Namah Shivaya)', value: 'ॐ नमः शिवाय (Om Namah Shivaya)' },
          { label: 'ॐ नमो भगवते वासुदेवाय (Om Namo Bhagavate Vasudevaya)', value: 'ॐ नमो भगवते वासुदेवाय (Om Namo Bhagavate Vasudevaya)' },
          { label: 'हरे कृष्ण हरे राम (Hare Krishna Hare Rama)', value: 'हरे कृष्ण हरे राम (Hare Krishna Hare Rama)' },
          { label: 'ॐ भूर्भुवः स्वः (Gayatri Mantra)', value: 'ॐ भूर्भुवः स्वः (Gayatri Mantra)' },
          { label: 'ॐ गं गणपतये नमः (Om Gam Ganapataye Namaha)', value: 'ॐ गं गणपतये नमः (Om Gam Ganapataye Namaha)' },
        ], setMantraName)}
      >
        <Text style={[styles.title, { color: theme.text }]}>🙏 Japamala</Text>
        <Text style={[styles.subtitle, { color: theme.textTertiary }]}>
          {mantraName} <Ionicons name="chevron-down" size={12} color={theme.textTertiary} />
        </Text>
      </TouchableOpacity>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: SacredColors.gold[500] }]}>{totalSessions}</Text>
          <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Sessions</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: SacredColors.gold[500] }]}>
            {totalLifetimeCount.toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Total Count</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: SacredColors.gold[500] }]}>{currentStreak}🔥</Text>
          <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Streak</Text>
        </View>
      </View>

      {/* Mala Circle */}
      <View style={styles.malaContainer}>
        {/* Bead ring */}
        {beads.map((bead, i) => (
          <View
            key={i}
            style={[
              styles.bead,
              {
                left: bead.x,
                top: bead.y,
                backgroundColor: bead.filled
                  ? SacredColors.gold[500]
                  : theme.surface,
                borderColor: bead.filled
                  ? SacredColors.gold[400]
                  : theme.border,
                shadowColor: bead.filled ? SacredColors.gold[500] : 'transparent',
                shadowOpacity: bead.filled ? 0.5 : 0,
                shadowRadius: bead.filled ? 4 : 0,
                elevation: bead.filled ? 3 : 0,
              },
            ]}
          />
        ))}

        {/* Center tap area */}
        <Animated.View
          style={[
            styles.centerTapContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={isComplete ? handleComplete : handleTap}
            style={styles.centerTap}
          >
            <LinearGradient
              colors={
                isComplete
                  ? [SacredColors.saffron[600], SacredColors.gold[500]]
                  : [`${SacredColors.gold[500]}20`, `${SacredColors.gold[500]}08`]
              }
              style={[styles.centerGradient, {
                borderColor: isComplete
                  ? SacredColors.gold[500]
                  : `${SacredColors.gold[500]}30`,
              }]}
            >
              {isComplete ? (
                <>
                  <Text style={styles.completeEmoji}>🔔</Text>
                  <Text style={styles.completeText}>Complete!</Text>
                  <Text style={styles.completeSub}>Tap to finish</Text>
                </>
              ) : (
                <>
                  <Text style={[styles.countText, { color: SacredColors.gold[500] }]}>
                    {count}
                  </Text>
                  <Text style={[styles.targetText, { color: theme.textTertiary }]}>
                    of {targetCount}
                  </Text>
                  <Text style={[styles.tapHint, { color: theme.textMuted }]}>
                    Tap to count
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressTrack, { backgroundColor: theme.surface }]}>
          <LinearGradient
            colors={[SacredColors.gold[500], SacredColors.saffron[600]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]}
          />
        </View>
        <Text style={[styles.progressText, { color: theme.textTertiary }]}>
          {Math.round(progress * 100)}%
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleReset}
          style={[styles.actionButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Ionicons name="refresh" size={20} color={theme.textSecondary} />
          <Text style={[styles.actionText, { color: theme.textSecondary }]}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => openOptions('Select Target', [
            { label: '11', value: 11 },
            { label: '21', value: 21 },
            { label: '54', value: 54 },
            { label: '108', value: 108 },
            { label: '1008', value: 1008 },
          ], setTarget)}
          style={[styles.actionButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <MaterialCommunityIcons name="counter" size={20} color={theme.textSecondary} />
          <Text style={[styles.actionText, { color: theme.textSecondary }]}>Target: {targetCount}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom spacer */}
      <View style={{ height: 120 }} />

      {/* Options Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>{modalConfig.title}</Text>
                
                {modalConfig.options.map((option, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.modalOption,
                      idx < modalConfig.options.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.borderLight }
                    ]}
                    onPress={() => {
                      modalConfig.onSelect(option.value);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={[styles.modalOptionText, { color: theme.text }]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity
                  style={[styles.modalCancelBtn, { backgroundColor: theme.surface }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.modalCancelText, { color: SacredColors.gold[500] }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: '800',
  },
  subtitle: {
    fontSize: FontSizes.sm,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: FontSizes.xs,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  malaContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH - 80,
    position: 'relative',
  },
  bead: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  centerTapContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -70,
    marginTop: -100,
  },
  centerTap: {
    width: 140,
    height: 140,
  },
  centerGradient: {
    flex: 1,
    borderRadius: 70,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 48,
    fontWeight: '800',
    lineHeight: 52,
  },
  targetText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  tapHint: {
    fontSize: FontSizes.xs,
    marginTop: 4,
  },
  completeEmoji: {
    fontSize: 36,
  },
  completeText: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: '#FFF',
  },
  completeSub: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['3xl'],
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingTop: Spacing['2xl'],
    paddingHorizontal: Spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  actionText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: FontSizes.md,
  },
  modalCancelBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
});
