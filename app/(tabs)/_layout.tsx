// ============================================================
// Tabs Layout — Sacred bottom tab navigation
// ============================================================

import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSacredTheme } from '../../contexts/ThemeContext';
import { Spacing } from '../../constants/Theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MiniPlayer from '../../components/MiniPlayer';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];
type MaterialCommunityIconsName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

function TabBarIcon(props: {
  name: IoniconsName;
  color: string;
  size?: number;
}) {
  return <Ionicons size={props.size || 24} style={{ marginBottom: -2 }} {...props} />;
}

function MCIcon(props: {
  name: MaterialCommunityIconsName;
  color: string;
  size?: number;
}) {
  return <MaterialCommunityIcons size={props.size || 24} style={{ marginBottom: -2 }} {...props} />;
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
          tabBarStyle: {
            backgroundColor: theme.tabBar,
            borderTopColor: theme.tabBarBorder,
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 88 : 65,
            paddingBottom: Platform.OS === 'ios' ? 28 : 8,
            paddingTop: 8,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            letterSpacing: 0.3,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
          }}
        />
        <Tabs.Screen
          name="japamala"
          options={{
            title: 'Japamala',
            tabBarIcon: ({ color }) => <MCIcon name="meditation" color={color} size={26} />,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
            tabBarIcon: ({ color }) => <TabBarIcon name="library" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <TabBarIcon name="person-circle" color={color} />,
          }}
        />
      </Tabs>
      <MiniPlayer />
    </View>
  );
}
