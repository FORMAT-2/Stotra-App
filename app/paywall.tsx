import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '../store/authStore';
import { useSacredTheme } from '../contexts/ThemeContext';
import { SacredColors, Spacing, BorderRadius, FontSizes } from '../constants/Theme';
import { supabase } from '../lib/supabase';

export default function PaywallScreen() {
  const router = useRouter();
  const { theme } = useSacredTheme();
  const { user, fetchProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // We fetch a fresh session just in case
  const handleSubscribe = async () => {
    if (!user) {
      Alert.alert("Error", "Please sign in first.");
      router.replace('/auth');
      return;
    }

    setLoading(true);
    try {
      // Create Razorpay Subscription via Next.js API
      // We assume the admin API is running at EXPO_PUBLIC_API_URL or similar, 
      // but since we are generating an APK, we'll use a placeholder or the actual deployed URL if available.
      // For now, we will construct the backend URL using a known base or EXPO_PUBLIC_SUPABASE_URL domain equivalent if hosted on Vercel.
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'; // Update this before build!
      
      const response = await fetch(`${API_URL}/api/razorpay/create-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      // Open Razorpay Checkout Link
      if (data.short_url) {
        await WebBrowser.openBrowserAsync(data.short_url);
        // After browser closes, fetch profile to see if it updated
        await fetchProfile(user.id);
        const state = useAuthStore.getState();
        if (state.subscriptionStatus === 'active') {
          Alert.alert("Success", "Welcome to Premium!");
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Payment Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Let them browse the app freely, but they can't play audio
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[theme.goldGradientStart, theme.goldGradientEnd, theme.background]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Close Button */}
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color={theme.textSecondary} />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.emoji}>🪔</Text>
              <Text style={[styles.title, { color: theme.text }]}>Unlock Divine Stotra Premium</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Experience the complete sacred library, unlimited audio playback, and synchronized meanings without interruptions.
              </Text>
            </View>

            <View style={[styles.pricingCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.pricingTrial, { color: SacredColors.gold[500] }]}>7-Day Trial for ₹1</Text>
              <Text style={[styles.pricingThen, { color: theme.textSecondary }]}>Then ₹99 / month</Text>
              
              <View style={styles.features}>
                {[
                  'Unlimited Audio Chanting Playback',
                  'Synchronized Verses & Meanings',
                  'Offline Downloads for Travel',
                  'Support the Developers'
                ].map((feature, i) => (
                  <View key={i} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color={SacredColors.gold[500]} />
                    <Text style={[styles.featureText, { color: theme.text }]}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.subscribeBtn, { backgroundColor: SacredColors.gold[500] }]}
              onPress={handleSubscribe}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.subscribeText}>Start 7-Day Trial (₹1)</Text>
              )}
            </TouchableOpacity>

            <Text style={[styles.disclaimer, { color: theme.textTertiary }]}>
              You can cancel anytime before the trial ends to avoid being charged ₹99/month. Secure payments via Razorpay.
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  closeBtn: {
    alignSelf: 'flex-start',
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes['3xl'],
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  pricingCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    marginBottom: Spacing['3xl'],
    alignItems: 'center',
  },
  pricingTrial: {
    fontSize: FontSizes['3xl'],
    fontWeight: '800',
    marginBottom: 4,
  },
  pricingThen: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    marginBottom: Spacing.xl,
  },
  features: {
    width: '100%',
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  subscribeBtn: {
    height: 56,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  subscribeText: {
    color: '#FFF',
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
});
