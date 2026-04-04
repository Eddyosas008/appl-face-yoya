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
import { StarField } from "@/components/star-field";
import { trpc } from "@/lib/trpc";
import { useUser } from "@/lib/user-context";
import { useThemeContext } from "@/lib/theme-provider";

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
  const { isDark } = useThemeContext();
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  // Couleurs dynamiques
  const GOLD    = isDark ? '#C8A96E' : '#A0722A';
  const GOLD_BG = isDark ? 'rgba(201,168,76,0.14)' : 'rgba(160,114,42,0.10)';
  const FG      = isDark ? '#EDE8DC' : '#1E1A3C';
  const LAV     = isDark ? 'rgba(237,232,220,0.50)' : 'rgba(100,80,180,0.75)';
  const LAV_DIM = isDark ? 'rgba(237,232,220,0.50)' : 'rgba(100,80,180,0.50)';
  const BORDER  = isDark ? 'rgba(180,160,255,0.14)' : 'rgba(120,100,200,0.18)';
  const SURFACE = isDark ? 'rgba(28,23,64,0.80)' : 'rgba(255,255,255,0.70)';
  const SUCCESS = isDark ? 'rgba(74,222,128,0.85)' : 'rgba(22,163,74,0.90)';
  const BG_TEXT = isDark ? '#0D0B1A' : '#FFFFFF';

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
    // Naviguer directement vers le jour sans exiger la connexion
    router.push(`/program-day/${slug}/${dayNumber}` as never);
  };

  if (isLoading) {
    return (
      <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={isDark ? '#A78BFA' : '#6B46C1'} size="large" />
          <Text style={[styles.loadingText, { color: LAV_DIM }]}>Chargement du programme...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!program) {
    return (
      <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Programme introuvable</Text>
        </View>
      </ScreenContainer>
    );
  }

  const level = LEVEL_LABELS[program.level] ?? { label: program.level, emoji: "🌙" };

  return (
    <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
      <StarField />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <LinearGradient
          colors={[program.coverColor ?? "#1E1B4B", program.coverColor2 ?? "#312E81"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={[styles.backBtnText, { color: 'rgba(255,255,255,0.75)' }]}>← Retour</Text>
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
          {[
            { num: String(program.durationDays), label: 'Jours' },
            { num: String(program.days?.length ?? 0), label: 'Séances' },
            { num: `${program.days ? Math.round(program.days.reduce((acc, d) => acc + (d.estimatedMinutes ?? 0), 0) / (program.days.length || 1)) : 0}min`, label: '/ séance' },
            { num: String(program.totalEnrollments ?? 0), label: 'Participants' },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: SURFACE, borderColor: BORDER }]}>
              <Text style={[styles.statNum, { color: GOLD }]}>{s.num}</Text>
              <Text style={[styles.statLabel, { color: LAV_DIM }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: FG }]}>À propos</Text>
          <Text style={[styles.description, { color: LAV }]}>{program.description}</Text>
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
            <Text style={[styles.startNote, { color: LAV_DIM }]}>
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
          <Text style={[styles.sectionTitle, { color: FG }]}>
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
                    { backgroundColor: SURFACE, borderColor: BORDER },
                    isDone && { backgroundColor: isDark ? 'rgba(74,222,128,0.05)' : 'rgba(22,163,74,0.06)', borderColor: isDark ? 'rgba(74,222,128,0.20)' : 'rgba(22,163,74,0.25)' },
                    isCurrent && { backgroundColor: GOLD_BG, borderColor: isDark ? 'rgba(201,168,76,0.4)' : 'rgba(160,114,42,0.4)', borderWidth: 1.5 },
                    isLocked && styles.dayCardLocked,
                  ]}
                  onPress={() => {
                    if (isLocked) return;
                    handleDayPress(day.dayNumber);
                  }}
                  onLongPress={() => {
                    if (!isLocked) {
                      setExpandedDay(isExpanded ? null : day.dayNumber);
                    }
                  }}
                  activeOpacity={isLocked ? 1 : 0.8}
                >
                  {/* Numéro du jour */}
                  <View
                    style={[
                      styles.dayCircle,
                      { backgroundColor: BORDER },
                      isDone && { backgroundColor: isDark ? 'rgba(74,222,128,0.15)' : 'rgba(22,163,74,0.15)' },
                      isCurrent && { backgroundColor: GOLD },
                    ]}
                  >
                    {isDone ? (
                      <Text style={[styles.dayCircleCheck, { color: SUCCESS }]}>✓</Text>
                    ) : (
                      <Text
                        style={[
                          styles.dayCircleNum,
                          { color: LAV },
                          isCurrent && { color: BG_TEXT },
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
                          { color: FG },
                          isDone && { color: SUCCESS },
                          isLocked && { color: LAV_DIM },
                        ]}
                        numberOfLines={1}
                      >
                        {day.title}
                      </Text>
                      {isCurrent && (
                        <View style={[styles.todayBadge, { backgroundColor: GOLD }]}>
                          <Text style={[styles.todayBadgeText, { color: BG_TEXT }]}>Aujourd'hui</Text>
                        </View>
                      )}
                      {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
                    </View>

                    {day.theme && (
                      <Text style={[styles.dayTheme, { color: LAV_DIM }]} numberOfLines={1}>
                        {day.theme}
                      </Text>
                    )}

                    <View style={styles.dayMeta}>
                      {day.meditationSlug && (
                        <View style={[styles.metaTag, { backgroundColor: SURFACE, borderColor: BORDER }]}>
                          <Text style={[styles.metaTagText, { color: LAV }]}>🧘 Méditation</Text>
                        </View>
                      )}
                      {day.breathingExercise && (
                        <View style={[styles.metaTag, { backgroundColor: SURFACE, borderColor: BORDER }]}>
                          <Text style={[styles.metaTagText, { color: LAV }]}>💨 Respiration</Text>
                        </View>
                      )}
                      {day.ambientSound && (
                        <View style={[styles.metaTag, { backgroundColor: SURFACE, borderColor: BORDER }]}>
                          <Text style={[styles.metaTagText, { color: LAV }]}>🎵 Ambiance</Text>
                        </View>
                      )}
                      <View style={[styles.metaTag, { backgroundColor: SURFACE, borderColor: BORDER }]}>
                        <Text style={[styles.metaTagText, { color: LAV }]}>⏱ {day.estimatedMinutes}min</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Détails expandables */}
                {isExpanded && (
                  <View style={[styles.dayExpanded, { backgroundColor: SURFACE, borderColor: BORDER }]}>
                    {day.description && (
                      <Text style={[styles.dayExpandedDesc, { color: LAV }]}>{day.description}</Text>
                    )}
                    {day.sleepTip && (
                      <View style={styles.dayExpandedTip}>
                        <Text style={[styles.dayExpandedTipLabel, { color: GOLD }]}>💡 Conseil du jour</Text>
                        <Text style={[styles.dayExpandedTipText, { color: LAV }]}>{day.sleepTip}</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={[styles.dayExpandedBtn, { backgroundColor: GOLD }]}
                      onPress={() => handleDayPress(day.dayNumber)}
                    >
                      <Text style={[styles.dayExpandedBtnText, { color: BG_TEXT }]}>
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
            <Text style={[styles.sectionTitle, { color: FG }]}>🌟 Ce que vous allez obtenir</Text>
            <View style={[styles.benefitsCard, { backgroundColor: SURFACE, borderColor: BORDER }]}>
              {((program as any).benefits as string).split("\n").map((benefit: string, i: number) => (
                <View key={i} style={styles.benefitRow}>
                  <Text style={[styles.benefitCheck, { color: GOLD }]}>✓</Text>
                  <Text style={[styles.benefitText, { color: LAV }]}>{benefit.replace(/^[-•]\s*/, "")}</Text>
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  errorText: { color: '#F87171', fontSize: 16 },

  // Hero
  hero: { padding: 24, paddingTop: 16 },
  backBtn: { marginBottom: 16 },
  backBtnText: { fontSize: 15, fontWeight: '600' },
  heroEmoji: { fontSize: 52, marginBottom: 10 },
  heroTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 28, color: '#FFFFFF', marginBottom: 4 },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 16, lineHeight: 20 },
  heroBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  heroBadge: {
    backgroundColor: 'rgba(0,0,0,0.20)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  premiumBadge: { backgroundColor: 'rgba(201,168,76,0.20)', borderColor: 'rgba(201,168,76,0.35)' },
  featuredBadge: { backgroundColor: 'rgba(237,232,220,0.50)', borderColor: 'rgba(255,255,255,0.20)' },
  heroBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  heroProgress: { marginTop: 4 },
  heroProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  heroProgressLabel: { color: 'rgba(255,255,255,0.80)', fontSize: 13, fontWeight: '600' },
  heroProgressPct: { color: '#C8A96E', fontSize: 13, fontWeight: '700' },
  heroProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  heroProgressFill: { height: '100%', backgroundColor: '#C8A96E', borderRadius: 3 },
  heroProgressSub: { color: 'rgba(255,255,255,0.60)', fontSize: 11 },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  statNum: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 18 },
  statLabel: { fontSize: 10, marginTop: 2, textAlign: 'center' },

  // Sections
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 18, marginBottom: 14 },
  description: { fontSize: 14, lineHeight: 22 },

  // CTA
  ctaSection: { paddingHorizontal: 20, paddingTop: 20 },
  startBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 10 },
  resumeBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 10 },
  startBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  startBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  startNote: { textAlign: 'center', fontSize: 12 },
  completedBanner: {
    backgroundColor: 'rgba(74,222,128,0.08)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.25)',
  },
  completedBannerText: { color: 'rgba(74,222,128,0.90)', fontSize: 15, fontWeight: '700' },

  // Timeline
  timelineItem: { position: 'relative', paddingLeft: 20 },
  timelineLine: {
    position: 'absolute',
    left: 36,
    top: 52,
    bottom: -10,
    width: 2,
  },
  timelineLineDone: { backgroundColor: 'rgba(74,222,128,0.4)' },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  dayCardDone: {},
  dayCardCurrent: {},
  dayCardLocked: { opacity: 0.4 },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  dayCircleDone: {},
  dayCircleCurrent: {},
  dayCircleNum: { fontSize: 14, fontWeight: '800' },
  dayCircleNumCurrent: {},
  dayCircleCheck: { fontSize: 16, fontWeight: '800' },
  dayContent: { flex: 1 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  dayTitle: { flex: 1, fontSize: 14, fontWeight: '700' },
  dayTitleDone: {},
  dayTitleLocked: {},
  todayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  todayBadgeText: { fontSize: 9, fontWeight: '800' },
  lockIcon: { fontSize: 14 },
  dayTheme: { fontSize: 11, marginBottom: 6 },
  dayMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  metaTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  metaTagText: { fontSize: 10, fontWeight: '600' },

  // Expanded day
  dayExpanded: {
    marginLeft: 20,
    marginBottom: 10,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  dayExpandedDesc: { fontSize: 13, lineHeight: 20, marginBottom: 10 },
  dayExpandedTip: { marginBottom: 12 },
  dayExpandedTipLabel: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  dayExpandedTipText: { fontSize: 12, lineHeight: 18 },
  dayExpandedBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  dayExpandedBtnText: { fontSize: 13, fontWeight: '800' },

  // Bénéfices
  benefitsSection: { paddingHorizontal: 20, paddingTop: 20 },
  benefitsCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  benefitRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  benefitCheck: { fontSize: 14, fontWeight: '800', marginTop: 1 },
  benefitText: { flex: 1, fontSize: 13, lineHeight: 20 },
});
