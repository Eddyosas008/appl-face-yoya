import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useUser } from '@/lib/user-context';
import { MOOD_EMOJIS, MOOD_LABELS } from '@/lib/mock-data';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';

const MOOD_SCORE: Record<string, number> = {
  happy: 5,
  grateful: 5,
  calm: 4,
  neutral: 3,
  tired: 2,
  anxious: 2,
  sad: 1,
  overwhelmed: 1,
};

const MOOD_COLOR: Record<string, string> = {
  happy: '#22C55E',
  grateful: '#10B981',
  calm: '#6366F1',
  neutral: '#94A3B8',
  tired: '#F59E0B',
  anxious: '#F97316',
  sad: '#3B82F6',
  overwhelmed: '#EF4444',
};

function MoodChart({ checkIns, colors }: { checkIns: any[]; colors: any }) {
  const width = 320;
  const height = 140;
  const padding = { top: 16, right: 16, bottom: 32, left: 28 };

  const days = useMemo(() => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      result.push(d);
    }
    return result;
  }, []);

  const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const today = new Date();
  const todayDow = today.getDay();
  const startDow = (todayDow + 6) % 7;
  const labels = Array.from({ length: 7 }, (_, i) => {
    const dow = (startDow - 6 + i + 7) % 7;
    return dayLabels[dow];
  });

  const dataPoints = useMemo(() => {
    return days.map((day) => {
      const dayCheckIns = checkIns.filter((ci) => {
        const ciDate = new Date(ci.createdAt);
        ciDate.setHours(0, 0, 0, 0);
        return ciDate.getTime() === day.getTime();
      });
      if (dayCheckIns.length === 0) return null;
      const avgScore = dayCheckIns.reduce((sum, ci) => sum + (MOOD_SCORE[ci.mood] || 3), 0) / dayCheckIns.length;
      const lastMood = dayCheckIns[dayCheckIns.length - 1]?.mood;
      return { score: avgScore, mood: lastMood };
    });
  }, [checkIns, days]);

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const stepX = chartW / 6;

  const points = dataPoints.map((dp, i) => ({
    x: padding.left + i * stepX,
    y: dp ? padding.top + chartH - ((dp.score - 1) / 4) * chartH : null,
    dp,
  }));

  const validPoints = points.filter((p) => p.y !== null) as { x: number; y: number; dp: any }[];

  let pathD = '';
  let areaD = '';
  if (validPoints.length > 1) {
    pathD = validPoints
      .map((p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const prev = validPoints[i - 1];
        const cpX = (prev.x + p.x) / 2;
        return `C ${cpX} ${prev.y}, ${cpX} ${p.y}, ${p.x} ${p.y}`;
      })
      .join(' ');
    areaD =
      pathD +
      ` L ${validPoints[validPoints.length - 1].x} ${padding.top + chartH} L ${validPoints[0].x} ${padding.top + chartH} Z`;
  }

  const hasData = validPoints.length > 0;

  return (
    <View>
      <Svg width={width} height={height}>
        <Defs>
          <SvgGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#C084FC" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#C084FC" stopOpacity="0" />
          </SvgGradient>
        </Defs>
        {[1, 2, 3, 4].map((level) => {
          const y = padding.top + chartH - ((level - 1) / 4) * chartH;
          return (
            <Line key={level} x1={padding.left} y1={y} x2={width - padding.right} y2={y}
              stroke={colors.border} strokeWidth="1" strokeDasharray="4,4" />
          );
        })}
        {hasData && areaD && <Path d={areaD} fill="url(#moodGrad)" />}
        {hasData && pathD && <Path d={pathD} stroke="#C084FC" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
        {points.map((p, i) => {
          if (p.y === null) return null;
          const color = p.dp ? (MOOD_COLOR[p.dp.mood] || '#C084FC') : '#C084FC';
          return <Circle key={i} cx={p.x} cy={p.y} r={5} fill={color} stroke="#FFFFFF" strokeWidth="2" />;
        })}
        {points.map((p, i) => (
          <SvgText key={`label-${i}`} x={p.x} y={height - 4} textAnchor="middle" fontSize="11" fill={colors.muted}>
            {labels[i]}
          </SvgText>
        ))}
        {!hasData && (
          <SvgText x={width / 2} y={height / 2} textAnchor="middle" fontSize="13" fill={colors.muted}>
            Aucune donnée cette semaine
          </SvgText>
        )}
      </Svg>
      <View style={[StyleSheet.absoluteFill, { paddingTop: padding.top, paddingBottom: padding.bottom, paddingLeft: 0, paddingRight: width - padding.left + 4 }]}>
        {['😊', '😌', '😐', '😔'].map((emoji, i) => (
          <View key={i} style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 10 }}>{emoji}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ProgressScreen() {
  const colors = useColors();
  const { isAuthenticated } = useAuth();
  const { profile, checkIns, sessionHistory, journalEntries } = useUser();

  // Sessions depuis la DB (si connecté)
  const { data: dbSessions = [] } = trpc.sessions.list.useQuery(
    { limit: 10 },
    { enabled: isAuthenticated }
  );

  // Programmes en cours
  const { data: inProgressPrograms = [] } = trpc.programs.inProgress.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Stats
  const totalSessions = isAuthenticated ? dbSessions.length || sessionHistory.length : sessionHistory.length;
  const totalMinutes = isAuthenticated
    ? (dbSessions as any[]).reduce((sum, s) => sum + (s.duration || 0), 0)
    : sessionHistory.reduce((sum, s) => sum + (s.duration || 0), 0);
  const streak = profile?.currentStreak || 0;
  const journalCount = journalEntries.length;

  // Mood distribution (last 30 days)
  const last30 = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return checkIns.filter((ci) => new Date(ci.createdAt) >= cutoff);
  }, [checkIns]);

  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    last30.forEach((ci) => { counts[ci.mood] = (counts[ci.mood] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [last30]);

  // Weekly minutes chart data (from DB sessions if authenticated)
  const weeklyMinutes = useMemo(() => {
    const result = Array(7).fill(0);
    const now = new Date();
    const source = isAuthenticated && dbSessions.length > 0 ? dbSessions : sessionHistory;
    (source as any[]).forEach((s) => {
      const d = new Date(s.completedAt ?? s.createdAt);
      const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diff < 7) result[6 - diff] += s.duration || 0;
    });
    return result;
  }, [sessionHistory, dbSessions, isAuthenticated]);

  const maxWeeklyMin = Math.max(...weeklyMinutes, 1);

  // Sessions à afficher
  const displaySessions = isAuthenticated && dbSessions.length > 0
    ? (dbSessions as any[]).slice(0, 5)
    : sessionHistory.slice(-5).reverse();

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={22} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.title, { color: colors.foreground }]}>Ma progression</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Votre parcours bien-être</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { value: totalSessions, label: 'Sessions', emoji: '🧘‍♀️' },
            { value: totalMinutes, label: 'Minutes', emoji: '⏱️' },
            { value: streak, label: 'Jours streak', emoji: '🔥' },
            { value: journalCount, label: 'Journal', emoji: '📖' },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Text style={styles.statEmoji}>{stat.emoji}</Text>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Programmes en cours */}
        {(inProgressPrograms as any[]).length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Programmes en cours</Text>
            {(inProgressPrograms as any[]).map((prog, i) => (
              <Pressable
                key={prog.id}
                style={({ pressed }) => [
                  styles.sessionRow,
                  i < inProgressPrograms.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  { opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={() => router.push(`/program-day/${prog.programSlug}/${prog.nextDay}` as never)}
              >
                <Text style={{ fontSize: 28 }}>{prog.programEmoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sessionTitle, { color: colors.foreground }]} numberOfLines={1}>
                    {prog.programTitle}
                  </Text>
                  <Text style={[styles.sessionMeta, { color: colors.muted }]}>
                    Jour {prog.nextDay}/{prog.programDurationDays} · {prog.progressPct}% complété
                  </Text>
                  <View style={[styles.miniBarBg, { backgroundColor: colors.border }]}>
                    <View style={[styles.miniBarFill, { width: `${prog.progressPct}%` as any, backgroundColor: colors.primary }]} />
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={16} color={colors.muted} />
              </Pressable>
            ))}
          </View>
        )}

        {/* Mood chart */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Humeur cette semaine</Text>
          <Text style={[styles.cardSubtitle, { color: colors.muted }]}>
            {checkIns.length === 0 ? 'Commencez à faire des check-ins pour voir votre courbe' : 'Évolution de votre état émotionnel'}
          </Text>
          <MoodChart checkIns={checkIns} colors={colors} />
        </View>

        {/* Weekly minutes bar chart */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Minutes méditées (7 jours)</Text>
          <View style={styles.barChart}>
            {weeklyMinutes.map((min, i) => {
              const barH = Math.max(4, (min / maxWeeklyMin) * 80);
              const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
              const today = new Date().getDay();
              const startDow = (today + 6) % 7;
              const dow = (startDow - 6 + i + 7) % 7;
              return (
                <View key={i} style={styles.barItem}>
                  <Text style={[styles.barValue, { color: colors.muted }]}>{min > 0 ? `${min}m` : ''}</Text>
                  <View style={[styles.barBg, { backgroundColor: colors.border }]}>
                    <LinearGradient
                      colors={['#C084FC', '#7C3AED']}
                      style={[styles.barFill, { height: barH }]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: colors.muted }]}>{days[dow]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Mood distribution */}
        {moodCounts.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Humeurs ce mois</Text>
            {moodCounts.map(([mood, count]) => {
              const pct = last30.length > 0 ? (count / last30.length) * 100 : 0;
              return (
                <View key={mood} style={styles.moodRow}>
                  <Text style={styles.moodEmoji}>{MOOD_EMOJIS[mood]}</Text>
                  <Text style={[styles.moodLabel, { color: colors.foreground }]}>{MOOD_LABELS[mood]}</Text>
                  <View style={[styles.moodBarBg, { backgroundColor: colors.border }]}>
                    <View style={[styles.moodBarFill, { width: `${pct}%` as any, backgroundColor: MOOD_COLOR[mood] || colors.primary }]} />
                  </View>
                  <Text style={[styles.moodPct, { color: colors.muted }]}>{Math.round(pct)}%</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Recent sessions */}
        {displaySessions.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Sessions récentes</Text>
            {displaySessions.map((s: any, i: number) => (
              <View key={i} style={[styles.sessionRow, i < displaySessions.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <View style={[styles.sessionIcon, { backgroundColor: `${colors.primary}20` }]}>
                  <Text style={{ fontSize: 18 }}>🧘‍♀️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sessionTitle, { color: colors.foreground }]} numberOfLines={1}>
                    {s.meditationTitle || s.meditation?.title || 'Méditation'}
                  </Text>
                  <Text style={[styles.sessionMeta, { color: colors.muted }]}>
                    {s.duration} min · {new Date(s.completedAt ?? s.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
                <View style={[styles.durationBadge, { backgroundColor: `${colors.primary}15` }]}>
                  <Text style={[styles.durationText, { color: colors.primary }]}>{s.duration}m</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty state */}
        {totalSessions === 0 && (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🌱</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Votre parcours commence ici</Text>
            <Text style={[styles.emptySub, { color: colors.muted }]}>
              Complétez votre première méditation pour voir votre progression apparaître ici.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.startBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
              onPress={() => router.push('/(tabs)/explore')}
            >
              <Text style={styles.startBtnText}>Explorer les méditations</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
  statCard: { flex: 1, minWidth: '22%', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4 },
  statEmoji: { fontSize: 20 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, textAlign: 'center' },
  card: { borderRadius: 18, padding: 16, marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardSubtitle: { fontSize: 12, marginBottom: 12 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 110, paddingTop: 16 },
  barItem: { flex: 1, alignItems: 'center', gap: 4 },
  barValue: { fontSize: 9, height: 14 },
  barBg: { width: 20, height: 80, borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 11 },
  moodRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  moodEmoji: { fontSize: 18, width: 24 },
  moodLabel: { width: 90, fontSize: 13 },
  moodBarBg: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  moodBarFill: { height: '100%', borderRadius: 3 },
  moodPct: { width: 32, fontSize: 11, textAlign: 'right' },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  sessionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sessionTitle: { fontSize: 14, fontWeight: '600' },
  sessionMeta: { fontSize: 12, marginTop: 2 },
  durationBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  durationText: { fontSize: 12, fontWeight: '600' },
  miniBarBg: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 4 },
  miniBarFill: { height: '100%', borderRadius: 2 },
  emptyCard: { borderRadius: 18, padding: 28, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySub: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 20 },
  startBtn: { borderRadius: 999, paddingVertical: 13, paddingHorizontal: 24 },
  startBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
