// ============================================================
// SectionHeader — Reusable section title with optional action
// ============================================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSacredTheme } from '../contexts/ThemeContext';
import { Spacing, FontSizes } from '../constants/Theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
}

export default function SectionHeader({ title, subtitle, actionText, onAction }: SectionHeaderProps) {
  const { theme } = useSacredTheme();

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.textTertiary }]}>{subtitle}</Text>
        )}
      </View>
      {actionText && onAction && (
        <TouchableOpacity onPress={onAction} style={styles.action} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.actionText, { color: theme.accent }]}>{actionText}</Text>
          <Ionicons name="chevron-forward" size={14} color={theme.accent} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.md,
  },
  titleContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FontSizes.xs,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});
