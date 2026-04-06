import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Svg, {
  Path, Circle, Line, Text as SvgText,
  Defs, LinearGradient as SvgGradient, Stop, Rect,
} from 'react-native-svg';
import { useColors } from '@/hooks/use-colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ─── Types ──────────────────────────────────────────────────────────────────
interface MoodEntry {
  date: string; // YYYY-MM-DD
  mood: string;
}

interface Props {
  data: MoodEntry[];           // from trpc.stats.mood30Days
  localData?: MoodEntry[];     // fallback from local checkIns
}

// ─── Constants ───────────────────────────────────────────────────────────────
const MOOD_SCORE: Record<string, number> = {
  happy: 5, grateful: 5,
  calm: 4,
  neutral: 3,
  tired: 2, anxious: 2,
  sad: 1, overwhelmed: 1,
};

const MOOD_COLOR: Record<string, string> = {
  happy:       '#22C55E',
  grateful:    '#10B981',
  calm:        '#6366F1',
  neutral:     '#94A3B8',
  tired:       '#F59E0B',
  anxious:     '#F97316',
  sad:         '#3B82F6',
  overwhelmed: '#EF4444',
};

const MOOD_EMOJI: Record<string, string> = {
  happy: '😊', grateful: '🙏', calm: '😌', neutral: '😐',
  tired: '😴', anxious: '😰', sad: '😢', overwhelmed: '😵',
};

const MOOD_LABEL: Record<string, string> = {
  happy: 'Heureuse', grateful: 'Reconnaissante', calm: 'Calme', neutral: 'Neutre',
  tired: 'Fatiguée', anxious: 'Anxieuse', sad: 'Triste', overwhelmed: 'Submergée',
};

const SCORE_LABELS = ['', 'Difficile', 'Bas', 'Neutre', 'Bien', 'Excellent'];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getLast30Days(): string[] {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function getDominantMood(entries: MoodEntry[]): string | null {
  if (entries.length === 0) return null;
  const counts: Record<string, number> = {};
  entries.forEach((e) => { counts[e.mood] = (counts[e.mood] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function getTrend(entries: MoodEntry[]): 'up' | 'down' | 'stable' {
  if (entries.length < 6) return 'stable';
  const scores = entries.map((e) => MOOD_SCORE[e.mood] || 3);
  const first = scores.slice(0, Math.floor(scores.length / 2));
  const last = scores.slice(Math.floor(scores.length / 2));
  const avgFirst = first.reduce((a, b) => a + b, 0) / first.length;
  const avgLast = last.reduce((a, b) => a + b, 0) / last.length;
  if (avgLast - avgFirst > 0.4) return 'up';
  if (avgFirst - avgLast > 0.4) return 'down';
  return 'stable';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Courbe SVG sur 30 jours */
function MoodCurve({ entries, colors }: { entries: MoodEntry[]; colors: any }) {
  const screenW = Dimensions.get('window').width;
  const W = screenW - 60; // 16px scroll padding*2 + 14px card padding*2
  const H = 160;
  const pad = { top: 16, right: 12, bottom: 32, left: 32 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const days = useMemo(() => getLast30Days(), []);
  const byDate = useMemo(() => {
    const map: Record<string, MoodEntry> = {};
    entries.forEach((e) => { map[e.date] = e; });
    return map;
  }, [entries]);

  const points = useMemo(() =>
    days.map((date, i) => {
      const entry = byDate[date];
      const score = entry ? (MOOD_SCORE[entry.mood] || 3) : null;
      const x = pad.left + (i / 29) * chartW;
      const y = score !== null ? pad.top + chartH - ((score - 1) / 4) * chartH : undefined;
      return { x, y, date, entry, score };
    }),
  [days, byDate, chartW, chartH]);

  const validPoints = points.filter((p) => p.y !== undefined) as (typeof points[number] & { y: number })[];

  // Smooth bezier path
  let pathD = '';
  let areaD = '';
  if (validPoints.length > 1) {
    pathD = validPoints.map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = validPoints[i - 1];
      const cpX = (prev.x + p.x) / 2;
      return `C ${cpX} ${prev.y}, ${cpX} ${p.y}, ${p.x} ${p.y}`;
    }).join(' ');
    areaD = pathD +
      ` L ${validPoints[validPoints.length - 1].x} ${pad.top + chartH}` +
      ` L ${validPoints[0].x} ${pad.top + chartH} Z`;
  }

  // Week separators (every 7 days)
  const weekLines = [7, 14, 21].map((d) => pad.left + (d / 29) * chartW);

  // Y-axis grid lines (scores 1–5)
  const gridLines = [1, 2, 3, 4, 5].map((score) => ({
    y: pad.top + chartH - ((score - 1) / 4) * chartH,
    label: SCORE_LABELS[score],
  }));

  // X-axis labels: every 5 days
  const xLabels = [0, 6, 13, 20, 27, 29].map((i) => ({
    x: pad.left + (i / 29) * chartW,
    label: days[i] ? days[i].slice(5).replace('-', '/') : '',
  }));

  const hasData = validPoints.length > 0;

  return (
    <Svg width={W} height={H}>
      <Defs>
        <SvgGradient id="curve30Grad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#C084FC" stopOpacity="0.35" />
          <Stop offset="100%" stopColor="#C084FC" stopOpacity="0" />
        </SvgGradient>
      </Defs>

      {/* Grid lines */}
      {gridLines.map((g, i) => (
        <Line key={i} x1={pad.left} y1={g.y} x2={W - pad.right} y2={g.y}
          stroke={colors.border} strokeWidth="1" strokeDasharray="3,4" />
      ))}

      {/* Week separators */}
      {weekLines.map((x, i) => (
        <Line key={`w${i}`} x1={x} y1={pad.top} x2={x} y2={pad.top + chartH}
          stroke={colors.border} strokeWidth="1" strokeDasharray="2,6" strokeOpacity="0.5" />
      ))}

      {/* Y-axis labels */}
      {gridLines.filter((_, i) => i % 2 === 0).map((g, i) => (
        <SvgText key={i} x={pad.left - 4} y={g.y + 4}
          textAnchor="end" fontSize="9" fill={colors.muted}>
          {g.label.slice(0, 3)}
        </SvgText>
      ))}

      {/* Area fill */}
      {hasData && areaD && <Path d={areaD} fill="url(#curve30Grad)" />}

      {/* Curve */}
      {hasData && pathD && (
        <Path d={pathD} stroke="#C084FC" strokeWidth="2.5" fill="none"
          strokeLinecap="round" strokeLinejoin="round" />
      )}

      {/* Data points (colored by mood) */}
      {validPoints.map((p, i) => {
        const color = p.entry ? (MOOD_COLOR[p.entry.mood] || '#C084FC') : '#C084FC';
        return (
          <Circle key={i} cx={p.x} cy={p.y} r={4}
            fill={color} stroke="#FFFFFF" strokeWidth="1.5" />
        );
      })}

      {/* X-axis labels */}
      {xLabels.map((l, i) => (
        <SvgText key={i} x={l.x} y={H - 4}
          textAnchor="middle" fontSize="9" fill={colors.muted}>
          {l.label}
        </SvgText>
      ))}

      {/* Empty state */}
      {!hasData && (
        <SvgText x={W / 2} y={H / 2}
          textAnchor="middle" fontSize="13" fill={colors.muted}>
          Aucune donnée sur 30 jours
        </SvgText>
      )}
    </Svg>
  );
}

/** Heatmap calendrier 30 jours */
function MoodHeatmap({ entries, colors }: { entries: MoodEntry[]; colors: any }) {
  const days = useMemo(() => getLast30Days(), []);
  const byDate = useMemo(() => {
    const map: Record<string, MoodEntry> = {};
    entries.forEach((e) => { map[e.date] = e; });
    return map;
  }, [entries]);

  // Responsive: calcule la taille des cellules selon l'écran
  const screenW = Dimensions.get('window').width;
  const COLS = 6;
  const GAP = 5;
  const availW = screenW - 60 - GAP * (COLS - 1); // 16px scroll padding*2 + 14px card padding*2
  const CELL = Math.floor(availW / COLS);
  const totalW = COLS * CELL + GAP * (COLS - 1);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP, width: totalW, alignSelf: 'center' }}>
      {days.map((date, i) => {
        const entry = byDate[date];
        const color = entry ? (MOOD_COLOR[entry.mood] || colors.border) : colors.border;
        const opacity = entry ? 1 : 0.3;
        const dayNum = parseInt(date.split('-')[2], 10);
        return (
          <View
            key={date}
            style={[
              styles.heatCell,
              { width: CELL, height: CELL, backgroundColor: color, opacity },
            ]}
          >
            <Text style={styles.heatDay}>{dayNum}</Text>
            {entry && <Text style={styles.heatEmoji}>{MOOD_EMOJI[entry.mood] || '•'}</Text>}
          </View>
        );
      })}
    </View>
  );
}

/** Statistiques résumées */
function MoodStats({ entries, colors }: { entries: MoodEntry[]; colors: any }) {
  const dominant = getDominantMood(entries);
  const trend = getTrend(entries);
  const tracked = entries.length;
  const avgScore = entries.length > 0
    ? (entries.reduce((sum, e) => sum + (MOOD_SCORE[e.mood] || 3), 0) / entries.length).toFixed(1)
    : '—';

  const trendIcon = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️';
  const trendLabel = trend === 'up' ? 'En hausse' : trend === 'down' ? 'En baisse' : 'Stable';

  return (
    <View style={styles.statsRow}>
      <View style={[styles.statBox, { backgroundColor: `${colors.primary}15` }]}>
        <Text style={styles.statEmoji}>{dominant ? MOOD_EMOJI[dominant] : '—'}</Text>
        <Text style={[styles.statValue, { color: colors.foreground }]} numberOfLines={2}>
          {dominant ? MOOD_LABEL[dominant] : '—'}
        </Text>
        <Text style={[styles.statLabel, { color: colors.muted }]}>Humeur dominante</Text>
      </View>
      <View style={[styles.statBox, { backgroundColor: `${colors.primary}15` }]}>
        <Text style={styles.statEmoji}>{trendIcon}</Text>
        <Text style={[styles.statValue, { color: colors.foreground }]} numberOfLines={1}>{trendLabel}</Text>
        <Text style={[styles.statLabel, { color: colors.muted }]}>Tendance</Text>
      </View>
      <View style={[styles.statBox, { backgroundColor: `${colors.primary}15` }]}>
        <Text style={styles.statEmoji}>📊</Text>
        <Text style={[styles.statValue, { color: colors.foreground }]} numberOfLines={1}>{tracked}/30</Text>
        <Text style={[styles.statLabel, { color: colors.muted }]}>Jours trackés</Text>
      </View>
      <View style={[styles.statBox, { backgroundColor: `${colors.primary}15` }]}>
        <Text style={styles.statEmoji}>⭐</Text>
        <Text style={[styles.statValue, { color: colors.foreground }]} numberOfLines={1}>{avgScore}</Text>
        <Text style={[styles.statLabel, { color: colors.muted }]}>Score moyen</Text>
      </View>
    </View>
  );
}

/** Légende des humeurs */
function MoodLegend({ entries, colors }: { entries: MoodEntry[]; colors: any }) {
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    entries.forEach((e) => { c[e.mood] = (c[e.mood] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  }, [entries]);

  if (counts.length === 0) return null;

  return (
    <View style={styles.legendContainer}>
      {counts.map(([mood, count]) => {
        const pct = entries.length > 0 ? Math.round((count / entries.length) * 100) : 0;
        return (
          <View key={mood} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: MOOD_COLOR[mood] || '#94A3B8' }]} />
            <Text style={styles.legendEmoji}>{MOOD_EMOJI[mood]}</Text>
            <Text style={[styles.legendLabel, { color: colors.foreground }]}>{MOOD_LABEL[mood] || mood}</Text>
            <View style={[styles.legendBarBg, { backgroundColor: colors.border }]}>
              <View style={[styles.legendBarFill, { width: `${pct}%`, backgroundColor: MOOD_COLOR[mood] || colors.primary }]} />
            </View>
            <Text style={[styles.legendPct, { color: colors.muted }]}>{pct}%</Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type ViewMode = 'curve' | 'heatmap' | 'legend';

export function MoodChart30Days({ data, localData = [] }: Props) {
  const colors = useColors();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [view, setView] = useState<ViewMode>('curve');

  // Merge DB data with local data (DB takes priority)
  const entries = useMemo((): MoodEntry[] => {
    if (data.length > 0) return data;
    // Convert local checkIns to MoodEntry format
    return localData.map((e) => ({
      date: typeof e.date === 'string' ? e.date : new Date(e.date).toISOString().split('T')[0],
      mood: e.mood,
    }));
  }, [data, localData]);

  const tabs: { id: ViewMode; label: string; emoji: string }[] = [
    { id: 'curve', label: 'Courbe', emoji: '📈' },
    { id: 'heatmap', label: 'Calendrier', emoji: '🗓️' },
    { id: 'legend', label: 'Détail', emoji: '📊' },
  ];

  return (
    <View>
      {/* Stats summary */}
      <MoodStats entries={entries} colors={colors} />

      {/* Tab switcher */}
      <View style={[styles.tabRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.id}
            style={({ pressed }) => [
              styles.tabBtn,
              view === tab.id && { backgroundColor: colors.primary },
              { opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => setView(tab.id)}
          >
            <Text style={styles.tabEmoji}>{tab.emoji}</Text>
            <Text style={[
              styles.tabLabel,
              { color: view === tab.id ? '#FFFFFF' : colors.muted },
            ]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* View content */}
      <View style={styles.viewContainer}>
        {view === 'curve' && <MoodCurve entries={entries} colors={colors} />}
        {view === 'heatmap' && <MoodHeatmap entries={entries} colors={colors} />}
        {view === 'legend' && <MoodLegend entries={entries} colors={colors} />}
      </View>

      {/* Empty state hint */}
      {entries.length === 0 && (
        <View style={styles.emptyHint}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>🌱</Text>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            Faites votre premier check-in émotionnel pour voir votre graphique d'humeur apparaître ici.
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    minWidth: '44%', // 2 colonnes sur petits écrans
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 3,
  },
  statEmoji: { fontSize: 18 },
  statValue: { fontSize: 11, fontWeight: '700', textAlign: 'center', lineHeight: 15 },
  statLabel: { fontSize: 9, textAlign: 'center', lineHeight: 12 },
  tabRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 9,
  },
  tabEmoji: { fontSize: 13 },
  tabLabel: { fontSize: 12, fontWeight: '600' },
  viewContainer: {
    alignItems: 'center',
    minHeight: 160,
  },
  heatCell: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  heatDay: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
    textShadow: '0 1px 2px rgba(0,0,0,0.4)',
  },
  heatEmoji: { fontSize: 12 },
  legendContainer: { width: '100%', gap: 8 },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendEmoji: { fontSize: 16, width: 22 },
  legendLabel: { width: 100, fontSize: 13 },
  legendBarBg: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  legendBarFill: { height: '100%', borderRadius: 3 },
  legendPct: { width: 32, fontSize: 11, textAlign: 'right' },
  emptyHint: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
