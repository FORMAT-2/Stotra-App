import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSacredTheme } from '../contexts/ThemeContext';
import { SacredColors, Spacing, FontSizes, BorderRadius } from '../constants/Theme';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function AboutScreen() {
  const { theme } = useSacredTheme();
  const router = useRouter();

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>About</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.brandingContainer}>
          <LinearGradient
            colors={[SacredColors.gold[400], SacredColors.saffron[500]]}
            style={styles.logoPlaceholder}
          >
            <Ionicons name="sparkles" size={48} color="#FFF" />
          </LinearGradient>
          <Text style={[styles.appName, { color: theme.text }]}>Divine Stotra</Text>
          <Text style={[styles.version, { color: theme.textTertiary }]}>Version 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Our Mission</Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            Divine Stotra is built with the mission to preserve and propagate the sacred chants, mantras, and stotras of Sanatana Dharma. We strive to provide a pure, distraction-free environment for your daily sadhana and spiritual growth.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Connect With Us</Text>
          
          <TouchableOpacity 
            style={[styles.linkCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => handleLinkPress('https://divinestotra.app')}
          >
            <View style={styles.linkIcon}>
              <Ionicons name="globe-outline" size={24} color={SacredColors.gold[500]} />
            </View>
            <View style={styles.linkInfo}>
              <Text style={[styles.linkLabel, { color: theme.text }]}>Website</Text>
              <Text style={[styles.linkValue, { color: theme.textTertiary }]}>divinestotra.app</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={theme.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.linkCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => handleLinkPress('mailto:support@divinestotra.app')}
          >
            <View style={styles.linkIcon}>
              <Ionicons name="mail-outline" size={24} color={SacredColors.gold[500]} />
            </View>
            <View style={styles.linkInfo}>
              <Text style={[styles.linkLabel, { color: theme.text }]}>Contact Support</Text>
              <Text style={[styles.linkValue, { color: theme.textTertiary }]}>support@divinestotra.app</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={theme.textTertiary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            Made with ❤️ and devotion
          </Text>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            © 2026 Divine Stotra. All rights reserved.
          </Text>
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
    paddingTop: 60,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  brandingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
  },
  logoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: SacredColors.gold[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  appName: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  version: {
    fontSize: FontSizes.md,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing['2xl'],
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  paragraph: {
    fontSize: FontSizes.md,
    lineHeight: 24,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(212,175,55,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  linkInfo: {
    flex: 1,
  },
  linkLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  linkValue: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  footerText: {
    fontSize: FontSizes.sm,
    marginTop: 4,
  },
});
