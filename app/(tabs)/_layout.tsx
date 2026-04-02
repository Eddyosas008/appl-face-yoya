import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, View, StyleSheet } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

// Couleurs Sanctuaire du Sommeil
const NIGHT_BG    = '#07051C';
const GOLD        = '#D4A853';
const LAVENDER    = 'rgba(180,168,220,0.45)';
const GLASS_BG    = 'rgba(12,8,40,0.96)';
const GLASS_BORDER = 'rgba(180,168,220,0.10)';

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 14 : Math.max(insets.bottom, 10);
  const tabBarHeight = 58 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: LAVENDER,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 10,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: GLASS_BG,
          borderTopColor: GLASS_BORDER,
          borderTopWidth: 0.5,
          // Ombre douce vers le haut
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '500',
          marginTop: 2,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
        },

      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
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
            <View style={styles.iconWrapper}>
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
            <View style={styles.iconWrapper}>
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
            <View style={styles.iconWrapper}>
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
            <View style={styles.iconWrapper}>
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
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 28,
  },
  activeGlow: {
    position: 'absolute',
    bottom: -4,
    width: 20,
    height: 2,
    borderRadius: 1,
    backgroundColor: GOLD,
    shadowColor: GOLD,
    shadowRadius: 6,
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
  },
});
