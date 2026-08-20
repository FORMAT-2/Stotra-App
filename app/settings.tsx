import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Moon, Sun, Bell, Volume2, Globe, Clock } from 'lucide-react-native';
import { useSacredTheme } from '../contexts/ThemeContext';
import { Spacing, Fonts, BorderRadius } from '../constants/Theme';
import { useSettingsStore, Language } from '../store/settingsStore';
import { useTranslation } from '../locales';

export default function SettingsScreen() {
  const { theme, isDark } = useSacredTheme();
  const router = useRouter();
  const settings = useSettingsStore();
  const { t } = useTranslation();

  const renderToggleRow = (icon: any, label: string, value: boolean, onValueChange: (v: boolean) => void) => {
    const Icon = icon;
    return (
      <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
        <View style={styles.settingRowLeft}>
          <Icon size={20} color={theme.textMuted} />
          <Text style={[styles.settingText, { color: theme.text }]}>{label}</Text>
        </View>
        <Switch 
          value={value} 
          onValueChange={onValueChange} 
          trackColor={{ false: theme.border, true: theme.accent }}
          thumbColor={Platform.OS === 'android' ? theme.card : undefined}
        />
      </View>
    );
  };

  const renderChoiceRow = (title: string, options: { label: string, value: string }[], currentValue: string, onSelect: (v: string) => void) => {
    return (
      <View style={[styles.choiceRow, { borderBottomColor: theme.border }]}>
        <Text style={[styles.settingText, { color: theme.text, marginBottom: Spacing.md }]}>{title}</Text>
        <View style={styles.choiceGroup}>
          {options.map((opt) => {
            const isSelected = currentValue === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.choiceChip,
                  { 
                    backgroundColor: isSelected ? theme.accentBg : theme.surface,
                    borderColor: isSelected ? theme.accent : theme.borderLight,
                  }
                ]}
                onPress={() => onSelect(opt.value)}
              >
                <Text style={[
                  styles.choiceText,
                  { color: isSelected ? theme.accentText : theme.text }
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.serif }]}>
          {t('settings')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>{t('appLanguage')}</Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {renderChoiceRow(
              t('selectLanguage'),
              [
                { label: 'English', value: 'english' },
                { label: 'हिन्दी', value: 'hindi' },
                { label: 'संस्कृतम्', value: 'sanskrit' }
              ],
              settings.language,
              (v) => settings.setLanguage(v as Language)
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>{t('preferences')}</Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {renderToggleRow(Bell, t('pushNotifications'), settings.remindersEnabled, (v) => settings.setRemindersEnabled(v))}
            {renderToggleRow(Globe, t('offlineMode'), settings.offlineMode, (v) => settings.setOfflineMode(v))}
          </View>
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
    paddingTop: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginLeft: 8,
  },
  card: {
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  choiceRow: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  choiceGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  choiceChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  choiceText: {
    fontSize: 14,
    fontWeight: '600',
  }
});
