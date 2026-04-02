import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, View, StyleSheet } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";

// ─── Palette SomnioPax v3 ─────────────────────────────────────────────────
const GOLD         = '#C9A84C';
const GOLD_GLOW    = 'rgba(201,168,76,0.22)';
// Fond de la pill : quasi-opaque pour éviter la transparence excessive
const PILL_BG      = '#0D0B22';          // indigo très sombre, presque opaque
const PILL_BORDER  = 'rgba(201,168,76,0.28)'; // bordure or subtile
const INACTIVE     = 'rgba(220,215,255,0.45)'; // lavande douce pour icônes inactives

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 16 : Math.max(insets.bottom, 12);

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
          // Fond sombre quasi-opaque — plus de transparence excessive
          backgroundColor: PILL_BG,
          borderWidth: 1,
          borderColor: PILL_BORDER,
          // Ombre portée pour détacher la pill du contenu
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.55,
          shadowRadius: 28,
          elevation: 20,
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
              {focused && <View style={styles.activeGlow} />}
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
              {focused && <View style={styles.activeGlow} />}
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
              {focused && <View style={styles.activeGlow} />}
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
              {focused && <View style={styles.activeGlow} />}
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
              {focused && <View style={styles.activeGlow} />}
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
    backgroundColor: GOLD_GLOW,
    shadowColor: GOLD,
    shadowRadius: 14,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
  },
});
