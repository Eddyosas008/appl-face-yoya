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

const LEVEL_LABELS: Record<string, { label: string; emoji: string }> = {
  beginner: { label: "Débutant", emoji: "🌱" },
  intermediate: { label: "Intermédiaire", emoji: "🌿" },
  advanced: { label: "Expert", emoji: "🌳" },
};

export default function ProgramDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { isAuthenticated } = useUser();
  const utils = trpc.useUtils();
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const { data: program, isLoading } = trpc.programs.get.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  const { data: progress, refetch: refetchProgress } = trpc.programs.progress.useQuery(
    { programSlug: slug ?? "" },
    { enabled: !!isAuthenticated && !!slug }
  );

  const startMutation = trpc.programs.start.useMutation({
    onSuccess: () => {
      refetchProgress();
      utils.programs.myPrograms.invalidate();
      // Naviguer vers le jour 1 après démarrage
      router.push(`/program-day/${slug}/1` as never);
    },
  });

  const completedDays: number[] = progress ? JSON.parse(progress.completedDays || "[]") : [];
  const currentDay = progress?.currentDay ?? 1;
  const progressPct = program ? completedDays.length / program.durationDays : 0;

  const handleStart = () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Connexion requise",
        "Connectez-vous pour démarrer un programme et suivre votre progression.",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Se connecter", onPress: () => router.push("/(auth)/signin" as never) },
        ]
      );
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

  const level = LEVEL_LABELS[program.level] ?? { label: program.level, emoji: "🌙" };

  return (
    <ScreenContainer containerClassName="bg-[#0D0B1E]">
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
                {level.emoji} {level.label}
              </Text>
            </View>
            {program.isPremium && (
              <View style={[styles.heroBadge, styles.premiumBadge]}>
                <Text style={styles.heroBadgeText}>✨ Premium</Text>
              </View>
            )}
            {program.isFeatured && (
              <View style={[styles.heroBadge, styles.featuredBadge]}>
                <Text style={styles.heroBadgeText}>⭐ Populaire</Text>
              </View>
            )}
          </View>

          {/* Progression si démarré */}
          {progress && (
            <View style={styles.heroProgress}>
              <View style={styles.heroProgressHeader}>
                <Text style={styles.heroProgressLabel}>
                  {progress.isCompleted
                    ? "✅ Programme terminé !"
                    : `Jour ${currentDay} / ${program.durationDays}`}
                </Text>
                <Text style={styles.heroProgressPct}>{Math.round(progressPct * 100)}%</Text>
              </View>
              <View style={styles.heroProgressBar}>
                <View
                  style={[
                    styles.heroProgressFill,
                    { width: `${progressPct * 100}%` as unknown as number },
                  ]}
                />
              </View>
              <Text style={styles.heroProgressSub}>
                {completedDays.length} jour{completedDays.length > 1 ? "s" : ""} complété
                {completedDays.length > 1 ? "s" : ""} sur {program.durationDays}
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Stats rapides */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{program.durationDays}</Text>
            <Text style={styles.statLabel}>Jours</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{program.days?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Séances</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>
              {program.days
                ? Math.round(
                    program.days.reduce((acc, d) => acc + (d.estimatedMinutes ?? 0), 0) /
                      (program.days.length || 1)
                  )
                : 0}
              min
            </Text>
            <Text style={styles.statLabel}>/ séance</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{program.totalEnrollments ?? 0}</Text>
            <Text style={styles.statLabel}>Participants</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.description}>{program.description}</Text>
        </View>

        {/* Bouton démarrer / reprendre */}
        {!progress ? (
          <View style={styles.ctaSection}>
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
                  <Text style={styles.startBtnText}>🌙 Commencer le programme</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.startNote}>
              👥 {program.totalEnrollments ?? 0} personnes ont déjà commencé
            </Text>
          </View>
        ) : !progress.isCompleted ? (
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={styles.resumeBtn}
              onPress={() => handleDayPress(currentDay)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#059669", "#10B981"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startBtnGradient}
              >
                <Text style={styles.startBtnText}>▶ Reprendre — Jour {currentDay}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.ctaSection}>
            <View style={styles.completedBanner}>
              <Text style={styles.completedBannerText}>
                🎉 Programme terminé ! Félicitations !
              </Text>
            </View>
          </View>
        )}

        {/* Timeline des jours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {progress ? "Votre progression" : "Programme jour par jour"}
          </Text>

          {program.days?.map((day, index) => {
            const isDone = completedDays.includes(day.dayNumber);
            const isCurrent = !!progress && day.dayNumber === currentDay && !progress.isCompleted;
            const isLocked = progress
              ? day.dayNumber > currentDay && !isDone
              : day.dayNumber > 1;
            const isExpanded = expandedDay === day.dayNumber;

            return (
              <View key={day.id} style={styles.timelineItem}>
                {/* Ligne verticale de connexion */}
                {index < (program.days?.length ?? 0) - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      isDone && styles.timelineLineDone,
                    ]}
                  />
                )}

                <TouchableOpacity
                  style={[
                    styles.dayCard,
                    isDone && styles.dayCardDone,
                    isCurrent && styles.dayCardCurrent,
                    isLocked && styles.dayCardLocked,
                  ]}
                  onPress={() => {
                    if (isLocked) return;
                    if (!progress) {
                      handleStart();
                      return;
                    }
                    // Naviguer directement vers le jour
                    handleDayPress(day.dayNumber);
                  }}
                  activeOpacity={isLocked ? 1 : 0.8}
                >
                  {/* Numéro du jour */}
                  <View
                    style={[
                      styles.dayCircle,
                      isDone && styles.dayCircleDone,
                      isCurrent && styles.dayCircleCurrent,
                    ]}
                  >
                    {isDone ? (
                      <Text style={styles.dayCircleCheck}>✓</Text>
                    ) : (
                      <Text
                        style={[
                          styles.dayCircleNum,
                          isCurrent && styles.dayCircleNumCurrent,
                        ]}
                      >
                        {day.dayNumber}
                      </Text>
                    )}
                  </View>

                  {/* Contenu */}
                  <View style={styles.dayContent}>
                    <View style={styles.dayHeader}>
                      <Text
                        style={[
                          styles.dayTitle,
                          isDone && styles.dayTitleDone,
                          isLocked && styles.dayTitleLocked,
                        ]}
                        numberOfLines={1}
                      >
                        {day.title}
                      </Text>
                      {isCurrent && (
                        <View style={styles.todayBadge}>
                          <Text style={styles.todayBadgeText}>Aujourd'hui</Text>
                        </View>
                      )}
                      {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
                    </View>

                    {day.theme && (
                      <Text style={styles.dayTheme} numberOfLines={1}>
                        {day.theme}
                      </Text>
                    )}

                    <View style={styles.dayMeta}>
                      {day.meditationSlug && (
                        <View style={styles.metaTag}>
                          <Text style={styles.metaTagText}>🧘 Méditation</Text>
                        </View>
                      )}
                      {day.breathingExercise && (
                        <View style={styles.metaTag}>
                          <Text style={styles.metaTagText}>💨 Respiration</Text>
                        </View>
                      )}
                      {day.ambientSound && (
                        <View style={styles.metaTag}>
                          <Text style={styles.metaTagText}>🎵 Ambiance</Text>
                        </View>
                      )}
                      <View style={styles.metaTag}>
                        <Text style={styles.metaTagText}>⏱ {day.estimatedMinutes}min</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Détails expandables */}
                {isExpanded && (
                  <View style={styles.dayExpanded}>
                    {day.description && (
                      <Text style={styles.dayExpandedDesc}>{day.description}</Text>
                    )}
                    {day.sleepTip && (
                      <View style={styles.dayExpandedTip}>
                        <Text style={styles.dayExpandedTipLabel}>💡 Conseil du jour</Text>
                        <Text style={styles.dayExpandedTipText}>{day.sleepTip}</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.dayExpandedBtn}
                      onPress={() => handleDayPress(day.dayNumber)}
                    >
                      <Text style={styles.dayExpandedBtnText}>
                        {isDone ? "Revoir ce jour →" : "Commencer ce jour →"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Bloc bénéfices */}
        {(program as any).benefits && (
          <View style={styles.benefitsSection}>
            <Text style={styles.sectionTitle}>🌟 Ce que vous allez obtenir</Text>
            <View style={styles.benefitsCard}>
              {((program as any).benefits as string).split("\n").map((benefit: string, i: number) => (
                <View key={i} style={styles.benefitRow}>
                  <Text style={styles.benefitCheck}>✓</Text>
                  <Text style={styles.benefitText}>{benefit.replace(/^[-•]\s*/, "")}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 120 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#9CA3AF", marginTop: 12, fontSize: 14 },
  errorText: { color: "#EF4444", fontSize: 16 },

  // Hero
  hero: { padding: 24, paddingTop: 16 },
  backBtn: { marginBottom: 16 },
  backBtnText: { color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: "600" },
  heroEmoji: { fontSize: 52, marginBottom: 10 },
  heroTitle: { fontSize: 28, fontWeight: "800", color: "#FFFFFF", marginBottom: 4 },
  heroSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 16, lineHeight: 20 },
  heroBadges: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  heroBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  premiumBadge: { backgroundColor: "rgba(245,158,11,0.25)" },
  featuredBadge: { backgroundColor: "rgba(167,139,250,0.25)" },
  heroBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  heroProgress: { marginTop: 4 },
  heroProgressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  heroProgressLabel: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "600" },
  heroProgressPct: { color: "#C4B5FD", fontSize: 13, fontWeight: "700" },
  heroProgressBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  heroProgressFill: { height: "100%", backgroundColor: "#A78BFA", borderRadius: 4 },
  heroProgressSub: { color: "rgba(255,255,255,0.6)", fontSize: 11 },

  // Stats
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1F1B35",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3B3060",
  },
  statNum: { fontSize: 18, fontWeight: "800", color: "#A78BFA" },
  statLabel: { fontSize: 10, color: "#6B7280", marginTop: 2, textAlign: "center" },

  // Sections
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#E2D9F3", marginBottom: 14 },
  description: { fontSize: 14, color: "#9CA3AF", lineHeight: 22 },

  // CTA
  ctaSection: { paddingHorizontal: 20, paddingTop: 20 },
  startBtn: { borderRadius: 16, overflow: "hidden", marginBottom: 10 },
  resumeBtn: { borderRadius: 16, overflow: "hidden", marginBottom: 10 },
  startBtnGradient: { paddingVertical: 16, alignItems: "center" },
  startBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  startNote: { textAlign: "center", color: "#6B7280", fontSize: 12 },
  completedBanner: {
    backgroundColor: "#1A2E1A",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#22C55E",
  },
  completedBannerText: { color: "#86EFAC", fontSize: 15, fontWeight: "700" },

  // Timeline
  timelineItem: { position: "relative", paddingLeft: 20 },
  timelineLine: {
    position: "absolute",
    left: 36,
    top: 52,
    bottom: -10,
    width: 2,
    backgroundColor: "#3B3060",
  },
  timelineLineDone: { backgroundColor: "#22C55E" },
  dayCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#1F1B35",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#3B3060",
  },
  dayCardDone: { backgroundColor: "#162316", borderColor: "#22C55E" },
  dayCardCurrent: {
    backgroundColor: "#2D1B69",
    borderColor: "#7C3AED",
    borderWidth: 2,
  },
  dayCardLocked: { opacity: 0.45 },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#3B3060",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  dayCircleDone: { backgroundColor: "#166534" },
  dayCircleCurrent: { backgroundColor: "#7C3AED" },
  dayCircleNum: { color: "#A78BFA", fontSize: 14, fontWeight: "800" },
  dayCircleNumCurrent: { color: "#FFFFFF" },
  dayCircleCheck: { color: "#86EFAC", fontSize: 16, fontWeight: "800" },
  dayContent: { flex: 1 },
  dayHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  dayTitle: { flex: 1, color: "#E2D9F3", fontSize: 14, fontWeight: "700" },
  dayTitleDone: { color: "#86EFAC" },
  dayTitleLocked: { color: "#6B7280" },
  todayBadge: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  todayBadgeText: { color: "#FFFFFF", fontSize: 9, fontWeight: "700" },
  lockIcon: { fontSize: 14 },
  dayTheme: { color: "#6B7280", fontSize: 11, marginBottom: 6 },
  dayMeta: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  metaTag: {
    backgroundColor: "rgba(167,139,250,0.12)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  metaTagText: { color: "#A78BFA", fontSize: 10, fontWeight: "600" },

  // Expanded day
  dayExpanded: {
    marginLeft: 20,
    marginBottom: 10,
    backgroundColor: "#1A1840",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#3B3060",
  },
  dayExpandedDesc: { color: "#9CA3AF", fontSize: 13, lineHeight: 20, marginBottom: 10 },
  dayExpandedTip: { marginBottom: 12 },
  dayExpandedTipLabel: { color: "#FCD34D", fontSize: 12, fontWeight: "700", marginBottom: 4 },
  dayExpandedTipText: { color: "#D1D5DB", fontSize: 12, lineHeight: 18 },
  dayExpandedBtn: {
    backgroundColor: "#4C1D95",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  dayExpandedBtnText: { color: "#E9D5FF", fontSize: 13, fontWeight: "700" },

  // Bénéfices
  benefitsSection: { paddingHorizontal: 20, paddingTop: 20 },
  benefitsCard: {
    backgroundColor: "#1F1B35",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#3B3060",
    gap: 10,
  },
  benefitRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  benefitCheck: { color: "#22C55E", fontSize: 14, fontWeight: "800", marginTop: 1 },
  benefitText: { flex: 1, color: "#D1D5DB", fontSize: 13, lineHeight: 20 },
});
