import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Svg, { Path, Rect, Circle, Line, G, Text as SvgText } from "react-native-svg";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { StarField } from "@/components/star-field";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { trpc } from "@/lib/trpc";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_WIDTH = SCREEN_WIDTH - 48;
const CHART_HEIGHT = 160;
const MOOD_COLORS: Record<string, string> = {
  happy: "#F59E0B",
  grateful: "#10B981",
  calm: "#6366F1",
  neutral: "#9CA3AF",
  tired: "#94A3B8",
  anxious: "#F97316",
  sad: "#60A5FA",
  overwhelmed: "#EF4444",
  energetic: "#FBBF24",
};
const MOOD_LABELS: Record<string, string> = {
  happy: "Heureux",
  grateful: "Reconnaissant",
  calm: "Calme",
  neutral: "Neutre",
  tired: "Fatigué",
  anxious: "Anxieux",
  sad: "Triste",
  overwhelmed: "Dépassé",
  energetic: "Énergique",
};
const MOOD_SCORES: Record<string, number> = {
  happy: 5, grateful: 5, calm: 4, energetic: 4,
  neutral: 3, tired: 2, anxious: 2, sad: 1, overwhelmed: 1,
};

// ─── Composant graphique humeur ───────────────────────────────────────────────
function MoodChart({ data, colors }: { data: { date: string; mood: string }[]; colors: ReturnType<typeof useColors> }) {
  if (data.length === 0) {
    return (
      <View style={[styles.emptyChart, { backgroundColor: colors.surface }]}>
        <Text style={[styles.emptyChartText, { color: colors.muted }]}>
          Enregistrez votre humeur quotidiennement pour voir le graphique
        </Text>
      </View>
    );
  }

  const W = CHART_WIDTH;
  const H = CHART_HEIGHT;
  const PAD = { top: 16, right: 12, bottom: 24, left: 8 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const n = data.length;
  const xStep = n > 1 ? chartW / (n - 1) : chartW;

  const points = data.map((d, i) => ({
    x: PAD.left + (n > 1 ? i * xStep : chartW / 2),
    y: PAD.top + chartH - ((MOOD_SCORES[d.mood] ?? 3) / 5) * chartH,
    mood: d.mood,
    date: d.date,
  }));

  // Build smooth path
  let pathD = "";
  if (points.length === 1) {
    pathD = `M ${points[0].x} ${points[0].y}`;
  } else {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cp1x = points[i - 1].x + xStep * 0.4;
      const cp1y = points[i - 1].y;
      const cp2x = points[i].x - xStep * 0.4;
      const cp2y = points[i].y;
      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i].x} ${points[i].y}`;
    }
  }

  // Fill area
  const fillD = pathD
    + ` L ${points[points.length - 1].x} ${PAD.top + chartH}`
    + ` L ${points[0].x} ${PAD.top + chartH} Z`;

  // X-axis labels (show every ~7 days)
  const labelIndices = [0, Math.floor(n / 3), Math.floor(2 * n / 3), n - 1].filter(
    (v, i, arr) => arr.indexOf(v) === i && v < n
  );

  return (
    <Svg width={W} height={H}>
      {/* Grid lines */}
      {[1, 2, 3, 4, 5].map((v) => {
        const y = PAD.top + chartH - (v / 5) * chartH;
        return (
          <Line
            key={v}
            x1={PAD.left}
            y1={y}
            x2={W - PAD.right}
            y2={y}
            stroke={colors.border}
            strokeWidth={0.5}
            strokeDasharray="4,4"
          />
        );
      })}
      {/* Fill */}
      <Path d={fillD} fill={colors.primary} fillOpacity={0.12} />
      {/* Line */}
      <Path d={pathD} stroke={colors.primary} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Points */}
      {points.map((p, i) => (
        <G key={i}>
          <Circle cx={p.x} cy={p.y} r={4} fill={MOOD_COLORS[p.mood] ?? colors.primary} />
          <Circle cx={p.x} cy={p.y} r={2} fill="white" />
        </G>
      ))}
      {/* X labels */}
      {labelIndices.map((idx) => {
        const p = points[idx];
        const d = data[idx].date;
        const label = `${d.slice(8)}/${d.slice(5, 7)}`;
        return (
          <SvgText key={idx} x={p.x} y={H - 4} fontSize={9} fill={colors.muted} textAnchor="middle">
            {label}
          </SvgText>
        );
      })}
    </Svg>
  );
}

// ─── Composant graphique sommeil (barres) ─────────────────────────────────────
function SleepChart({
  data,
  colors,
}: {
  data: { sleepDate: string; durationMinutes: number | null; quality: number | null }[];
  colors: ReturnType<typeof useColors>;
}) {
  if (data.length === 0) {
    return (
      <View style={[styles.emptyChart, { backgroundColor: colors.surface }]}>
        <Text style={[styles.emptyChartText, { color: colors.muted }]}>
          Enregistrez votre sommeil quotidiennement pour voir le graphique
        </Text>
      </View>
    );
  }

  const W = CHART_WIDTH;
  const H = CHART_HEIGHT;
  const PAD = { top: 16, right: 12, bottom: 24, left: 8 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const n = data.length;
  const barW = Math.max(4, (chartW / n) - 2);
  const maxDur = Math.max(...data.map((d) => d.durationMinutes ?? 0), 480);
  const GOAL = 450; // 7h30

  const goalY = PAD.top + chartH - (GOAL / maxDur) * chartH;
  const labelIndices = [0, Math.floor(n / 3), Math.floor(2 * n / 3), n - 1].filter(
    (v, i, arr) => arr.indexOf(v) === i && v < n
  );

  return (
    <Svg width={W} height={H}>
      {/* Goal line */}
      <Line
        x1={PAD.left}
        y1={goalY}
        x2={W - PAD.right}
        y2={goalY}
        stroke={colors.success}
        strokeWidth={1}
        strokeDasharray="6,3"
      />
      <SvgText x={W - PAD.right - 2} y={goalY - 3} fontSize={8} fill={colors.success} textAnchor="end">
        7h30
      </SvgText>
      {/* Bars */}
      {data.map((d, i) => {
        const dur = d.durationMinutes ?? 0;
        const barH = (dur / maxDur) * chartH;
        const x = PAD.left + i * (chartW / n) + (chartW / n - barW) / 2;
        const y = PAD.top + chartH - barH;
        const isAtGoal = dur >= GOAL;
        return (
          <Rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={Math.max(barH, 2)}
            rx={2}
            fill={isAtGoal ? colors.success : colors.primary}
            fillOpacity={isAtGoal ? 0.85 : 0.6}
          />
        );
      })}
      {/* X labels */}
      {labelIndices.map((idx) => {
        const d = data[idx];
        const label = `${d.sleepDate.slice(8)}/${d.sleepDate.slice(5, 7)}`;
        const x = PAD.left + idx * (chartW / n) + (chartW / n) / 2;
        return (
          <SvgText key={idx} x={x} y={H - 4} fontSize={9} fill={colors.muted} textAnchor="middle">
            {label}
          </SvgText>
        );
      })}
    </Svg>
  );
}

// ─── Composant graphique sessions (barres par semaine) ────────────────────────
function SessionsChart({
  data,
  colors,
}: {
  data: { completedAt: Date | null; duration: number; category: string | null }[];
  colors: ReturnType<typeof useColors>;
}) {
  // Aggregate by week
  const weeks = useMemo(() => {
    const byWeek: Record<string, { sessions: number; minutes: number }> = {};
    data.forEach((s) => {
      if (!s.completedAt) return;
      const d = new Date(s.completedAt);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split("T")[0];
      if (!byWeek[key]) byWeek[key] = { sessions: 0, minutes: 0 };
      byWeek[key].sessions++;
      byWeek[key].minutes += s.duration;
    });
    return Object.entries(byWeek)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-5)
      .map(([week, v]) => ({ week, ...v }));
  }, [data]);

  if (weeks.length === 0) {
    return (
      <View style={[styles.emptyChart, { backgroundColor: colors.surface }]}>
        <Text style={[styles.emptyChartText, { color: colors.muted }]}>
          Complétez des sessions de méditation pour voir le graphique
        </Text>
      </View>
    );
  }

  const W = CHART_WIDTH;
  const H = CHART_HEIGHT;
  const PAD = { top: 16, right: 12, bottom: 24, left: 8 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const n = weeks.length;
  const maxSessions = Math.max(...weeks.map((w) => w.sessions), 7);
  const barW = Math.max(20, (chartW / n) - 8);

  return (
    <Svg width={W} height={H}>
      {[2, 4, 6].map((v) => {
        if (v > maxSessions) return null;
        const y = PAD.top + chartH - (v / maxSessions) * chartH;
        return (
          <Line key={v} x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
            stroke={colors.border} strokeWidth={0.5} strokeDasharray="4,4" />
        );
      })}
      {weeks.map((w, i) => {
        const barH = (w.sessions / maxSessions) * chartH;
        const x = PAD.left + i * (chartW / n) + (chartW / n - barW) / 2;
        const y = PAD.top + chartH - barH;
        return (
          <G key={i}>
            <Rect x={x} y={y} width={barW} height={Math.max(barH, 2)} rx={4}
              fill={colors.primary} fillOpacity={0.75} />
            <SvgText x={x + barW / 2} y={y - 4} fontSize={10} fill={colors.foreground} textAnchor="middle" fontWeight="600">
              {w.sessions}
            </SvgText>
            <SvgText x={x + barW / 2} y={H - 4} fontSize={9} fill={colors.muted} textAnchor="middle">
              S{i + 1}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

// ─── Score de bien-être (jauge circulaire) ────────────────────────────────────
function WellnessGauge({
  score,
  label,
  colors,
}: {
  score: number;
  label: string;
  colors: ReturnType<typeof useColors>;
}) {
  const R = 60;
  const CX = 80;
  const CY = 80;
  const STROKE = 12;
  const circumference = 2 * Math.PI * R;
  const progress = (score / 100) * circumference;
  const scoreColor = score >= 80 ? colors.success : score >= 60 ? colors.primary : score >= 40 ? colors.warning : colors.error;

  return (
    <View style={styles.gaugeContainer}>
      <Svg width={160} height={160}>
        {/* Background circle */}
        <Circle cx={CX} cy={CY} r={R} stroke={colors.border} strokeWidth={STROKE} fill="none" />
        {/* Progress arc */}
        <Circle
          cx={CX}
          cy={CY}
          r={R}
          stroke={scoreColor}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${progress} ${circumference}`}
          strokeDashoffset={circumference / 4}
          strokeLinecap="round"
          rotation="-90"
          origin={`${CX}, ${CY}`}
        />
        {/* Score text */}
        <SvgText x={CX} y={CY - 8} fontSize={32} fontWeight="700" fill={scoreColor} textAnchor="middle">
          {score}
        </SvgText>
        <SvgText x={CX} y={CY + 14} fontSize={12} fill={colors.muted} textAnchor="middle">
          /100
        </SvgText>
        <SvgText x={CX} y={CY + 32} fontSize={13} fontWeight="600" fill={colors.foreground} textAnchor="middle">
          {label}
        </SvgText>
      </Svg>
    </View>
  );
}

// ─── Écran principal ──────────────────────────────────────────────────────────
export default function StatsScreen() {
  const colors = useColors();
  const { isDark } = useThemeContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"mood" | "sleep" | "sessions">("mood");

  const { data: moodData = [], isLoading: moodLoading } = trpc.stats.mood30.useQuery();
  const { data: sleepData = [], isLoading: sleepLoading } = trpc.stats.sleep30.useQuery();
  const { data: sessionsData = [], isLoading: sessionsLoading } = trpc.stats.sessions30.useQuery();
  const { data: wellness } = trpc.stats.wellnessScore.useQuery();

  // Mood distribution
  const moodDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    moodData.forEach((d) => {
      counts[d.mood] = (counts[d.mood] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [moodData]);

  // Sleep averages
  const sleepAvg = useMemo(() => {
    const valid = sleepData.filter((d) => (d.durationMinutes ?? 0) > 0);
    if (valid.length === 0) return null;
    const avgMin = Math.round(valid.reduce((s, d) => s + (d.durationMinutes ?? 0), 0) / valid.length);
    const avgQuality = valid.filter((d) => (d.quality ?? 0) > 0);
    const avgQ = avgQuality.length > 0
      ? (avgQuality.reduce((s, d) => s + (d.quality ?? 0), 0) / avgQuality.length).toFixed(1)
      : "—";
    const h = Math.floor(avgMin / 60);
    const m = avgMin % 60;
    return { duration: `${h}h${m > 0 ? m + "m" : ""}`, quality: avgQ, nights: valid.length };
  }, [sleepData]);

  // Sessions stats
  const sessionStats = useMemo(() => {
    const total = sessionsData.length;
    const totalMin = sessionsData.reduce((s, d) => s + d.duration, 0);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return { total, time: h > 0 ? `${h}h${m > 0 ? m + "m" : ""}` : `${m}m` };
  }, [sessionsData]);

  const tabs = [
    { key: "mood" as const, label: "Humeur", emoji: "😊" },
    { key: "sleep" as const, label: "Sommeil", emoji: "🌙" },
    { key: "sessions" as const, label: "Sessions", emoji: "🧘" },
  ];

  return (
    <ScreenContainer containerClassName={isDark ? 'bg-[#03020F]' : 'bg-[#F0EDF8]'}>
      <StarField />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backArrow, { color: colors.primary }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Statistiques</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={{ paddingHorizontal: 24 }}>
          {/* Score de bien-être */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Score de bien-être</Text>
            <Text style={[styles.cardSubtitle, { color: colors.muted }]}>Basé sur les 7 derniers jours</Text>
            <View style={styles.gaugeRow}>
              <WellnessGauge
                score={wellness?.score ?? 0}
                label={wellness?.label ?? "Pas de données"}
                colors={colors}
              />
              <View style={styles.gaugeDetails}>
                {[
                  { label: "Humeur", score: wellness?.moodScore ?? 0, emoji: "😊" },
                  { label: "Sommeil", score: wellness?.sleepScore ?? 0, emoji: "🌙" },
                  { label: "Régularité", score: wellness?.consistencyScore ?? 0, emoji: "🔥" },
                ].map((item) => (
                  <View key={item.label} style={styles.gaugeDetailItem}>
                    <Text style={styles.gaugeDetailEmoji}>{item.emoji}</Text>
                    <View style={styles.gaugeDetailBar}>
                      <Text style={[styles.gaugeDetailLabel, { color: colors.muted }]}>{item.label}</Text>
                      <View style={[styles.gaugeBarBg, { backgroundColor: colors.border }]}>
                        <View
                          style={[
                            styles.gaugeBarFill,
                            { width: `${item.score}%` as `${number}%`, backgroundColor: colors.primary },
                          ]}
                        />
                      </View>
                    </View>
                    <Text style={[styles.gaugeDetailScore, { color: colors.foreground }]}>{item.score}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Résumé rapide */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.summaryEmoji}>😊</Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>{moodData.length}</Text>
              <Text style={[styles.summaryLabel, { color: colors.muted }]}>Check-ins</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.summaryEmoji}>🌙</Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>{sleepAvg?.duration ?? "—"}</Text>
              <Text style={[styles.summaryLabel, { color: colors.muted }]}>Moy. sommeil</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.summaryEmoji}>🧘</Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>{sessionStats.total}</Text>
              <Text style={[styles.summaryLabel, { color: colors.muted }]}>Sessions</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  activeTab === tab.key && { backgroundColor: colors.primary },
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[
                  styles.tabText,
                  { color: activeTab === tab.key ? "#fff" : colors.muted },
                ]}>
                  {tab.emoji} {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Graphique actif */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {activeTab === "mood" && (
              <>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Évolution de l'humeur</Text>
                <Text style={[styles.cardSubtitle, { color: colors.muted }]}>30 derniers jours</Text>
                <View style={{ marginTop: 12 }}>
                  {moodLoading ? (
                    <View style={[styles.emptyChart, { backgroundColor: colors.surface }]}>
                      <Text style={[styles.emptyChartText, { color: colors.muted }]}>Chargement...</Text>
                    </View>
                  ) : (
                    <MoodChart data={moodData} colors={colors} />
                  )}
                </View>
                {moodDistribution.length > 0 && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={[styles.sectionLabel, { color: colors.muted }]}>Distribution des humeurs</Text>
                    {moodDistribution.map(([mood, count]) => (
                      <View key={mood} style={styles.moodDistRow}>
                        <View style={[styles.moodDot, { backgroundColor: MOOD_COLORS[mood] ?? colors.primary }]} />
                        <Text style={[styles.moodDistLabel, { color: colors.foreground }]}>
                          {MOOD_LABELS[mood] ?? mood}
                        </Text>
                        <View style={[styles.moodDistBarBg, { backgroundColor: colors.border }]}>
                          <View
                            style={[
                              styles.moodDistBarFill,
                              {
                                width: `${(count / moodData.length) * 100}%` as `${number}%`,
                                backgroundColor: MOOD_COLORS[mood] ?? colors.primary,
                              },
                            ]}
                          />
                        </View>
                        <Text style={[styles.moodDistCount, { color: colors.muted }]}>{count}j</Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}

            {activeTab === "sleep" && (
              <>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Durée de sommeil</Text>
                <Text style={[styles.cardSubtitle, { color: colors.muted }]}>30 derniers jours · Objectif : 7h30</Text>
                <View style={{ marginTop: 12 }}>
                  {sleepLoading ? (
                    <View style={[styles.emptyChart, { backgroundColor: colors.surface }]}>
                      <Text style={[styles.emptyChartText, { color: colors.muted }]}>Chargement...</Text>
                    </View>
                  ) : (
                    <SleepChart data={sleepData} colors={colors} />
                  )}
                </View>
                {sleepAvg && (
                  <View style={[styles.sleepStats, { borderTopColor: colors.border }]}>
                    <View style={styles.sleepStatItem}>
                      <Text style={[styles.sleepStatValue, { color: colors.foreground }]}>{sleepAvg.duration}</Text>
                      <Text style={[styles.sleepStatLabel, { color: colors.muted }]}>Durée moy.</Text>
                    </View>
                    <View style={[styles.sleepStatDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.sleepStatItem}>
                      <Text style={[styles.sleepStatValue, { color: colors.foreground }]}>{sleepAvg.quality}/5</Text>
                      <Text style={[styles.sleepStatLabel, { color: colors.muted }]}>Qualité moy.</Text>
                    </View>
                    <View style={[styles.sleepStatDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.sleepStatItem}>
                      <Text style={[styles.sleepStatValue, { color: colors.foreground }]}>{sleepAvg.nights}</Text>
                      <Text style={[styles.sleepStatLabel, { color: colors.muted }]}>Nuits enreg.</Text>
                    </View>
                  </View>
                )}
              </>
            )}

            {activeTab === "sessions" && (
              <>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Sessions de méditation</Text>
                <Text style={[styles.cardSubtitle, { color: colors.muted }]}>Par semaine (5 dernières)</Text>
                <View style={{ marginTop: 12 }}>
                  {sessionsLoading ? (
                    <View style={[styles.emptyChart, { backgroundColor: colors.surface }]}>
                      <Text style={[styles.emptyChartText, { color: colors.muted }]}>Chargement...</Text>
                    </View>
                  ) : (
                    <SessionsChart data={sessionsData} colors={colors} />
                  )}
                </View>
                <View style={[styles.sleepStats, { borderTopColor: colors.border }]}>
                  <View style={styles.sleepStatItem}>
                    <Text style={[styles.sleepStatValue, { color: colors.foreground }]}>{sessionStats.total}</Text>
                    <Text style={[styles.sleepStatLabel, { color: colors.muted }]}>Sessions</Text>
                  </View>
                  <View style={[styles.sleepStatDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.sleepStatItem}>
                    <Text style={[styles.sleepStatValue, { color: colors.foreground }]}>{sessionStats.time}</Text>
                    <Text style={[styles.sleepStatLabel, { color: colors.muted }]}>Temps total</Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Tendances */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Tendances</Text>
            <View style={styles.trendsList}>
              {moodData.length >= 7 && (() => {
                const recent = moodData.slice(-7).map((d) => MOOD_SCORES[d.mood] ?? 3);
                const prev = moodData.slice(-14, -7).map((d) => MOOD_SCORES[d.mood] ?? 3);
                if (prev.length === 0) return null;
                const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length;
                const prevAvg = prev.reduce((s, v) => s + v, 0) / prev.length;
                const diff = recentAvg - prevAvg;
                const trend = diff > 0.3 ? "↑" : diff < -0.3 ? "↓" : "→";
                const trendColor = diff > 0.3 ? colors.success : diff < -0.3 ? colors.error : colors.muted;
                return (
                  <View key="mood-trend" style={styles.trendItem}>
                    <Text style={styles.trendEmoji}>😊</Text>
                    <View style={styles.trendContent}>
                      <Text style={[styles.trendLabel, { color: colors.foreground }]}>Humeur cette semaine</Text>
                      <Text style={[styles.trendDesc, { color: colors.muted }]}>
                        {diff > 0.3 ? "En amélioration" : diff < -0.3 ? "En baisse" : "Stable"} vs semaine précédente
                      </Text>
                    </View>
                    <Text style={[styles.trendArrow, { color: trendColor }]}>{trend}</Text>
                  </View>
                );
              })()}
              {sleepData.length >= 7 && (() => {
                const recent = sleepData.slice(-7).filter((d) => (d.durationMinutes ?? 0) > 0);
                const prev = sleepData.slice(-14, -7).filter((d) => (d.durationMinutes ?? 0) > 0);
                if (prev.length === 0 || recent.length === 0) return null;
                const recentAvg = recent.reduce((s, d) => s + (d.durationMinutes ?? 0), 0) / recent.length;
                const prevAvg = prev.reduce((s, d) => s + (d.durationMinutes ?? 0), 0) / prev.length;
                const diff = recentAvg - prevAvg;
                const trend = diff > 15 ? "↑" : diff < -15 ? "↓" : "→";
                const trendColor = diff > 15 ? colors.success : diff < -15 ? colors.error : colors.muted;
                return (
                  <View key="sleep-trend" style={styles.trendItem}>
                    <Text style={styles.trendEmoji}>🌙</Text>
                    <View style={styles.trendContent}>
                      <Text style={[styles.trendLabel, { color: colors.foreground }]}>Sommeil cette semaine</Text>
                      <Text style={[styles.trendDesc, { color: colors.muted }]}>
                        {diff > 15 ? `+${Math.round(diff)}min` : diff < -15 ? `${Math.round(diff)}min` : "Stable"} vs semaine précédente
                      </Text>
                    </View>
                    <Text style={[styles.trendArrow, { color: trendColor }]}>{trend}</Text>
                  </View>
                );
              })()}
              {moodData.length === 0 && sleepData.length === 0 && (
                <Text style={[styles.emptyChartText, { color: colors.muted }]}>
                  Commencez à enregistrer votre humeur et votre sommeil pour voir vos tendances.
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backArrow: { fontSize: 24 },
  headerTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 18 },
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 16, marginBottom: 2 },
  cardSubtitle: { fontSize: 12, marginBottom: 4 },
  sectionLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyChart: {
    height: CHART_HEIGHT,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyChartText: { fontSize: 13, textAlign: "center", lineHeight: 20 },
  gaugeRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  gaugeContainer: { alignItems: "center" },
  gaugeDetails: { flex: 1, paddingLeft: 12, gap: 10 },
  gaugeDetailItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  gaugeDetailEmoji: { fontSize: 16, width: 24 },
  gaugeDetailBar: { flex: 1 },
  gaugeDetailLabel: { fontSize: 11, marginBottom: 3 },
  gaugeBarBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  gaugeBarFill: { height: 6, borderRadius: 3 },
  gaugeDetailScore: { fontSize: 13, fontWeight: "700", width: 28, textAlign: "right" },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
  },
  summaryEmoji: { fontSize: 22 },
  summaryValue: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 18 },
  summaryLabel: { fontSize: 11, textAlign: 'center' },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    gap: 4,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabText: { fontSize: 11, fontWeight: '600' },
  moodDistRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  moodDot: { width: 10, height: 10, borderRadius: 5 },
  moodDistLabel: { fontSize: 13, width: 100 },
  moodDistBarBg: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  moodDistBarFill: { height: 6, borderRadius: 3 },
  moodDistCount: { fontSize: 12, width: 24, textAlign: 'right' },
  sleepStats: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  sleepStatItem: { flex: 1, alignItems: 'center' },
  sleepStatValue: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 18 },
  sleepStatLabel: { fontSize: 11, marginTop: 2 },
  sleepStatDivider: { width: 1, marginHorizontal: 8 },
  trendsList: { gap: 12, marginTop: 8 },
  trendItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  trendEmoji: { fontSize: 24, width: 32 },
  trendContent: { flex: 1 },
  trendLabel: { fontSize: 14, fontWeight: '600' },
  trendDesc: { fontSize: 12, marginTop: 2 },
  trendArrow: { fontSize: 22, fontWeight: '700' },
});
