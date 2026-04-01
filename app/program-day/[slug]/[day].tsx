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

const BREATHING_LABELS: Record<string, { label: string; desc: string }> = {
  "4-7-8": { label: "Respiration 4-7-8", desc: "Inspirez 4s, retenez 7s, expirez 8s" },
  "coherence": { label: "Cohérence cardiaque", desc: "5 respirations par minute, 5 min" },
  "box": { label: "Respiration carrée", desc: "4s inspir, 4s pause, 4s expir, 4s pause" },
  "energizing": { label: "Respiration énergisante", desc: "Respirations rapides et profondes" },
};

const AMBIENT_LABELS: Record<string, string> = {
  rain: "🌧️ Pluie apaisante",
  forest: "🌲 Forêt nocturne",
  ocean: "🌊 Vagues de l'océan",
  fire: "🔥 Feu de cheminée",
  wind: "💨 Vent doux",
  birds: "🐦 Chants d'oiseaux",
};

export default function ProgramDayScreen() {
  const { slug, day } = useLocalSearchParams<{ slug: string; day: string }>();
  const router = useRouter();
  const { isAuthenticated } = useUser();
  const [isCompleting, setIsCompleting] = useState(false);
  const utils = trpc.useUtils();

  const dayNumber = parseInt(day ?? "1", 10);

  const { data: programDay, isLoading } = trpc.programs.getDay.useQuery(
    { programSlug: slug ?? "", dayNumber },
    { enabled: !!slug && !!dayNumber }
  );

  const { data: program } = trpc.programs.get.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  const { data: progress } = trpc.programs.progress.useQuery(
    { programSlug: slug ?? "" },
    { enabled: !!isAuthenticated && !!slug }
  );

  const completeDayMutation = trpc.programs.completeDay.useMutation({
    onSuccess: () => {
      utils.programs.progress.invalidate({ programSlug: slug ?? "" });
      utils.programs.myPrograms.invalidate();
      setIsCompleting(false);
      Alert.alert(
        "🎉 Jour complété !",
        "Bravo ! Vous avez terminé ce jour du programme. Continuez ainsi pour transformer votre sommeil.",
        [{ text: "Continuer", onPress: () => router.back() }]
      );
    },
    onError: () => setIsCompleting(false),
  });

  const completedDays: number[] = progress ? JSON.parse(progress.completedDays || "[]") : [];
  const isDone = completedDays.includes(dayNumber);

  const handleComplete = () => {
    if (!isAuthenticated) {
      Alert.alert("Connexion requise", "Connectez-vous pour suivre votre progression.");
      return;
    }
    setIsCompleting(true);
    completeDayMutation.mutate({ programSlug: slug ?? "", dayNumber });
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#A78BFA" size="large" />
        </View>
      </ScreenContainer>
    );
  }

  if (!programDay) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Jour introuvable</Text>
        </View>
      </ScreenContainer>
    );
  }

  const breathing = programDay.breathingExercise ? BREATHING_LABELS[programDay.breathingExercise] : null;
  const ambient = programDay.ambientSound ? AMBIENT_LABELS[programDay.ambientSound] : null;

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <LinearGradient
          colors={[program?.coverColor ?? "#1E1B4B", program?.coverColor2 ?? "#312E81"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← {program?.title ?? "Programme"}</Text>
          </TouchableOpacity>

          <View style={styles.dayBadge}>
            <Text style={styles.dayBadgeText}>Jour {dayNumber}</Text>
          </View>
          <Text style={styles.heroTitle}>{programDay.title}</Text>
          {programDay.theme && (
            <Text style={styles.heroTheme}>{programDay.theme}</Text>
          )}
          <View style={styles.heroDuration}>
            <Text style={styles.heroDurationText}>⏱ {programDay.estimatedMinutes} minutes estimées</Text>
          </View>
        </LinearGradient>

        {/* Description */}
        {programDay.description && (
          <View style={styles.section}>
            <Text style={styles.description}>{programDay.description}</Text>
          </View>
        )}

        {/* Activités */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌙 Activités du soir</Text>

          {/* Méditation */}
          {programDay.meditationSlug && (
            <TouchableOpacity
              style={styles.activityCard}
              onPress={() => router.push(`/meditation/${programDay.meditationSlug}` as never)}
              activeOpacity={0.85}
            >
              <View style={[styles.activityIcon, { backgroundColor: "#2D1B69" }]}>
                <Text style={styles.activityIconText}>🧘</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Méditation guidée</Text>
                <Text style={styles.activitySub}>Appuyez pour lancer la méditation</Text>
              </View>
              <Text style={styles.activityArrow}>→</Text>
            </TouchableOpacity>
          )}

          {/* Respiration */}
          {breathing && (
            <TouchableOpacity
              style={styles.activityCard}
              onPress={() => router.push("/breathing" as never)}
              activeOpacity={0.85}
            >
              <View style={[styles.activityIcon, { backgroundColor: "#1E3A5F" }]}>
                <Text style={styles.activityIconText}>💨</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{breathing.label}</Text>
                <Text style={styles.activitySub}>{breathing.desc}</Text>
              </View>
              <Text style={styles.activityArrow}>→</Text>
            </TouchableOpacity>
          )}

          {/* Sons d'ambiance */}
          {ambient && (
            <TouchableOpacity
              style={styles.activityCard}
              onPress={() => router.push("/ambient" as never)}
              activeOpacity={0.85}
            >
              <View style={[styles.activityIcon, { backgroundColor: "#1A2E1A" }]}>
                <Text style={styles.activityIconText}>{ambient.split(" ")[0]}</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{ambient}</Text>
                <Text style={styles.activitySub}>Son d'ambiance recommandé pour cette nuit</Text>
              </View>
              <Text style={styles.activityArrow}>→</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Routine du soir */}
        {programDay.eveningRoutine && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Routine du soir</Text>
            <View style={styles.routineCard}>
              {programDay.eveningRoutine.split("\n").map((step, i) => (
                <Text key={i} style={styles.routineStep}>{step}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Conseil du jour */}
        {programDay.sleepTip && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Conseil scientifique</Text>
            <View style={styles.tipCard}>
              <Text style={styles.tipText}>{programDay.sleepTip}</Text>
            </View>
          </View>
        )}

        {/* Journal prompt */}
        {programDay.journalPrompt && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📓 Question pour le journal</Text>
            <View style={styles.journalCard}>
              <Text style={styles.journalPrompt}>"{programDay.journalPrompt}"</Text>
              <TouchableOpacity
                style={styles.journalBtn}
                onPress={() => router.push("/(tabs)/journal" as never)}
              >
                <Text style={styles.journalBtnText}>Écrire dans le journal →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Complete button */}
        <View style={styles.completeSection}>
          {isDone ? (
            <View style={styles.completedBanner}>
              <Text style={styles.completedBannerText}>✅ Jour complété — Bravo !</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.completeBtn}
              onPress={handleComplete}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#059669", "#10B981"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.completeBtnGradient}
              >
                {isCompleting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.completeBtnText}>✓ Marquer ce jour comme terminé</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 100 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#EF4444", fontSize: 16 },
  hero: { padding: 24, paddingTop: 16 },
  backBtn: { marginBottom: 16 },
  backBtnText: { color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: "600" },
  dayBadge: {
    backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "flex-start",
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 8,
  },
  dayBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  heroTitle: { fontSize: 22, fontWeight: "800", color: "#FFFFFF", marginBottom: 4, lineHeight: 28 },
  heroTheme: { fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 12 },
  heroDuration: {
    backgroundColor: "rgba(255,255,255,0.15)", alignSelf: "flex-start",
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
  },
  heroDurationText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#E2D9F3", marginBottom: 12 },
  description: { fontSize: 14, color: "#9CA3AF", lineHeight: 22 },
  activityCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#1F1B35", borderRadius: 16, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: "#3B3060",
  },
  activityIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  activityIconText: { fontSize: 22 },
  activityContent: { flex: 1 },
  activityTitle: { color: "#E2D9F3", fontSize: 14, fontWeight: "700", marginBottom: 2 },
  activitySub: { color: "#6B7280", fontSize: 12 },
  activityArrow: { color: "#A78BFA", fontSize: 18, fontWeight: "700" },
  routineCard: {
    backgroundColor: "#1F1B35", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "#3B3060",
  },
  routineStep: { color: "#D1D5DB", fontSize: 13, lineHeight: 22, marginBottom: 2 },
  tipCard: {
    backgroundColor: "#1E3A5F", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "#1E40AF",
  },
  tipText: { color: "#BFDBFE", fontSize: 13, lineHeight: 22 },
  journalCard: {
    backgroundColor: "#2D1B69", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "#5B21B6",
  },
  journalPrompt: { color: "#C4B5FD", fontSize: 14, lineHeight: 22, fontStyle: "italic", marginBottom: 12 },
  journalBtn: {
    backgroundColor: "rgba(167,139,250,0.2)", paddingVertical: 10, borderRadius: 12, alignItems: "center",
  },
  journalBtnText: { color: "#A78BFA", fontSize: 13, fontWeight: "700" },
  completeSection: { paddingHorizontal: 20, paddingTop: 24 },
  completeBtn: { borderRadius: 16, overflow: "hidden" },
  completeBtnGradient: { paddingVertical: 16, alignItems: "center" },
  completeBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  completedBanner: {
    backgroundColor: "#1A2E1A", borderRadius: 16, paddingVertical: 16,
    alignItems: "center", borderWidth: 1, borderColor: "#22C55E",
  },
  completedBannerText: { color: "#86EFAC", fontSize: 15, fontWeight: "700" },
});
