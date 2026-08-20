// ============================================================
// Profile Screen — User Account & Settings
// ============================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { User, Crown, Settings, Info, LogOut, ChevronRight, Share2, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSacredTheme } from '../../contexts/ThemeContext';
import { Spacing, BorderRadius, Fonts } from '../../constants/Theme';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { theme, setTheme } = useSacredTheme();
  const { user, profile, subscriptionStatus, signOut } = useAuthStore();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth');
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Seeker';
  const displayEmail = user?.email || 'Not signed in';
  const isPremium = subscriptionStatus === 'active';

  const renderSettingRow = (IconComponent: any, label: string, onPress: () => void) => (
    <TouchableOpacity 
      style={[styles.settingRow, { borderBottomColor: theme.border }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingRowLeft}>
        <IconComponent size={20} color={theme.textMuted} />
        <Text style={[styles.settingRowText, { color: theme.text }]}>{label}</Text>
      </View>
      <ChevronRight size={20} color={theme.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: theme.card, shadowColor: theme.text }]}>
          <View style={[styles.avatarRing, { backgroundColor: theme.accentBg }]}>
            {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
              <Image source={{ uri: profile?.avatar_url || user?.user_metadata?.avatar_url }} style={styles.avatarImage} />
            ) : (
              <User size={40} color={theme.accentText} />
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.text, fontFamily: Fonts.serif }]} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={[styles.userEmail, { color: theme.textMuted }]} numberOfLines={1}>
              {displayEmail}
            </Text>
            <TouchableOpacity 
              style={[styles.editBtn, { borderColor: theme.border }]}
              onPress={() => router.push('/edit-profile')}
            >
              <Text style={[styles.editBtnText, { color: theme.text }]}>EDIT PROFILE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upgrade Banner */}
        {!isPremium && (
          <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/paywall')}>
            <LinearGradient
              colors={['#FDE68A', '#F59E0B']}
              style={styles.premiumBanner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Crown size={96} color="#000" opacity={0.1} style={styles.bannerIcon} />
              <Text style={[styles.bannerTitle, { fontFamily: Fonts.serif }]}>Divine Premium</Text>
              <Text style={styles.bannerSub}>Unlock all stotras, downloads, and ad-free listening.</Text>
              <View style={styles.bannerBtn}>
                <Text style={styles.bannerBtnText}>Start 7-Day Free Trial</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Theme Selection */}
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>THEME</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themeScroll}>
          {['dawn', 'dhyana', 'temple', 'bhakti', 'vedic', 'amrit', 'dark'].map((t) => (
            <TouchableOpacity 
              key={t}
              style={[
                styles.themeChip, 
                { backgroundColor: theme.card, borderColor: theme.border }
              ]}
              onPress={() => setTheme(t as any)}
            >
              <Text style={[styles.themeChipText, { color: theme.text }]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Preferences */}
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>PREFERENCES</Text>
        <View style={[styles.settingsCard, { backgroundColor: theme.card }]}>
          {renderSettingRow(Settings, 'General Settings', () => router.push('/settings'))}
          {renderSettingRow(Crown, 'Subscription', () => router.push('/paywall'))}
        </View>

        {/* Support & About */}
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>SUPPORT & ABOUT</Text>
        <View style={[styles.settingsCard, { backgroundColor: theme.card }]}>
          {renderSettingRow(Info, 'About Divine Stotra', () => router.push('/about'))}
          {renderSettingRow(Star, 'Rate the App', () => {})}
          {renderSettingRow(Share2, 'Share with Friends', () => {})}
        </View>

        {/* Sign Out */}
        <TouchableOpacity 
          style={styles.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

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
    paddingHorizontal: Spacing.xl,
    paddingBottom: 120,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius['3xl'],
    marginBottom: Spacing.xl,
    gap: Spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  avatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 74,
    height: 74,
    borderRadius: 37,
  },
  userInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  editBtnText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  premiumBanner: {
    padding: Spacing.xl,
    borderRadius: BorderRadius['3xl'],
    marginBottom: Spacing.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerIcon: {
    position: 'absolute',
    bottom: -16,
    right: -16,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#451A03', // amber-950
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 14,
    color: '#451A03',
    fontWeight: '500',
    opacity: 0.9,
    marginBottom: 16,
    paddingRight: 40,
  },
  bannerBtn: {
    backgroundColor: '#451A03',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: BorderRadius.xl,
    alignSelf: 'flex-start',
  },
  bannerBtnText: {
    color: '#FFFBEB',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
    marginLeft: 8,
  },
  settingsCard: {
    borderRadius: BorderRadius['3xl'],
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingRowText: {
    fontSize: 16,
    fontWeight: '500',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: BorderRadius['2xl'],
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    marginTop: Spacing.md,
  },
  signOutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },
  themeScroll: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  themeChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  themeChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
