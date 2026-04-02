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
import { useColors } from "@/hooks/use-colors";

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Avancé",
};

const FILTERS = [
  { key: "all", label: "Tous" },
  { key: "beginner", label: "Débutant" },
  { key: "intermediate", label: "Intermédiaire" },
  { key: "advanced", label: "Avancé" },
];

export default function ProgramsListScreen() {
  const router = useRouter();
  const colors = useColors();
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: programs, isLoading } = trpc.programs.list.useQuery();
  const { data: myPrograms } = trpc.programs.myPrograms.useQuery();

  const filtered = (programs ?? []).filter((p) =>
    activeFilter === "all" ? true : p.level === activeFilter
  );

  const getProgress = (slug: string, durationDays: number) => {
    const prog = myPrograms?.find((p) => p.programSlug === slug);
    if (!prog) return null;
    const completed = JSON.parse(prog.completedDays || "[]").length;
    return { completed, total: durationDays };
  };

  return (
    <ScreenContainer containerClassName="bg-[#0D0B1E]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={[styles.backBtnText, { color: colors.primary }]}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📅 Programmes</Text>
          <Text style={[styles.headerSub, { color: colors.muted }]}>
            Des parcours structurés pour transformer votre sommeil
          </Text>
        </View>

        {/* Filtres */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterChip,
                activeFilter === f.key && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(f.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === f.key ? styles.filterChipTextActive : { color: colors.muted },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Liste */}
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#A78BFA" size="large" />
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((prog) => {
              const progress = getProgress(prog.slug, prog.durationDays);
              const pct = progress && progress.total > 0
                ? Math.round((progress.completed / progress.total) * 100)
                : 0;
              return (
                <TouchableOpacity
                  key={prog.slug}
                  activeOpacity={0.88}
                  onPress={() => router.push(`/program/${prog.slug}` as never)}
                >
                  <LinearGradient
                    colors={[prog.coverColor ?? "#1E1B4B", prog.coverColor2 ?? "#312E81"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                  >
                    {/* Badges */}
                    <View style={styles.cardBadgeRow}>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>📅 {prog.durationDays} jours</Text>
                      </View>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          🌱 {LEVEL_LABELS[prog.level] ?? prog.level}
                        </Text>
                      </View>
                      {prog.isFeatured && (
                        <View style={[styles.badge, styles.badgeFeatured]}>
                          <Text style={styles.badgeText}>⭐ Populaire</Text>
                        </View>
                      )}
                      {prog.isPremium && (
                        <View style={[styles.badge, styles.badgePremium]}>
                          <Text style={styles.badgeText}>💎 Premium</Text>
                        </View>
                      )}
                    </View>

                    {/* Emoji + Titre */}
                    <Text style={styles.cardEmoji}>{prog.emoji ?? "🌙"}</Text>
                    <Text style={styles.cardTitle}>{prog.title}</Text>
                    {prog.subtitle && (
                      <Text style={styles.cardSub}>{prog.subtitle}</Text>
                    )}

                    {/* Description courte */}
                    {prog.description && (
                      <Text style={styles.cardDesc} numberOfLines={2}>
                        {prog.description}
                      </Text>
                    )}

                    {/* Progression */}
                    {progress ? (
                      <View style={styles.progressBox}>
                        <View style={styles.progressBarBg}>
                          <View style={[styles.progressBarFill, { width: `${pct}%` }]} />
                        </View>
                        <Text style={styles.progressText}>
                          {progress.completed}/{progress.total} jours — {pct}%
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.startRow}>
                        <Text style={styles.startBtn}>Commencer →</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  backBtn: { marginBottom: 12 },
  backBtnText: { fontSize: 15, fontWeight: "600" },
  headerTitle: { fontSize: 26, fontWeight: "800", color: "#ECEDEE", marginBottom: 4 },
  headerSub: { fontSize: 14 },
  filtersRow: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1E1B4B",
    borderWidth: 1,
    borderColor: "#312E81",
  },
  filterChipActive: { backgroundColor: "#7C3AED", borderColor: "#7C3AED" },
  filterChipText: { fontSize: 13, fontWeight: "600" },
  filterChipTextActive: { color: "#fff" },
  loadingBox: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  list: { paddingHorizontal: 16, gap: 16 },
  card: {
    borderRadius: 20,
    padding: 20,
    overflow: "hidden",
  },
  cardBadgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  badge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeFeatured: { backgroundColor: "rgba(251,191,36,0.25)" },
  badgePremium: { backgroundColor: "rgba(167,139,250,0.3)" },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  cardEmoji: { fontSize: 36, marginBottom: 8 },
  cardTitle: { fontSize: 22, fontWeight: "800", color: "#fff", marginBottom: 4 },
  cardSub: { fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 8 },
  cardDesc: { fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 19, marginBottom: 12 },
  progressBox: { marginTop: 8 },
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    marginBottom: 6,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: "#A78BFA",
    borderRadius: 3,
  },
  progressText: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  startRow: { marginTop: 12 },
  startBtn: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
