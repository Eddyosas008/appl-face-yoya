import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useUser } from "@/lib/user-context";
import { useAuth } from "@/hooks/use-auth";

const FILTERS = [
  { key: "all", label: "Tous", emoji: "🌙" },
  { key: "insomnia", label: "Insomnie", emoji: "😴" },
  { key: "quality", label: "Qualité", emoji: "✨" },
  { key: "stress", label: "Stress", emoji: "🧘" },
  { key: "advanced", label: "Expert", emoji: "🌟" },
  { key: "basics", label: "Bases", emoji: "🌱" },
];

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Expert",
};

const ISSUE_LABELS: Record<string, string> = {
  insomnia: "Anti-insomnie",
  quality: "Qualité du sommeil",
  general: "Bien-être général",
  advanced: "Programme expert",
};

export default function JourneysScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: programs, isLoading } = trpc.programs.list.useQuery();
  const { data: myPrograms } = trpc.programs.myPrograms.useQuery(undefined, {
    enabled: !!isAuthenticated,
  });

  const filtered = programs?.filter((p) =>
    activeFilter === "all" ? true : p.targetIssue === activeFilter || p.level === activeFilter
  ) ?? [];

  // Programme actif en cours
  const activeProg = myPrograms?.find((p) => !p.isCompleted);
  const activeProgramData = activeProg ? programs?.find((p) => p.slug === activeProg.programSlug) : null;
  const activeDaysCompleted = activeProg ? (JSON.parse(activeProg.completedDays || "[]") as number[]).length : 0;

  const getProgress = (slug: string) => {
    const prog = myPrograms?.find((p) => p.programSlug === slug);
    if (!prog) return null;
    const completed = JSON.parse(prog.completedDays || "[]") as number[];
    return { current: prog.currentDay, completed: completed.length, isCompleted: prog.isCompleted };
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <LinearGradient colors={["#1A0533", "#0D0B1E"]} style={styles.header}>
          <Text style={styles.title}>🌙 Programmes Sommeil</Text>
          <Text style={styles.subtitle}>Des parcours scientifiques pour transformer vos nuits</Text>
        </LinearGradient>

        {/* Programme en cours */}
        {activeProgramData && activeProg && (
          <View style={styles.activeSection}>
            <Text style={styles.activeSectionTitle}>▶ Programme en cours</Text>
            <TouchableOpacity
              onPress={() => router.push(`/program/${activeProgramData.slug}` as never)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[activeProgramData.coverColor ?? "#1A0533", activeProgramData.coverColor2 ?? "#7C3AED"]}
                style={styles.activeCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.activeCardRow}>
                  <Text style={styles.activeEmoji}>{activeProgramData.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activeTitle}>{activeProgramData.title}</Text>
                    <Text style={styles.activeSub}>{activeProgramData.subtitle}</Text>
                  </View>
                  <View style={styles.activeStreakBox}>
                    <Text style={styles.activeStreakNum}>{activeDaysCompleted}</Text>
                    <Text style={styles.activeStreakLabel}>jours</Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.round((activeDaysCompleted / activeProgramData.durationDays) * 100)}%` as unknown as number }]} />
                </View>
                <View style={styles.activeCardFooter}>
                  <Text style={styles.activeProgressText}>
                    {activeDaysCompleted} / {activeProgramData.durationDays} jours
                  </Text>
                  <View style={styles.resumeBtn}>
                    <Text style={styles.resumeBtnText}>Reprendre — Jour {activeProg.currentDay} →</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterBtn, activeFilter === f.key && styles.filterBtnActive]}
              onPress={() => setActiveFilter(f.key)}
            >
              <Text style={styles.filterEmoji}>{f.emoji}</Text>
              <Text style={[styles.filterLabel, activeFilter === f.key && styles.filterLabelActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats banner */}
        {myPrograms && myPrograms.length > 0 && (
          <View style={styles.statsBanner}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{myPrograms.length}</Text>
              <Text style={styles.statLabel}>Commencé{myPrograms.length > 1 ? "s" : ""}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>
                {myPrograms.reduce((acc, p) => acc + (JSON.parse(p.completedDays || "[]") as number[]).length, 0)}
              </Text>
              <Text style={styles.statLabel}>Jours complétés</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>
                {myPrograms.filter((p) => p.isCompleted).length}
              </Text>
              <Text style={styles.statLabel}>Terminé{myPrograms.filter((p) => p.isCompleted).length > 1 ? "s" : ""}</Text>
            </View>
          </View>
        )}

        {/* Programs list */}
        {isLoading ? (
          <ActivityIndicator color="#A78BFA" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.programsList}>
            {filtered.map((program) => {
              const progress = getProgress(program.slug);
              const total = program.durationDays;
              const completedCount = progress?.completed ?? 0;
              const progressPct = total > 0 ? completedCount / total : 0;

              return (
                <TouchableOpacity
                  key={program.slug}
                  style={styles.programCard}
                  onPress={() => router.push(`/program/${program.slug}` as never)}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[program.coverColor ?? "#1E1B4B", program.coverColor2 ?? "#312E81"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardGradient}
                  >
                    {/* Badges */}
                    <View style={styles.cardBadges}>
                      {program.isFeatured && (
                        <View style={styles.featuredBadge}>
                          <Text style={styles.featuredBadgeText}>⭐ Recommandé</Text>
                        </View>
                      )}
                      {program.isPremium && (
                        <View style={styles.premiumBadge}>
                          <Text style={styles.premiumBadgeText}>✨ Premium</Text>
                        </View>
                      )}
                    </View>

                    {/* Emoji & Title */}
                    <Text style={styles.cardEmoji}>{program.emoji}</Text>
                    <Text style={styles.cardTitle}>{program.title}</Text>
                    <Text style={styles.cardSubtitle}>{program.subtitle}</Text>

                    {/* Meta */}
                    <View style={styles.cardMeta}>
                      <View style={styles.metaChip}>
                        <Text style={styles.metaChipText}>📅 {program.durationDays} jours</Text>
                      </View>
                      <View style={styles.metaChip}>
                        <Text style={styles.metaChipText}>
                          {LEVEL_LABELS[program.level] ?? program.level}
                        </Text>
                      </View>
                      {program.targetIssue && ISSUE_LABELS[program.targetIssue] && (
                        <View style={styles.metaChip}>
                          <Text style={styles.metaChipText}>
                            {ISSUE_LABELS[program.targetIssue]}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Progress bar if started */}
                    {progress ? (
                      <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                          <Text style={styles.progressLabel}>
                            {progress.isCompleted ? "✅ Terminé !" : `Jour ${progress.current} / ${total}`}
                          </Text>
                          <Text style={styles.progressPct}>{Math.round(progressPct * 100)}%</Text>
                        </View>
                        <View style={styles.progressBar}>
                          <View style={[styles.progressFill, { width: `${progressPct * 100}%` as unknown as number }]} />
                        </View>
                      </View>
                    ) : (
                      <View style={styles.startSection}>
                        <Text style={styles.enrollCount}>
                          👥 {program.totalEnrollments} participants
                        </Text>
                        <View style={styles.startBtn}>
                          <Text style={styles.startBtnText}>Commencer →</Text>
                        </View>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {filtered.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌙</Text>
            <Text style={styles.emptyText}>Aucun programme pour ce filtre</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 100 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },
  title: { fontSize: 26, fontWeight: "800", color: "#E9D5FF", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#9CA3AF", lineHeight: 20 },
  // Programme actif
  activeSection: { paddingHorizontal: 16, marginBottom: 8 },
  activeSectionTitle: { fontSize: 14, fontWeight: "700", color: "#C4B5FD", marginBottom: 10 },
  activeCard: { borderRadius: 20, padding: 18 },
  activeCardRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  activeEmoji: { fontSize: 32 },
  activeTitle: { fontSize: 16, fontWeight: "700", color: "#fff", marginBottom: 2 },
  activeSub: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  activeStreakBox: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  activeStreakNum: { fontSize: 22, fontWeight: "800", color: "#fff" },
  activeStreakLabel: { fontSize: 10, color: "rgba(255,255,255,0.8)" },
  activeCardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  activeProgressText: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  resumeBtn: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  resumeBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  // Filtres
  filtersRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: "#1F1B35",
    borderWidth: 1, borderColor: "#3B3060",
  },
  filterBtnActive: { backgroundColor: "#4C1D95", borderColor: "#7C3AED" },
  filterEmoji: { fontSize: 13 },
  filterLabel: { fontSize: 13, color: "#9CA3AF", fontWeight: "600" },
  filterLabelActive: { color: "#E9D5FF", fontWeight: "700" },
  statsBanner: {
    flexDirection: "row", marginHorizontal: 20, marginBottom: 16,
    backgroundColor: "#1F1B35", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "#3B3060",
  },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 22, fontWeight: "800", color: "#A78BFA" },
  statLabel: { fontSize: 11, color: "#6B7280", marginTop: 2, textAlign: "center" },
  statDivider: { width: 1, backgroundColor: "#3B3060", marginHorizontal: 8 },
  programsList: { paddingHorizontal: 20, gap: 16 },
  programCard: { borderRadius: 24, overflow: "hidden", elevation: 4 },
  cardGradient: { padding: 24 },
  cardBadges: { flexDirection: "row", gap: 8, marginBottom: 12 },
  featuredBadge: {
    backgroundColor: "rgba(251,191,36,0.2)", paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, borderWidth: 1, borderColor: "rgba(251,191,36,0.4)",
  },
  featuredBadgeText: { fontSize: 11, color: "#FCD34D", fontWeight: "700" },
  premiumBadge: {
    backgroundColor: "rgba(167,139,250,0.2)", paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, borderWidth: 1, borderColor: "rgba(167,139,250,0.4)",
  },
  premiumBadgeText: { fontSize: 11, color: "#C4B5FD", fontWeight: "700" },
  cardEmoji: { fontSize: 40, marginBottom: 8 },
  cardTitle: { fontSize: 22, fontWeight: "800", color: "#FFFFFF", marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 16, lineHeight: 20 },
  cardMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  metaChip: {
    backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12,
  },
  metaChipText: { fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: "600" },
  progressSection: {},
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  progressLabel: { fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: "600" },
  progressPct: { fontSize: 13, color: "#A78BFA", fontWeight: "700" },
  progressBar: {
    height: 6, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 3, overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#A78BFA", borderRadius: 3 },
  startSection: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  enrollCount: { fontSize: 12, color: "rgba(255,255,255,0.6)" },
  startBtn: {
    backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20,
  },
  startBtnText: { fontSize: 13, color: "#FFFFFF", fontWeight: "700" },
  emptyState: { alignItems: "center", paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: "#6B7280" },
});
