import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Switch,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSacredTheme } from '../../contexts/ThemeContext';
import { SacredColors, Spacing, BorderRadius, FontSizes } from '../../constants/Theme';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useJapamalaStore } from '../../store/japamalaStore';
import { useSettingsStore, Language, ScriptPreference, SleepTimer, PlaybackSpeed, LoopMode } from '../../store/settingsStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useSacredTheme();
  const { totalSessions, totalLifetimeCount, currentStreak } = useJapamalaStore();
  const { user, signOut, subscriptionStatus } = useAuthStore();
  
  // Settings Store
  const { 
    language, setLanguage, 
    scriptPreference, setScriptPreference, 
    dailyTarget, setDailyTarget, 
    remindersEnabled, setRemindersEnabled, 
    defaultSleepTimer, setDefaultSleepTimer, 
    defaultPlaybackSpeed, setDefaultPlaybackSpeed, 
    defaultLoopMode, setDefaultLoopMode 
  } = useSettingsStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ title: string; options: any[]; onSelect: (val: any) => void }>({
    title: '', options: [], onSelect: () => {}
  });

  const openOptions = (title: string, options: { label: string, value: any }[], onSelect: (val: any) => void) => {
    setModalConfig({ title, options, onSelect });
    setModalVisible(true);
  };

  const handleFeatureNotReady = () => {
    import('react-native').then(({ Alert }) => {
      Alert.alert("Coming Soon", "This feature will be available in a future update.");
    });
  };

  const handleAuthPress = async () => {
    if (user) {
      await signOut();
    } else {
      router.push('/auth');
    }
  };

  const settingSections = [
    {
      title: 'Display',
      items: [
        {
          icon: isDark ? 'moon' : 'sunny',
          label: isDark ? 'Dark Theme' : 'Light Theme',
          subtitle: 'Toggle appearance',
          type: 'toggle' as const,
          value: isDark,
          onToggle: toggleTheme,
        },
        {
          icon: 'language',
          label: 'Language',
          subtitle: language === 'english' ? 'English' : 'हिंदी (Hindi)',
          type: 'nav' as const,
          onPress: () => openOptions('Language', [
            { label: 'English', value: 'english' },
            { label: 'हिंदी (Hindi)', value: 'hindi' }
          ], (val) => setLanguage(val as Language)),
        },
        {
          icon: 'text',
          label: 'Script Preference',
          subtitle: scriptPreference === 'all' ? 'All (Devanagari + IAST + Meaning)' : 
                    scriptPreference === 'devanagari' ? 'Devanagari Only' :
                    scriptPreference === 'iast' ? 'IAST (English Script) Only' : 'Meaning Only',
          type: 'nav' as const,
          onPress: () => openOptions('Script Preference', [
            { label: 'All', value: 'all' },
            { label: 'Devanagari Only', value: 'devanagari' },
            { label: 'IAST Only', value: 'iast' },
            { label: 'Meaning Only', value: 'meaning' }
          ], (val) => setScriptPreference(val as ScriptPreference)),
        },
      ],
    },
    {
      title: 'Chanting',
      items: [
        {
          icon: 'flag',
          label: 'Daily Target',
          subtitle: `${dailyTarget} mantras per day`,
          type: 'nav' as const,
          onPress: () => openOptions('Daily Target', [
            { label: '11 Mantras', value: 11 },
            { label: '21 Mantras', value: 21 },
            { label: '51 Mantras', value: 51 },
            { label: '108 Mantras', value: 108 },
            { label: '1008 Mantras', value: 1008 }
          ], (val) => setDailyTarget(val as number)),
        },
        {
          icon: 'notifications-outline',
          label: 'Reminders',
          subtitle: remindersEnabled ? 'On' : 'Off',
          type: 'toggle' as const,
          value: remindersEnabled,
          onToggle: setRemindersEnabled,
        },
        {
          icon: 'timer-outline',
          label: 'Default Sleep Timer',
          subtitle: defaultSleepTimer === 0 ? 'Off' : `${defaultSleepTimer} minutes`,
          type: 'nav' as const,
          onPress: () => openOptions('Default Sleep Timer', [
            { label: 'Off', value: 0 },
            { label: '15 minutes', value: 15 },
            { label: '30 minutes', value: 30 },
            { label: '45 minutes', value: 45 },
            { label: '60 minutes', value: 60 }
          ], (val) => setDefaultSleepTimer(val as SleepTimer)),
        },
      ],
    },
    {
      title: 'Audio',
      items: [
        {
          icon: 'volume-high',
          label: 'Default Playback Speed',
          subtitle: `${defaultPlaybackSpeed}x`,
          type: 'nav' as const,
          onPress: () => openOptions('Default Playback Speed', [
            { label: '0.5x', value: 0.5 },
            { label: '0.75x', value: 0.75 },
            { label: '1.0x (Normal)', value: 1.0 },
            { label: '1.25x', value: 1.25 },
            { label: '1.5x', value: 1.5 },
            { label: '2.0x', value: 2.0 }
          ], (val) => setDefaultPlaybackSpeed(val as PlaybackSpeed)),
        },
        {
          icon: 'repeat',
          label: 'Default Loop Mode',
          subtitle: defaultLoopMode === 'infinite' ? 'Infinite' : `${defaultLoopMode}x`,
          type: 'nav' as const,
          onPress: () => openOptions('Default Loop Mode', [
            { label: '1x (No Loop)', value: '1' },
            { label: '11x', value: '11' },
            { label: '108x', value: '108' },
            { label: 'Infinite Loop', value: 'infinite' }
          ], (val) => setDefaultLoopMode(val as LoopMode)),
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'information-circle',
          label: 'About Divine Stotra',
          subtitle: 'Version 1.0.0',
          type: 'nav' as const,
          onPress: handleFeatureNotReady,
        },
        {
          icon: 'heart',
          label: 'Rate the App',
          subtitle: 'Support the divine mission',
          type: 'nav' as const,
          onPress: handleFeatureNotReady,
        },
        {
          icon: 'share-social',
          label: 'Share with Friends',
          subtitle: 'Spread the sacred knowledge',
          type: 'nav' as const,
          onPress: handleFeatureNotReady,
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>🙏 Profile</Text>
        </View>

        {/* User Card */}
        <View style={styles.userCardContainer}>
          <LinearGradient
            colors={[`${SacredColors.gold[500]}15`, `${SacredColors.gold[500]}05`, theme.card]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.userCard, { borderColor: `${SacredColors.gold[500]}20` }]}
          >
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[SacredColors.gold[500], SacredColors.saffron[600]]}
                style={styles.avatar}
              >
                <Text style={styles.avatarEmoji}>🙏</Text>
              </LinearGradient>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.text }]}>
                {user ? user.email?.split('@')[0] || 'Devotee' : 'Devotee'}
              </Text>
              <Text style={[styles.userSubtitle, { color: theme.textTertiary }]}>
                {user ? user.email : 'Guest Mode · Tap to sign in'}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleAuthPress}
              style={[styles.signInButton, { borderColor: SacredColors.gold[500] }]}
            >
              <Text style={[styles.signInText, { color: SacredColors.gold[500] }]}>
                {user ? 'Sign Out' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Upgrade Banner */}
        {user && subscriptionStatus !== 'active' && (
          <TouchableOpacity 
            style={styles.upgradeCard}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[SacredColors.gold[500], SacredColors.saffron[600]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeGradient}
            >
              <View style={styles.upgradeInfo}>
                <Text style={styles.upgradeTitle}>Unlock Premium 🌟</Text>
                <Text style={styles.upgradeSub}>Get unlimited audio & offline downloads</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          {[
            { label: 'Japamala\nSessions', value: totalSessions.toString(), icon: '📿' },
            { label: 'Total\nChants', value: totalLifetimeCount.toLocaleString(), icon: '🔢' },
            { label: 'Day\nStreak', value: `${currentStreak}`, icon: '🔥' },
            { label: 'Stotras\nPlayed', value: '0', icon: '🎵' },
          ].map((stat, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: SacredColors.gold[500] }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.textTertiary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Settings */}
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex}>
            <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>
              {section.title}
            </Text>
            <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  onPress={item.type === 'nav' ? item.onPress : undefined}
                  style={[
                    styles.settingItem,
                    itemIndex < section.items.length - 1 && {
                      borderBottomColor: theme.borderLight,
                      borderBottomWidth: 1,
                    },
                  ]}
                  activeOpacity={item.type === 'toggle' ? 1 : 0.7}
                >
                  <View style={[styles.settingIcon, { backgroundColor: `${SacredColors.gold[500]}10` }]}>
                    <Ionicons name={item.icon as any} size={18} color={SacredColors.gold[500]} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, { color: theme.text }]}>{item.label}</Text>
                    <Text style={[styles.settingSub, { color: theme.textTertiary }]}>{item.subtitle}</Text>
                  </View>
                  {item.type === 'toggle' ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: theme.surface, true: `${SacredColors.gold[500]}50` }}
                      thumbColor={item.value ? SacredColors.gold[500] : theme.textMuted}
                    />
                  ) : (
                    <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>

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

  // User Card
  userCardContainer: {
    paddingHorizontal: Spacing.lg,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: Spacing.md,
  },
  avatarContainer: {},
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  userSubtitle: {
    fontSize: FontSizes.xs,
  },
  signInButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  signInText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },

  // Upgrade Banner
  upgradeCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    shadowColor: SacredColors.gold[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  upgradeInfo: {
    flex: 1,
  },
  upgradeTitle: {
    color: '#FFF',
    fontSize: FontSizes.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  upgradeSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FontSizes.xs,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: 4,
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 9,
    textAlign: 'center',
    lineHeight: 12,
  },

  // Settings
  sectionTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.sm,
  },
  sectionCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    gap: 1,
  },
  settingLabel: {
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  settingSub: {
    fontSize: FontSizes.xs,
  },

  // Modal Styles
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

