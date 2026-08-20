import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Moon, Sun, Bell, Volume2, Globe, Clock } from 'lucide-react-native';
import { useSacredTheme } from '../contexts/ThemeContext';
import { Spacing, Fonts, BorderRadius } from '../constants/Theme';
import { useSettingsStore } from '../store/settingsStore';

export default function SettingsScreen() {
  const { theme, isDark } = useSacredTheme();
  const router = useRouter();
  const settings = useSettingsStore();

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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.serif }]}>
          Settings
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>PREFERENCES</Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {renderToggleRow(Bell, 'Push Notifications', true, () => {})}
            {renderToggleRow(Globe, 'Offline Mode', false, () => {})}
            {renderToggleRow(Volume2, 'High Quality Audio', true, () => {})}
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
});
