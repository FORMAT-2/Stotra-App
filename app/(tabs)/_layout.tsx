// ============================================================
// Tabs Layout — Sacred bottom tab navigation
// ============================================================

import React from 'react';
import { Tabs } from 'expo-router';
import { View, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Compass, Search, CircleDot, Library, User } from 'lucide-react-native';

import { useSacredTheme } from '../../contexts/ThemeContext';
import MiniPlayer from '../../components/MiniPlayer';

function TabBarIcon({
  IconComponent,
  color,
  focused,
  theme
}: {
  IconComponent: any;
  color: string;
  focused: boolean;
  theme: any;
}) {
  return (
    <View style={styles.iconContainer}>
      {focused && (
        <View style={[styles.activeDot, { backgroundColor: theme.accent }]} />
      )}
      <IconComponent size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
    </View>
  );
}

export default function TabLayout() {
  const { theme, isDark } = useSacredTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.tabBarActive,
          tabBarInactiveTintColor: theme.tabBarInactive,
          headerShown: false,
          tabBarBackground: () => (
            Platform.OS === 'ios' ? (
              <BlurView intensity={isDark ? 50 : 80} style={StyleSheet.absoluteFill} tint={isDark ? "dark" : "light"} />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.tabBar }]} />
            )
          ),
          tabBarStyle: {
            backgroundColor: Platform.OS === 'ios' ? 'transparent' : theme.tabBar,
            borderTopColor: theme.border,
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 88 : 65,
            paddingBottom: Platform.OS === 'ios' ? 28 : 8,
            paddingTop: 8,
            elevation: 0,
            shadowOpacity: 0,
            position: 'absolute', // Needed for blur view to overlay
          },
          tabBarShowLabel: false, // Clean minimalist look as per typical Carousel UIs
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon IconComponent={Compass} color={color} focused={focused} theme={theme} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon IconComponent={Search} color={color} focused={focused} theme={theme} />
            ),
          }}
        />
        <Tabs.Screen
          name="japamala"
          options={{
            title: 'Japamala',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon IconComponent={CircleDot} color={color} focused={focused} theme={theme} />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon IconComponent={Library} color={color} focused={focused} theme={theme} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon IconComponent={User} color={color} focused={focused} theme={theme} />
            ),
          }}
        />
      </Tabs>
      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    top: -8,
  },
});
