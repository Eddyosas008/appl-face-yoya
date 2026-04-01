import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient as SvgGradient, Stop, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';

// ─── Constantes ───────────────────────────────────────────────────────────────

const MOOD_SCORE: Record<string, number> = {
  happy: 5, grateful: 5, calm: 4, neutral: 3,
  tired: 2, anxious: 2, sad: 1, overwhelmed: 1,
};
const MOOD_COLOR: Record<string, string> = {
  happy: '#22C55E', grateful: '#10B981', calm: '#6366F1',
  neutral: '#94A3B8', tired: '#F59E0B', anxious: '#F97316',
  sad: '#3B82F6', overwhelmed: '#EF4444',
};
const MOOD_EMOJI: Record<string, string> = {
  happy: '😊', grateful: '🙏', calm: '😌', neutral: '😐',
  tired: '😴', anxious: '😰', sad: '😢', overwhelmed: '😵',
};
const MOOD_LABEL: Record<string, string> = {
  happy: 'Joyeux', grateful: 'Reconnaissant', calm: 'Calme',
  neutral: 'Neutre', tired: 'Fatigué', anxious: 'Anxieux',
  sad: 'Triste', overwhelmed: 'Dépassé',
};
const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// ─── Composants graphiques ────────────────────────────────────────────────────

function MoodChart({ checkIns, colors }: { checkIns: any[]; colors: any }) {
  const width = 300;
  const height = 140;
  const pad = { top: 16, right: 16, bottom: 32, left: 28 };

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
  }, []);

  const todayDow = new Date().getDay();
  const startDow = (todayDow + 6) % 7;
  const labels = Array.from({ length: 7 }, (_, i) => {
    const dow = (startDow - 6 + i + 7) % 7;
    return DAY_LABELS[dow];
  });

  const dataPoints = useMemo(() => {
    return days.map((day) => {
      const dayCI = checkIns.filter((ci) => {
        const d = new Date(ci.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === day.getTime();
      });
      if (!dayCI.length) return null;
      const avg = dayCI.reduce((s, ci) => s + (MOOD_SCORE[ci.mood] || 3), 0) / dayCI.length;
      return { score: avg, mood: dayCI[dayCI.length - 1]?.mood };
    });
  }, [checkIns, days]);

  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const stepX = chartW / 6;

  const points = dataPoints.map((dp, i) => ({
    x: pad.left + i * stepX,
    y: dp ? pad.top + chartH - ((dp.score - 1) / 4) * chartH : null,
    dp,
  }));

  const valid = points.filter((p) => p.y !== null) as { x: number; y: number; dp: any }[];
  let pathD = '';
  let areaD = '';
  if (valid.length > 1) {
    pathD = valid.map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = valid[i - 1];
      const cpX = (prev.x + p.x) / 2;
      return `C ${cpX} ${prev.y}, ${cpX} ${p.y}, ${p.x} ${p.y}`;
    }).join(' ');
    areaD = pathD + ` L ${valid[valid.length - 1].x} ${pad.top + chartH} L ${valid[0].x} ${pad.top + chartH} Z`;
  }

  return (
    <View>
      <Svg width={width} height={height}>
        <Defs>
          <SvgGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#C084FC" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#C084FC" stopOpacity="0" />
          </SvgGradient>
        </Defs>
        {[1, 2, 3, 4].map((l) => {
          const y = pad.top + chartH - ((l - 1) / 4) * chartH;
          return <Line key={l} x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke={colors.border} strokeWidth="1" strokeDasharray="4,4" />;
        })}
        {areaD ? <Path d={areaD} fill="url(#moodGrad)" /> : null}
        {pathD ? <Path d={pathD} stroke="#C084FC" strokeWidth="2.5" fill="none" strokeLinecap="round" /> : null}
        {points.map((p, i) => {
          if (p.y === null) return null;
          return <Circle key={i} cx={p.x} cy={p.y} r={5} fill={MOOD_COLOR[p.dp?.mood] || '#C084FC'} stroke="#fff" strokeWidth="2" />;
        })}
        {points.map((p, i) => (
          <SvgText key={`l${i}`} x={p.x} y={height - 4} textAnchor="middle" fontSize="11" fill={colors.muted}>{labels[i]}</SvgText>
        ))}
        {!valid.length && (
          <SvgText x={width / 2} y={height / 2} textAnchor="middle" fontSize="13" fill={colors.muted}>Aucun check-in cette semaine</SvgText>
        )}
      </Svg>
    </View>
  );
}

function SleepBarsChart({ logs, colors }: { logs: any[]; colors: any }) {
  const width = 300;
  const height = 100;
  const pad = { top: 8, right: 8, bottom: 24, left: 8 };
  const last7 = useMemo(() => {
    const result: (number | null)[] = Array(7).fill(null);
    const now = new Date();
    logs.forEach((log) => {
      const d = new Date(log.sleepDate);
      const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff < 7) result[6 - diff] = log.durationMinutes ?? null;
    });
    return result;
  }, [logs]);

  const maxH = Math.max(...last7.filter(Boolean) as number[], 480);
  const barW = (width - pad.left - pad.right) / 7 - 4;
  const chartH = height - pad.top - pad.bottom;

  const todayDow = new Date().getDay();
  const startDow = (todayDow + 6) % 7;
  const labels = Array.from({ length: 7 }, (_, i) => {
    const dow = (startDow - 6 + i + 7) % 7;
    return DAY_LABELS[dow];
  });

  return (
    <Svg width={width} height={height}>
      {last7.map((val, i) => {
        const x = pad.left + i * ((width - pad.left - pad.right) / 7) + 2;
        const barH = val ? Math.max(4, (val / maxH) * chartH) : 4;
        const y = pad.top + chartH - barH;
        const isGoal = (val ?? 0) >= 450;
        return (
          <React.Fragment key={i}>
            <Rect x={x} y={pad.top} width={barW} height={chartH} rx={4} fill={colors.border} opacity={0.3} />
            <Rect x={x} y={y} width={barW} height={barH} rx={4} fill={isGoal ? '#22C55E' : '#7C3AED'} opacity={val ? 1 : 0.2} />
            <SvgText x={x + barW / 2} y={height - 4} textAnchor="middle" fontSize="10" fill={colors.muted}>{labels[i]}</SvgText>
            {val && val >= 450 && (
              <SvgText x={x + barW / 2} y={y - 3} textAnchor="middle" fontSize="9" fill="#22C55E">✓</SvgText>
            )}
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

// ─── Écran principal ──────────────────────────────────────────────────────────

export default function ProgressScreen() {
  const colors = useColors();
  const { isAuthenticated } = useAuth();

  // Données DB
  const { data: sessionStats, isLoading: loadingStats } = trpc.sessions.stats.useQuery(undefined, { enabled: isAuthenticated });
  const { data: checkIns = [], isLoading: loadingCI } = trpc.checkIns.list.useQuery({ limit: 30 }, { enabled: isAuthenticated });
  const { data: journalEntries = [] } = trpc.journal.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: sleepStats } = trpc.sleep.stats.useQuery(undefined, { enabled: isAuthenticated });
  const { data: sleepLogs = [] } = trpc.sleep.list.useQuery({ limit: 7 }, { enabled: isAuthenticated });
  const { data: myPrograms = [] } = trpc.programs.myPrograms.useQuery(undefined, { enabled: isAuthenticated });
  const { data: programsList = [] } = trpc.programs.list.useQuery();

  const isLoading = loadingStats || loadingCI;

  // Calculs dérivés
  const totalSessions = sessionStats?.totalSessions ?? 0;
  const totalMinutes = sessionStats?.totalMinutes ?? 0;
  const streak = sessionStats?.currentStreak ?? 0;
  const journalCount = journalEntries.length;

  // Distribution humeur 30 jours
  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    checkIns.forEach((ci) => { counts[ci.mood] = (counts[ci.mood] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [checkIns]);

  // Programmes en cours
  const activePrograms = useMemo(() => {
    return myPrograms
      .filter((p) => !p.isCompleted)
      .map((p) => {
        const prog = programsList.find((pl) => pl.slug === p.programSlug);
        const completed = JSON.parse(p.completedDays || '[]') as number[];
        return { ...p, title: prog?.title ?? p.programSlug, durationDays: prog?.durationDays ?? 0, completedCount: completed.length };
      });
  }, [myPrograms, programsList]);

  const completedPrograms = myPrograms.filter((p) => p.isCompleted).length;

  if (!isAuthenticated) {
    return (
      <ScreenContainer>
        <View style={styles.notAuthContainer}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🔒</Text>
          <Text style={[styles.notAuthTitle, { color: colors.foreground }]}>Connexion requise</Text>
          <Text style={[styles.notAuthSub, { color: colors.muted }]}>
            Connectez-vous pour voir votre progression personnalisée.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.ctaBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
            onPress={() => router.push('/(auth)/signin' as never)}
          >
            <Text style={styles.ctaBtnText}>Se connecter</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-[#0D0B1E]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Header ── */}
        <LinearGradient colors={['#1E1B4B', '#0D0B1E']} style={styles.header}>
          <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]} onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Retour</Text>
          </Pressable>
          <Text style={styles.title}>📊 Ma progression</Text>
          <Text style={styles.subtitle}>Votre parcours bien-être</Text>
        </LinearGradient>

        {isLoading ? (
          <ActivityIndicator color="#A78BFA" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* ── Stats rapides ── */}
            <View style={styles.statsGrid}>
              {[
                { value: totalSessions, label: 'Sessions', emoji: '🧘‍♀️', color: '#7C3AED' },
                { value: `${totalMinutes}m`, label: 'Méditées', emoji: '⏱️', color: '#0EA5E9' },
                { value: streak, label: 'Jours streak', emoji: '🔥', color: '#F59E0B' },
                { value: journalCount, label: 'Journal', emoji: '📖', color: '#22C55E' },
              ].map((stat) => (
                <View key={stat.label} style={[styles.statCard, { borderColor: stat.color + '40' }]}>
                  <Text style={styles.statEmoji}>{stat.emoji}</Text>
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.muted }]}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* ── Sommeil ── */}
            {sleepStats && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>🌙 Sommeil — 30 derniers jours</Text>
                <View style={styles.sleepStatsRow}>
                  <View style={styles.sleepStat}>
                    <Text style={[styles.sleepStatValue, { color: '#A78BFA' }]}>
                      {Math.floor((sleepStats.avgDurationMinutes ?? 0) / 60)}h{String((sleepStats.avgDurationMinutes ?? 0) % 60).padStart(2, '0')}
                    </Text>
                    <Text style={[styles.sleepStatLabel, { color: colors.muted }]}>Durée moy.</Text>
                  </View>
                  <View style={styles.sleepStat}>
                    <Text style={[styles.sleepStatValue, { color: '#22C55E' }]}>
                      {'⭐'.repeat(Math.round(sleepStats.avgQuality ?? 0))}
                    </Text>
                    <Text style={[styles.sleepStatLabel, { color: colors.muted }]}>Qualité moy.</Text>
                  </View>
                  <View style={styles.sleepStat}>
                    <Text style={[styles.sleepStatValue, { color: '#F59E0B' }]}>
                      {sleepStats.nightsAtGoal ?? 0}/{sleepStats.totalLogs ?? 0}
                    </Text>
                    <Text style={[styles.sleepStatLabel, { color: colors.muted }]}>Nuits ≥ 7h30</Text>
                  </View>
                </View>
                {sleepLogs.length > 0 && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={[styles.chartLabel, { color: colors.muted }]}>Durée de sommeil (7 jours)</Text>
                    <SleepBarsChart logs={sleepLogs} colors={colors} />
                    <View style={styles.sleepLegend}>
                      <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
                      <Text style={[styles.legendText, { color: colors.muted }]}>Objectif atteint (≥ 7h30)</Text>
                      <View style={[styles.legendDot, { backgroundColor: '#7C3AED', marginLeft: 12 }]} />
                      <Text style={[styles.legendText, { color: colors.muted }]}>En dessous</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* ── Humeur ── */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>💜 Humeur cette semaine</Text>
              <Text style={[styles.cardSubtitle, { color: colors.muted }]}>
                {checkIns.length === 0 ? 'Faites un check-in pour voir votre courbe' : 'Évolution de votre état émotionnel'}
              </Text>
              <MoodChart checkIns={checkIns} colors={colors} />
            </View>

            {/* ── Distribution humeur ── */}
            {moodCounts.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>🎭 Répartition des humeurs</Text>
                <Text style={[styles.cardSubtitle, { color: colors.muted }]}>Sur les 30 derniers jours</Text>
                {moodCounts.map(([mood, count]) => {
                  const pct = checkIns.length > 0 ? (count / checkIns.length) * 100 : 0;
                  return (
                    <View key={mood} style={styles.moodRow}>
                      <Text style={styles.moodEmoji}>{MOOD_EMOJI[mood] ?? '😐'}</Text>
                      <Text style={[styles.moodLabel, { color: colors.foreground }]}>{MOOD_LABEL[mood] ?? mood}</Text>
                      <View style={[styles.moodBarBg, { backgroundColor: colors.border }]}>
                        <View style={[styles.moodBarFill, { width: `${pct}%`, backgroundColor: MOOD_COLOR[mood] || colors.primary }]} />
                      </View>
                      <Text style={[styles.moodPct, { color: colors.muted }]}>{Math.round(pct)}%</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* ── Programmes ── */}
            {(activePrograms.length > 0 || completedPrograms > 0) && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>🌙 Programmes</Text>
                <View style={styles.programStatsRow}>
                  <View style={styles.programStat}>
                    <Text style={[styles.programStatValue, { color: '#A78BFA' }]}>{activePrograms.length}</Text>
                    <Text style={[styles.programStatLabel, { color: colors.muted }]}>En cours</Text>
                  </View>
                  <View style={styles.programStat}>
                    <Text style={[styles.programStatValue, { color: '#22C55E' }]}>{completedPrograms}</Text>
                    <Text style={[styles.programStatLabel, { color: colors.muted }]}>Terminés</Text>
                  </View>
                </View>
                {activePrograms.map((p) => {
                  const pct = p.durationDays > 0 ? (p.completedCount / p.durationDays) * 100 : 0;
                  return (
                    <Pressable
                      key={p.programSlug}
                      style={({ pressed }) => [styles.programRow, { opacity: pressed ? 0.8 : 1 }]}
                      onPress={() => router.push(`/program/${p.programSlug}` as never)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.programTitle, { color: colors.foreground }]} numberOfLines={1}>{p.title}</Text>
                        <View style={[styles.progBarBg, { backgroundColor: colors.border }]}>
                          <View style={[styles.progBarFill, { width: `${pct}%` }]} />
                        </View>
                        <Text style={[styles.progMeta, { color: colors.muted }]}>
                          Jour {p.currentDay} · {p.completedCount}/{p.durationDays} jours
                        </Text>
                      </View>
                      <Text style={{ color: colors.muted, fontSize: 18 }}>›</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* ── Empty state ── */}
            {totalSessions === 0 && checkIns.length === 0 && (
              <View style={styles.emptyCard}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>🌱</Text>
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Votre parcours commence ici</Text>
                <Text style={[styles.emptySub, { color: colors.muted }]}>
                  Complétez votre première méditation ou faites un check-in pour voir votre progression.
                </Text>
                <Pressable
                  style={({ pressed }) => [styles.ctaBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
                  onPress={() => router.push('/(tabs)/explore' as never)}
                >
                  <Text style={styles.ctaBtnText}>Explorer les méditations</Text>
                </Pressable>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  header: { padding: 20, paddingTop: 16, paddingBottom: 24 },
  backBtn: { color: '#A78BFA', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  title: { color: '#E9D5FF', fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#9CA3AF', fontSize: 14, marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, marginBottom: 16 },
  statCard: {
    flex: 1, minWidth: '44%', backgroundColor: '#1A1730', borderRadius: 16,
    padding: 14, alignItems: 'center', gap: 4, borderWidth: 1,
  },
  statEmoji: { fontSize: 22 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, textAlign: 'center' },
  card: {
    backgroundColor: '#1A1730', borderRadius: 18, padding: 16,
    marginHorizontal: 16, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  cardTitle: { color: '#E9D5FF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardSubtitle: { fontSize: 12, marginBottom: 12 },
  chartLabel: { fontSize: 12, marginBottom: 8 },
  sleepStatsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  sleepStat: { alignItems: 'center', gap: 4 },
  sleepStatValue: { fontSize: 18, fontWeight: '800' },
  sleepStatLabel: { fontSize: 11 },
  sleepLegend: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11 },
  moodRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  moodEmoji: { fontSize: 18, width: 24 },
  moodLabel: { width: 90, fontSize: 13 },
  moodBarBg: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  moodBarFill: { height: '100%', borderRadius: 3 },
  moodPct: { width: 32, fontSize: 11, textAlign: 'right' },
  programStatsRow: { flexDirection: 'row', gap: 20, marginBottom: 14 },
  programStat: { alignItems: 'center' },
  programStatValue: { fontSize: 24, fontWeight: '800' },
  programStatLabel: { fontSize: 12 },
  programRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
  },
  programTitle: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  progBarBg: { height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  progBarFill: { height: '100%', borderRadius: 2, backgroundColor: '#7C3AED' },
  progMeta: { fontSize: 11 },
  emptyCard: {
    backgroundColor: '#1A1730', borderRadius: 18, padding: 28,
    alignItems: 'center', marginHorizontal: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySub: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 20 },
  ctaBtn: { borderRadius: 999, paddingVertical: 13, paddingHorizontal: 24 },
  ctaBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  notAuthContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  notAuthTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  notAuthSub: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 24 },
});
