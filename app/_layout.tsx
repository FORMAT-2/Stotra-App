// ============================================================
// Root Layout — Font loading, theme provider, splash screen
// ============================================================

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { SacredThemeProvider, useSacredTheme } from '../contexts/ThemeContext';
import MiniPlayer from '../components/MiniPlayer';

export {
  ErrorBoundary,
} from 'expo-router';

import { useRouter } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isDark, theme } = useSacredTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="player"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
      <MiniPlayer />
    </>
  );
}

import { audioService } from '../services/AudioService';
import { useDataStore } from '../store/dataStore';
import { 
  PlayfairDisplay_600SemiBold, 
  PlayfairDisplay_700Bold 
} from '@expo-google-fonts/playfair-display';
import { 
  PlusJakartaSans_400Regular, 
  PlusJakartaSans_500Medium, 
  PlusJakartaSans_700Bold 
} from '@expo-google-fonts/plus-jakarta-sans';

export default function RootLayout() {
  const router = useRouter();
  const [loaded, error] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_700Bold,
    'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      audioService.init();
      useDataStore.getState().fetchData();
      
      const { useAuthStore } = require('../store/authStore');
      const { useFavoritesStore } = require('../store/favoritesStore');
      
      useAuthStore.getState().initialize().then(() => {
        useFavoritesStore.getState().fetchFavorites();
        
        // Auth Guard: If not logged in, redirect to auth
        const state = useAuthStore.getState();
        if (!state.user) {
          router.replace('/auth');
        } else if (state.subscriptionStatus !== 'active') {
          // If logged in but not active, show paywall on startup
          router.replace('/paywall');
        }
      });
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SacredThemeProvider>
      <RootLayoutNav />
    </SacredThemeProvider>
  );
}
