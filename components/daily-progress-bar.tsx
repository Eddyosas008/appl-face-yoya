/**
 * DailyProgressBar — Widget de progression quotidienne sur la Home.
 *
 * Affiche les minutes méditées aujourd'hui vs l'objectif configuré.
 * Utilise les sessions locales si non connecté, sinon la route tRPC.
 */

import { useThemeContext } from "@/lib/theme-provider";
import { useUser } from "@/lib/user-context";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ─── Composant ────────────────────────────────────────────────────────────────

export function DailyProgressBar() {
  const { isDark } = useThemeContext();
  const { profile, sessionHistory } = useUser();
  const { isAuthenticated } = useAuth();

  const GOLD  = isDark ? "#C8A96E" : "#8B6914";
  const TEXT1 = isDark ? "#F0EBE0" : "#1C1410";
  const TEXT2 = isDark ? "rgba(240,235,224,0.55)" : "rgba(60,40,20,0.55)";
  const CARD  = isDark ? "#2A2540" : "#FFFFFF";
  const SURF  = isDark ? "#201C38" : "#F5F0E8";
  const BORD  = isDark ? "rgba(200,169,110,0.25)" : "rgba(139,105,20,0.20)";
  const GREEN = isDark ? "#4ADE80" : "#16A34A";

  const goalMinutes = profile?.preferredDuration ?? 10;

  // ── Calcul local des minutes du jour ──────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const localTodayMin = sessionHistory
    .filter((s) => new Date(s.completedAt) >= today)
    .reduce((acc, s) => acc + (s.duration ?? 0), 0);

  // ── Données DB si connecté ─────────────────────────────────────────────────
  const todayQuery = trpc.profile.todayProgress.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const todayMinutes = isAuthenticated
    ? (todayQuery.data?.todayMinutes ?? localTodayMin)
    : localTodayMin;
  const effectiveGoal = isAuthenticated
    ? (todayQuery.data?.goalMinutes ?? goalMinutes)
    : goalMinutes;

  const pct = Math.min(todayMinutes / effectiveGoal, 1);
  const done = pct >= 1;

  // ── Animation de la barre ─────────────────────────────────────────────────
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: pct,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const barColor = done ? GREEN : GOLD;

  return (
    <Pressable
      style={({ pressed }) => [
        s.card,
        { backgroundColor: CARD, borderColor: BORD, opacity: pressed ? 0.9 : 1 },
      ]}
      onPress={() => router.push("/ambient" as never)}
    >
      {/* En-tête */}
      <View style={s.header}>
        <Text style={s.icon}>{done ? "🏆" : "🧘"}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[s.title, { color: TEXT1 }]}>
            {done ? "Objectif atteint !" : "Progression du jour"}
          </Text>
          <Text style={[s.subtitle, { color: TEXT2 }]}>
            {todayMinutes} / {effectiveGoal} min
          </Text>
        </View>
        <View style={[s.badge, { backgroundColor: done ? GREEN + "22" : GOLD + "22" }]}>
          <Text style={[s.badgeText, { color: barColor }]}>
            {Math.round(pct * 100)}%
          </Text>
        </View>
      </View>

      {/* Barre de progression */}
      <View style={[s.track, { backgroundColor: SURF }]}>
        <Animated.View
          style={[
            s.fill,
            {
              backgroundColor: barColor,
              width: animWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>

      {/* Message contextuel */}
      <Text style={[s.hint, { color: TEXT2 }]}>
        {done
          ? "Bravo ! Votre pratique d'aujourd'hui est complète."
          : todayMinutes === 0
          ? `Commencez votre séance — objectif : ${effectiveGoal} min`
          : `Encore ${effectiveGoal - todayMinutes} min pour atteindre votre objectif`}
      </Text>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 0.5,
    padding: 18,
    gap: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icon: { fontSize: 22 },
  title: { fontSize: 15, fontWeight: "600", letterSpacing: 0.2 },
  subtitle: { fontSize: 12, marginTop: 2 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 13, fontWeight: "700" },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
  },
  hint: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
});
