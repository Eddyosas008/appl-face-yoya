import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, View, StyleSheet, Animated as RNAnimated } from "react-native";
import { useRef, useEffect, useState } from "react";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";

// ─── Palette SomnioPax v3 ─────────────────────────────────────────────────
const BG          = '#03020F';
const GOLD        = '#C9A84C';
const GOLD_LIGHT  = '#E8C97A';
const LAVENDER_DIM = 'rgba(184,174,255,0.30)';
const PILL_BG     = 'rgba(255,255,255,0.055)';
const PILL_BORDER = 'rgba(180,160,255,0.14)';
const INDICATOR_BG = 'rgba(201,168,76,0.18)';
const INDICATOR_BORDER = 'rgba(201,168,76,0.25)';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 16 : Math.max(insets.bottom, 12);
  // Floating pill — hauteur fixe, pas de tab bar native standard
  const tabBarHeight = 64 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: LAVENDER_DIM,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          bottom: bottomPadding,
          left: 18,
          right: 18,
          height: 56,
          borderRadius: 30,
          backgroundColor: PILL_BG,
          borderWidth: 1,
          borderColor: PILL_BORDER,
          // Glassmorphisme
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 32,
          elevation: 16,
          // Séparation du bord haut
          borderTopWidth: 0,
          paddingBottom: 0,
          paddingTop: 0,
        },
        tabBarLabelStyle: {
          fontSize: 8,
          fontWeight: '500',
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          marginTop: 1,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrap}>
              {focused && <View style={styles.activeGlow} />}
              <IconSymbol size={20} name="house.fill" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explorer",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrap}>
              {focused && <View style={styles.activeGlow} />}
              <IconSymbol size={20} name="sparkles" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="journeys"
        options={{
          title: "Programmes",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrap}>
              {focused && <View style={styles.activeGlow} />}
              <IconSymbol size={20} name="moon.fill" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrap}>
              {focused && <View style={styles.activeGlow} />}
              <IconSymbol size={20} name="book.fill" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrap}>
              {focused && <View style={styles.activeGlow} />}
              <IconSymbol size={20} name="person.fill" color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 24,
    position: 'relative',
  },
  activeGlow: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(201,168,76,0.18)',
    // Halo radial doré
    shadowColor: GOLD,
    shadowRadius: 12,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 0 },
  },
});
