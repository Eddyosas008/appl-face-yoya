import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useUser } from "@/lib/user-context";

export default function ProgramDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { isAuthenticated } = useUser();
  const utils = trpc.useUtils();

  const { data: program, isLoading } = trpc.programs.get.useQuery({ slug: slug ?? "" }, {
    enabled: !!slug,
  });

  const { data: progress, refetch: refetchProgress } = trpc.programs.progress.useQuery(
    { programSlug: slug ?? "" },
    { enabled: !!isAuthenticated && !!slug }
  );

  const startMutation = trpc.programs.start.useMutation({
    onSuccess: () => {
      refetchProgress();
      utils.programs.myPrograms.invalidate();
    },
  });

  const completeDayMutation = trpc.programs.completeDay.useMutation({
    onSuccess: () => {
      refetchProgress();
    },
  });

  const completedDays: number[] = progress ? JSON.parse(progress.completedDays || "[]") : [];
  const currentDay = progress?.currentDay ?? 1;

  const handleStart = () => {
    if (!isAuthenticated) {
      Alert.alert("Connexion requise", "Connectez-vous pour démarrer un programme et suivre votre progression.", [
        { text: "Annuler", style: "cancel" },
        { text: "Se connecter", onPress: () => router.push("/(auth)/signin" as never) },
      ]);
      return;
    }
    startMutation.mutate({ programSlug: slug ?? "" });
  };

  const handleDayPress = (dayNumber: number) => {
    if (!progress) {
      handleStart();
      return;
    }
    router.push(`/program-day/${slug}/${dayNumber}` as never);
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#A78BFA" size="large" />
          <Text style={styles.loadingText}>Chargement du programme...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!program) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Programme introuvable</Text>
        </View>
      </ScreenContainer>
    );
  }

  const progressPct = progress
    ? completedDays.length / program.durationDays
    : 0;

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <LinearGradient
          colors={[program.coverColor ?? "#1E1B4B", program.coverColor2 ?? "#312E81"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>

          <Text style={styles.heroEmoji}>{program.emoji}</Text>
          <Text style={styles.heroTitle}>{program.title}</Text>
          <Text style={styles.heroSubtitle}>{program.subtitle ?? ""}</Text>

          <View style={styles.heroBadges}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>📅 {program.durationDays} jours</Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>
                {program.level === "beginner" ? "🌱 Débutant" : program.level === "intermediate" ? "🌿 Intermédiaire" : "🌳 Expert"}
              </Text>
            </View>
            {program.isPremium && (
              <View style={[styles.heroBadge, styles.premiumHeroBadge]}>
                <Text style={styles.heroBadgeText}>✨ Premium</Text>
              </View>
            )}
          </View>

          {/* Progress if started */}
          {progress && (
            <View style={styles.heroProgress}>
              <View style={styles.heroProgressHeader}>
                <Text style={styles.heroProgressLabel}>
                  {progress.isCompleted ? "✅ Programme terminé !" : `Jour ${currentDay} / ${program.durationDays}`}
                </Text>
                <Text style={styles.heroProgressPct}>{Math.round(progressPct * 100)}%</Text>
              </View>
              <View style={styles.heroProgressBar}>
                <View style={[styles.heroProgressFill, { width: `${progressPct * 100}%` as unknown as number }]} />
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos de ce programme</Text>
          <Text style={styles.description}>{program.description}</Text>
        </View>

        {/* Start button */}
        {!progress && (
          <View style={styles.startSection}>
            <TouchableOpacity
              style={styles.startBtn}
              onPress={handleStart}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#7C3AED", "#A855F7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startBtnGradient}
              >
                {startMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.startBtnText}>
                    🌙 Commencer le programme
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.startNote}>
              👥 {program.totalEnrollments} personnes ont déjà commencé ce programme
            </Text>
          </View>
        )}

        {/* Days list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {progress ? "Votre progression" : "Contenu du programme"}
          </Text>

          {program.days.map((day) => {
            const isDone = completedDays.includes(day.dayNumber);
            const isCurrent = progress && day.dayNumber === currentDay;
            const isLocked = progress ? day.dayNumber > currentDay : day.dayNumber > 1;

            return (
              <TouchableOpacity
                key={day.id}
                style={[
                  styles.dayCard,
                  isDone && styles.dayCardDone,
                  isCurrent && styles.dayCardCurrent,
                  isLocked && !isDone && styles.dayCardLocked,
                ]}
                onPress={() => handleDayPress(day.dayNumber)}
                activeOpacity={0.8}
              >
                <View style={styles.dayNumber}>
                  {isDone ? (
                    <Text style={styles.dayNumberDone}>✓</Text>
                  ) : (
                    <Text style={[styles.dayNumberText, isCurrent && styles.dayNumberTextCurrent]}>
                      {day.dayNumber}
                    </Text>
                  )}
                </View>
                <View style={styles.dayContent}>
                  <Text style={[styles.dayTitle, isDone && styles.dayTitleDone]}>
                    {day.title}
                  </Text>
                  {day.theme && (
                    <Text style={styles.dayTheme}>{day.theme}</Text>
                  )}
                  <View style={styles.dayMeta}>
                    {day.meditationSlug && (
                      <Text style={styles.dayMetaItem}>🧘 Méditation</Text>
                    )}
                    {day.breathingExercise && (
                      <Text style={styles.dayMetaItem}>💨 Respiration</Text>
                    )}
                    <Text style={styles.dayMetaItem}>⏱ {day.estimatedMinutes} min</Text>
                  </View>
                </View>
                {isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Aujourd'hui</Text>
                  </View>
                )}
                {isLocked && !isDone && (
                  <Text style={styles.lockIcon}>🔒</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 100 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#9CA3AF", marginTop: 12, fontSize: 14 },
  errorText: { color: "#EF4444", fontSize: 16 },
  hero: { padding: 24, paddingTop: 16 },
  backBtn: { marginBottom: 16 },
  backBtnText: { color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: "600" },
  heroEmoji: { fontSize: 48, marginBottom: 8 },
  heroTitle: { fontSize: 26, fontWeight: "800", color: "#FFFFFF", marginBottom: 4 },
  heroSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 16, lineHeight: 20 },
  heroBadges: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  heroBadge: {
    backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 12,
  },
  premiumHeroBadge: { backgroundColor: "rgba(167,139,250,0.3)" },
  heroBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  heroProgress: { marginTop: 4 },
  heroProgressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  heroProgressLabel: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "600" },
  heroProgressPct: { color: "#C4B5FD", fontSize: 13, fontWeight: "700" },
  heroProgressBar: { height: 8, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 4, overflow: "hidden" },
  heroProgressFill: { height: "100%", backgroundColor: "#A78BFA", borderRadius: 4 },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#E2D9F3", marginBottom: 12 },
  description: { fontSize: 14, color: "#9CA3AF", lineHeight: 22 },
  startSection: { paddingHorizontal: 20, paddingTop: 20 },
  startBtn: { borderRadius: 16, overflow: "hidden", marginBottom: 10 },
  startBtnGradient: { paddingVertical: 16, alignItems: "center" },
  startBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  startNote: { textAlign: "center", color: "#6B7280", fontSize: 12 },
  dayCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#1F1B35", borderRadius: 16, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: "#3B3060",
  },
  dayCardDone: { backgroundColor: "#1A2E1A", borderColor: "#22C55E" },
  dayCardCurrent: { backgroundColor: "#2D1B69", borderColor: "#7C3AED", borderWidth: 2 },
  dayCardLocked: { opacity: 0.5 },
  dayNumber: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#3B3060", alignItems: "center", justifyContent: "center",
    marginRight: 12,
  },
  dayNumberText: { color: "#A78BFA", fontSize: 14, fontWeight: "800" },
  dayNumberTextCurrent: { color: "#FFFFFF" },
  dayNumberDone: { color: "#22C55E", fontSize: 16, fontWeight: "800" },
  dayContent: { flex: 1 },
  dayTitle: { color: "#E2D9F3", fontSize: 14, fontWeight: "700", marginBottom: 2 },
  dayTitleDone: { color: "#86EFAC" },
  dayTheme: { color: "#6B7280", fontSize: 12, marginBottom: 4 },
  dayMeta: { flexDirection: "row", gap: 8 },
  dayMetaItem: { color: "#6B7280", fontSize: 11 },
  currentBadge: {
    backgroundColor: "#7C3AED", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  currentBadgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },
  lockIcon: { fontSize: 16 },
});
