import { useState } from "react";
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
import { StarField } from "@/components/star-field";
import { trpc } from "@/lib/trpc";
import { useThemeContext } from "@/lib/theme-provider";
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
  const { isDark } = useThemeContext();
  const colors = useColors();
  const [activeFilter, setActiveFilter] = useState("all");

  // Couleurs dynamiques
  const GOLD    = isDark ? '#C8A96E' : '#A0722A';
  const FG      = isDark ? '#EDE8DC' : '#1E1A3C';
  const LAV     = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(100,80,180,0.75)';
  const LAV_DIM = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(100,80,180,0.50)';
  const BORDER  = isDark ? 'rgba(180,160,255,0.14)' : 'rgba(120,100,200,0.18)';
  const GLASS   = isDark ? '#2A2540' : 'rgba(255,255,255,0.70)';

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
    <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
      <StarField />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={[styles.backBtnText, { color: LAV }]}>← Retour</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: FG }]}>📅 Programmes</Text>
          <Text style={[styles.headerSub, { color: LAV }]}>
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
                { backgroundColor: GLASS, borderColor: BORDER },
                activeFilter === f.key && {
                  backgroundColor: isDark ? 'rgba(201,168,76,0.14)' : 'rgba(160,114,42,0.12)',
                  borderColor: isDark ? 'rgba(201,168,76,0.35)' : 'rgba(160,114,42,0.35)',
                },
              ]}
              onPress={() => setActiveFilter(f.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: activeFilter === f.key ? GOLD : LAV },
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
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((prog) => {
              const progress = getProgress(prog.slug, prog.durationDays);
              const pct = progress && progress.total > 0
                ? Math.round((progress.completed / progress.total) * 100)
                : 0;

              // En mode clair, on atténue le gradient pour qu'il reste lisible
              const gradStart = isDark
                ? (prog.coverColor ?? "#1E1B4B")
                : lightenColor(prog.coverColor ?? "#1E1B4B");
              const gradEnd = isDark
                ? (prog.coverColor2 ?? "#312E81")
                : lightenColor(prog.coverColor2 ?? "#312E81");

              return (
                <TouchableOpacity
                  key={prog.slug}
                  activeOpacity={0.88}
                  onPress={() => router.push(`/program/${prog.slug}` as never)}
                >
                  <LinearGradient
                    colors={[gradStart, gradEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.card, { borderColor: BORDER }]}
                  >
                    {/* Badges */}
                    <View style={styles.cardBadgeRow}>
                      <View style={[styles.badge, { backgroundColor: 'rgba(0,0,0,0.18)', borderColor: 'rgba(255,255,255,0.15)' }]}>
                        <Text style={styles.badgeText}>📅 {prog.durationDays} jours</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: 'rgba(0,0,0,0.18)', borderColor: 'rgba(255,255,255,0.15)' }]}>
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
                        <View style={[styles.progressBarBg, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                          <View style={[styles.progressBarFill, { width: `${pct}%` as `${number}%`, backgroundColor: '#C8A96E' }]} />
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

/** Éclaircit une couleur hex pour le mode clair (mélange avec blanc) */
function lightenColor(hex: string, amount = 0.45): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.round(((num >> 16) & 0xff) + (255 - ((num >> 16) & 0xff)) * amount));
  const g = Math.min(255, Math.round(((num >> 8) & 0xff) + (255 - ((num >> 8) & 0xff)) * amount));
  const b = Math.min(255, Math.round((num & 0xff) + (255 - (num & 0xff)) * amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  backBtn: { marginBottom: 12 },
  backBtnText: { fontSize: 15, fontWeight: '600' },
  headerTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 26, marginBottom: 4 },
  headerSub: { fontSize: 14 },
  filtersRow: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: { fontSize: 13, fontWeight: '600' },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  list: { paddingHorizontal: 16, gap: 16 },
  card: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeFeatured: { backgroundColor: 'rgba(201,168,76,0.20)', borderColor: 'rgba(201,168,76,0.35)' },
  badgePremium: { backgroundColor: 'rgba(240,235,224,0.65)', borderColor: 'rgba(240,235,224,0.65)' },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  cardEmoji: { fontSize: 36, marginBottom: 8 },
  cardTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 22, color: '#FFFFFF', marginBottom: 4 },
  cardSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 8 },
  cardDesc: { fontSize: 13, color: 'rgba(255,255,255,0.60)', lineHeight: 19, marginBottom: 12 },
  progressBox: { marginTop: 8 },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    marginBottom: 6,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  progressText: { fontSize: 12, color: 'rgba(255,255,255,0.60)' },
  startRow: { marginTop: 12 },
  startBtn: {
    color: '#C8A96E',
    fontWeight: '700',
    fontSize: 15,
  },
});
