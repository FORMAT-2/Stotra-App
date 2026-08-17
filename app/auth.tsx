import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useAuthStore } from '../store/authStore';
import { useSacredTheme } from '../contexts/ThemeContext';
import { SacredColors, Spacing, BorderRadius, FontSizes } from '../constants/Theme';

// Ensure the auth session completes properly when returning from the browser
WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const router = useRouter();
  const { theme, isDark } = useSacredTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  // Helper to trigger OAuth sign in
  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    try {
      const redirectUrl = Linking.createURL('/auth');
      
      console.log('EXACT REDIRECT URL TO WHITELIST IN SUPABASE:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true, // Crucial for React Native!
        },
      });
      if (error) throw error;
      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        if (result.type === 'success' && result.url) {
          // Parse the URL params manually if needed, or rely on Supabase deep linking
          console.log("Success returned URL: ", result.url);
          // Extract tokens
          const urlObj = new URL(result.url.replace('#', '?'));
          const access_token = urlObj.searchParams.get('access_token');
          const refresh_token = urlObj.searchParams.get('refresh_token');
          
          if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
            
            // Check subscription status
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { data: profile } = await supabase.from('user_profiles').select('subscription_status').eq('id', user.id).single();
              if (profile?.subscription_status === 'active') {
                router.replace('/(tabs)');
              } else {
                router.replace('/paywall');
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error(`${provider} Login Error:`, error);
      Alert.alert('Authentication Error', error.message);
    }
  };

  async function handleAuth() {
    console.log("handleAuth triggered with email:", email, "isLogin:", isLogin);
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    if (!isLogin) {
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;
      if (!passwordRegex.test(password)) {
        Alert.alert('Invalid Password', 'Password must be at least 8 characters long and include a letter, a number, and a symbol.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        console.log("Attempting sign in...");
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        console.log("Sign in result:", { data, error });
        if (error) throw error;
        
        // Check subscription status
        const { data: profile } = await supabase.from('user_profiles').select('subscription_status').eq('id', data.user.id).single();
        if (profile?.subscription_status === 'active') {
          router.replace('/(tabs)');
        } else {
          router.replace('/paywall');
        }
      } else {
        console.log("Attempting sign up...");
        const { data, error } = await supabase.auth.signUp({ email, password });
        console.log("Sign up result:", { data, error });
        if (error) throw error;
        
        // If email confirmation is disabled, user is logged in automatically
        if (data.session) {
          router.replace('/paywall');
        } else {
          Alert.alert('Success', 'Account created! Please confirm your email then log in.');
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      console.error('Authentication Error:', error);
      Alert.alert('Authentication Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[theme.goldGradientStart, theme.goldGradientEnd, theme.background]}
        style={styles.headerGradient}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🪔</Text>
              <Text style={[styles.title, { color: theme.text }]}>Divine Stotra</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {isLogin ? 'Sign in to access your saved stotras' : 'Create an account to save stotras'}
              </Text>
            </View>

            <View style={styles.form}>
              <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Ionicons name="mail-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Email"
                  placeholderTextColor={theme.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Password"
                  placeholderTextColor={theme.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.textTertiary} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.mainButton, { backgroundColor: SacredColors.gold[500] }]} 
                onPress={handleAuth}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.mainButtonText}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.switchModeButton}
                onPress={() => setIsLogin(!isLogin)}
              >
                <Text style={[styles.switchModeText, { color: theme.accent }]}>
                  {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                </Text>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <Text style={[styles.dividerText, { color: theme.textTertiary }]}>or continue with</Text>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
              </View>

              <View style={styles.socialButtons}>
                <TouchableOpacity 
                  style={[styles.socialButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => handleOAuthLogin('google')}
                >
                  <Ionicons name="logo-google" size={20} color={theme.text} />
                  <Text style={[styles.socialButtonText, { color: theme.text }]}>Google</Text>
                </TouchableOpacity>

                {Platform.OS === 'ios' && (
                  <TouchableOpacity 
                    style={[styles.socialButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => handleOAuthLogin('apple')}
                  >
                    <Ionicons name="logo-apple" size={20} color={theme.text} />
                    <Text style={[styles.socialButtonText, { color: theme.text }]}>Apple</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing['4xl'],
  },
  logoEmoji: {
    fontSize: 72,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes['4xl'],
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.md,
    textAlign: 'center',
  },
  form: {
    gap: Spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 56,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
  },
  mainButton: {
    height: 56,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  mainButtonText: {
    color: '#FFF',
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  switchModeButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  switchModeText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: FontSizes.sm,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  socialButton: {
    flex: 1,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  socialButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
