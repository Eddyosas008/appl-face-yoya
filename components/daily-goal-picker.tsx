/**
 * DailyGoalPicker — Sélecteur d'objectif quotidien de méditation.
 *
 * Affiche une rangée de boutons pour choisir la durée cible (5 à 60 min).
 * Persiste localement via AsyncStorage et en DB si l'utilisateur est connecté.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useThemeContext } from "@/lib/theme-provider";
import { useUser } from "@/lib/user-context";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import * as Haptics from "expo-haptics";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ─── Constantes ───────────────────────────────────────────────────────────────

const GOAL_OPTIONS = [5, 10, 15, 20, 30, 45, 60] as const;
type GoalOption = (typeof GOAL_OPTIONS)[number];

const STORAGE_KEY = "yoya_daily_goal_minutes";

// ─── Composant ────────────────────────────────────────────────────────────────

export function DailyGoalPicker() {
  const { isDark } = useThemeContext();
  const { profile, updateProfile } = useUser();
  const { isAuthenticated } = useAuth();

  const GOLD  = isDark ? "#C8A96E" : "#8B6914";
  const TEXT1 = isDark ? "#F0EBE0" : "#1C1410";
  const TEXT2 = isDark ? "rgba(240,235,224,0.55)" : "rgba(60,40,20,0.55)";
  const CARD  = isDark ? "#2A2540" : "#FFFFFF";
  const SURF  = isDark ? "#201C38" : "#F5F0E8";
  const BORD  = isDark ? "rgba(200,169,110,0.25)" : "rgba(139,105,20,0.20)";

  const currentGoal = (profile?.preferredDuration ?? 10) as GoalOption;
  const [saving, setSaving] = useState(false);

  const updateGoalMutation = trpc.profile.updateGoal.useMutation();

  const handleSelect = useCallback(async (minutes: GoalOption) => {
    if (minutes === currentGoal || saving) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setSaving(true);
    try {
      // 1. Persistance locale immédiate
      await AsyncStorage.setItem(STORAGE_KEY, String(minutes));
      await updateProfile({ preferredDuration: minutes });

      // 2. Sync DB si connecté
      if (isAuthenticated) {
        await updateGoalMutation.mutateAsync({ minutes });
      }
    } catch (err) {
      console.warn("[DailyGoalPicker] Failed to save goal:", err);
    } finally {
      setSaving(false);
    }
  }, [currentGoal, saving, updateProfile, isAuthenticated, updateGoalMutation]);

  return (
    <View style={[s.card, { backgroundColor: CARD, borderColor: BORD }]}>
      {/* En-tête */}
      <View style={s.header}>
        <Text style={s.icon}>🎯</Text>
        <View style={{ flex: 1 }}>
          <Text style={[s.title, { color: TEXT1 }]}>Objectif quotidien</Text>
          <Text style={[s.subtitle, { color: TEXT2 }]}>
            {currentGoal} min · {currentGoal < 15 ? "Débutant" : currentGoal < 30 ? "Régulier" : "Avancé"}
          </Text>
        </View>
        {saving && <ActivityIndicator size="small" color={GOLD} />}
      </View>

      {/* Grille de boutons */}
      <View style={[s.grid, { borderTopColor: BORD }]}>
        {GOAL_OPTIONS.map((min) => {
          const active = min === currentGoal;
          return (
            <Pressable
              key={min}
              style={({ pressed }) => [
                s.optBtn,
                {
                  backgroundColor: active ? GOLD : SURF,
                  borderColor: active ? GOLD : BORD,
                  opacity: pressed ? 0.75 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                },
              ]}
              onPress={() => handleSelect(min)}
            >
              <Text style={[s.optMin, { color: active ? "#1C1410" : TEXT1 }]}>
                {min}
              </Text>
              <Text style={[s.optLabel, { color: active ? "#3A2A10" : TEXT2 }]}>
                min
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Barre de progression visuelle de l'objectif */}
      <View style={[s.progressRow, { borderTopColor: BORD }]}>
        <View style={[s.progressTrack, { backgroundColor: SURF }]}>
          {GOAL_OPTIONS.map((min) => {
            const pct = (min / 60) * 100;
            const active = min <= currentGoal;
            return (
              <View
                key={min}
                style={[
                  s.progressSegment,
                  {
                    width: `${100 / GOAL_OPTIONS.length}%`,
                    backgroundColor: active ? GOLD : "transparent",
                    opacity: active ? (min === currentGoal ? 1 : 0.45) : 0,
                  },
                ]}
              />
            );
          })}
        </View>
        <Text style={[s.progressLabel, { color: TEXT2 }]}>
          {currentGoal < 15
            ? "Commencez doucement, chaque minute compte."
            : currentGoal < 30
            ? "Un bon rythme pour ancrer l'habitude."
            : "Pratique profonde — excellent engagement !"}
        </Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 0.5,
    overflow: "hidden",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 18,
  },
  icon: { fontSize: 22 },
  title: { fontSize: 15, fontWeight: "600", letterSpacing: 0.2 },
  subtitle: { fontSize: 12, marginTop: 2 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 16,
    paddingTop: 14,
    borderTopWidth: 0.5,
  },
  optBtn: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 0.5,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 52,
    flex: 1,
  },
  optMin: { fontSize: 18, fontWeight: "700", lineHeight: 22 },
  optLabel: { fontSize: 10, fontWeight: "500", marginTop: 1 },

  progressRow: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 0.5,
    gap: 8,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    flexDirection: "row",
    overflow: "hidden",
  },
  progressSegment: {
    height: "100%",
  },
  progressLabel: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
});
