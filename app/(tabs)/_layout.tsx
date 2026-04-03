import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, View, StyleSheet } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeContext } from "@/lib/theme-provider";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 16 : Math.max(insets.bottom, 12);
  const { isDark } = useThemeContext();

  // ── Palette dynamique ─────────────────────────────────────────────────────
  const GOLD        = isDark ? '#C9A84C' : '#B8922E';
  const GOLD_GLOW   = isDark ? 'rgba(201,168,76,0.22)' : 'rgba(184,146,46,0.20)';
  const PILL_BG     = isDark ? '#0D0B22' : '#FAFAF8';
  const PILL_BORDER = isDark ? 'rgba(201,168,76,0.28)' : 'rgba(184,146,46,0.30)';
  const INACTIVE    = isDark ? 'rgba(220,215,255,0.45)' : 'rgba(120,100,160,0.55)';
  const SHADOW_CLR  = isDark ? '#000' : '#8B7BAB';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: INACTIVE,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          bottom: bottomPadding,
          left: 16,
          right: 16,
          height: 60,
          borderRadius: 32,
          backgroundColor: PILL_BG,
          borderWidth: 1,
          borderColor: PILL_BORDER,
          shadowColor: SHADOW_CLR,
          shadowOffset: { width: 0, height: isDark ? 12 : 6 },
          shadowOpacity: isDark ? 0.55 : 0.15,
          shadowRadius: isDark ? 28 : 16,
          elevation: isDark ? 20 : 8,
          borderTopWidth: 0,
          paddingBottom: 0,
          paddingTop: 0,
        },
        tabBarLabelStyle: {
          fontSize: 8,
          fontWeight: '600',
          letterSpacing: 0.7,
          textTransform: 'uppercase',
          marginTop: 2,
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
              {focused && (
                <View style={[styles.activeGlow, { backgroundColor: GOLD_GLOW, shadowColor: GOLD }]} />
              )}
              <IconSymbol size={22} name="house.fill" color={color} />
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
              {focused && (
                <View style={[styles.activeGlow, { backgroundColor: GOLD_GLOW, shadowColor: GOLD }]} />
              )}
              <IconSymbol size={22} name="sparkles" color={color} />
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
              {focused && (
                <View style={[styles.activeGlow, { backgroundColor: GOLD_GLOW, shadowColor: GOLD }]} />
              )}
              <IconSymbol size={22} name="moon.fill" color={color} />
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
              {focused && (
                <View style={[styles.activeGlow, { backgroundColor: GOLD_GLOW, shadowColor: GOLD }]} />
              )}
              <IconSymbol size={22} name="book.fill" color={color} />
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
              {focused && (
                <View style={[styles.activeGlow, { backgroundColor: GOLD_GLOW, shadowColor: GOLD }]} />
              )}
              <IconSymbol size={22} name="person.fill" color={color} />
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
    width: 36,
    height: 26,
    position: 'relative',
  },
  activeGlow: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    shadowRadius: 14,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
  },
});
