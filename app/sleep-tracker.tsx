import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { StarField } from "@/components/star-field";
import { trpc } from "@/lib/trpc";
import { useUser } from "@/lib/user-context";
import Svg, { Path, Circle, Line, Text as SvgText, Rect } from "react-native-svg";

// ─── Types ────────────────────────────────────────────────────────────────────

type MoodKey = "anxious" | "sad" | "neutral" | "calm" | "happy" | "energetic" | "grateful";

interface SleepFormData {
  bedtime: string;
  wakeTime: string;
  quality: number;
  hadNightWaking: boolean;
  nightWakings: number;
  eveningMood: MoodKey | null;
  usedMeditation: boolean;
  usedBreathing: boolean;
  usedAmbient: boolean;
  notes: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTodayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

function formatDate(dateStr: string): string {
  const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const d = new Date(dateStr + "T12:00:00");
  return days[d.getDay()];
}

function getQualityLabel(q: number): string {
  const labels = ["", "Très mauvais", "Mauvais", "Moyen", "Bon", "Excellent"];
  return labels[q] ?? "";
}

function getQualityColor(q: number): string {
  const colors = ["", "#EF4444", "#F97316", "#EAB308", "#22C55E", "#8B5CF6"];
  return colors[q] ?? "#6B7280";
}

const MOOD_OPTIONS: { key: MoodKey; emoji: string; label: string }[] = [
  { key: "anxious", emoji: "😰", label: "Anxieuse" },
  { key: "sad", emoji: "😔", label: "Triste" },
  { key: "neutral", emoji: "😐", label: "Neutre" },
  { key: "calm", emoji: "😌", label: "Calme" },
  { key: "happy", emoji: "😊", label: "Heureuse" },
  { key: "energetic", emoji: "⚡", label: "Énergique" },
  { key: "grateful", emoji: "🙏", label: "Reconnaissante" },
];

// ─── Graphique SVG ────────────────────────────────────────────────────────────

interface SleepChartProps {
  logs: Array<{ sleepDate: string; durationMinutes: number | null; quality: number | null }>;
}

function SleepChart({ logs }: SleepChartProps) {
  const WIDTH = 320;
  const HEIGHT = 160;
  const PADDING = { top: 16, right: 16, bottom: 32, left: 40 };
  const chartW = WIDTH - PADDING.left - PADDING.right;
  const chartH = HEIGHT - PADDING.top - PADDING.bottom;

  // Préparer les 7 derniers jours
  const last7: { date: string; duration: number; quality: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const log = logs.find((l) => l.sleepDate === dateStr);
    last7.push({
      date: dateStr,
      duration: log?.durationMinutes ?? 0,
      quality: log?.quality ?? 0,
    });
  }

  const maxDuration = Math.max(...last7.map((d) => d.duration), 600); // min 10h
  const GOAL = 450; // 7h30

  const xStep = chartW / 6;
  const points = last7.map((d, i) => ({
    x: PADDING.left + i * xStep,
    y: d.duration > 0 ? PADDING.top + chartH - (d.duration / maxDuration) * chartH : -1,
    duration: d.duration,
    quality: d.quality,
    date: d.date,
  }));

  // Ligne de l'objectif
  const goalY = PADDING.top + chartH - (GOAL / maxDuration) * chartH;

  // Construire le path SVG
  const validPoints = points.filter((p) => p.y >= 0);
  let pathD = "";
  if (validPoints.length > 1) {
    pathD = validPoints
      .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
      .join(" ");
  }

  return (
    <Svg width={WIDTH} height={HEIGHT}>
      {/* Grille horizontale */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
        const y = PADDING.top + chartH * (1 - frac);
        const hours = Math.round((maxDuration * frac) / 60);
        return (
          <React.Fragment key={frac}>
            <Line
              x1={PADDING.left}
              y1={y}
              x2={PADDING.left + chartW}
              y2={y}
              stroke="#2D2B5A"
              strokeWidth={0.5}
              strokeDasharray="4,4"
            />
            <SvgText
              x={PADDING.left - 6}
              y={y + 4}
              fontSize={9}
              fill="#6B7280"
              textAnchor="end"
            >
              {hours}h
            </SvgText>
          </React.Fragment>
        );
      })}

      {/* Ligne objectif 7h30 */}
      <Line
        x1={PADDING.left}
        y1={goalY}
        x2={PADDING.left + chartW}
        y2={goalY}
        stroke="#8B5CF6"
        strokeWidth={1}
        strokeDasharray="6,3"
        opacity={0.6}
      />
      <SvgText x={PADDING.left + chartW + 2} y={goalY + 4} fontSize={8} fill="#8B5CF6">
        7h30
      </SvgText>

      {/* Barres de durée */}
      {points.map((p, i) => {
        if (p.duration === 0) return null;
        const barW = xStep * 0.5;
        const barH = chartH - (p.y - PADDING.top);
        const color = p.quality >= 4 ? "#8B5CF6" : p.quality >= 3 ? "#6366F1" : p.quality >= 2 ? "#F59E0B" : "#EF4444";
        return (
          <Rect
            key={i}
            x={p.x - barW / 2}
            y={p.y}
            width={barW}
            height={barH}
            fill={color}
            opacity={0.3}
            rx={3}
          />
        );
      })}

      {/* Ligne de courbe */}
      {pathD ? (
        <Path
          d={pathD}
          stroke="#8B5CF6"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}

      {/* Points */}
      {points.map((p, i) => {
        if (p.y < 0) return null;
        return (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={p.quality > 0 ? getQualityColor(p.quality) : "#6B7280"}
            stroke="#0F0E2A"
            strokeWidth={1.5}
          />
        );
      })}

      {/* Labels jours */}
      {points.map((p, i) => (
        <SvgText
          key={i}
          x={p.x}
          y={HEIGHT - 6}
          fontSize={10}
          fill={p.duration > 0 ? "#C4B5FD" : "#4B5563"}
          textAnchor="middle"
        >
          {formatDate(p.date)}
        </SvgText>
      ))}
    </Svg>
  );
}

// ─── Écran principal ──────────────────────────────────────────────────────────

export default function SleepTrackerScreen() {
  const { isAuthenticated } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<SleepFormData>({
    bedtime: "22:30",
    wakeTime: "07:00",
    quality: 3,
    hadNightWaking: false,
    nightWakings: 0,
    eveningMood: null,
    usedMeditation: false,
    usedBreathing: false,
    usedAmbient: false,
    notes: "",
  });

  const utils = trpc.useUtils();

  const { data: logs = [], isLoading } = trpc.sleep.list.useQuery(
    { limit: 30 },
    { enabled: isAuthenticated }
  );

  const { data: stats } = trpc.sleep.stats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: weeklyReport } = trpc.sleep.weeklyReport.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createMutation = trpc.sleep.create.useMutation({
    onSuccess: () => {
      utils.sleep.list.invalidate();
      utils.sleep.stats.invalidate();
      setShowModal(false);
      resetForm();
    },
    onError: (e) => Alert.alert("Erreur", e.message),
  });

  const updateMutation = trpc.sleep.update.useMutation({
    onSuccess: () => {
      utils.sleep.list.invalidate();
      utils.sleep.stats.invalidate();
      setShowModal(false);
      setEditingId(null);
      resetForm();
    },
    onError: (e) => Alert.alert("Erreur", e.message),
  });

  const deleteMutation = trpc.sleep.delete.useMutation({
    onSuccess: () => {
      utils.sleep.list.invalidate();
      utils.sleep.stats.invalidate();
    },
  });

  const resetForm = useCallback(() => {
    setForm({
      bedtime: "22:30",
      wakeTime: "07:00",
      quality: 3,
      hadNightWaking: false,
      nightWakings: 0,
      eveningMood: null,
      usedMeditation: false,
      usedBreathing: false,
      usedAmbient: false,
      notes: "",
    });
  }, []);

  const openAddModal = useCallback(() => {
    resetForm();
    setEditingId(null);
    setShowModal(true);
  }, [resetForm]);

  const openEditModal = useCallback((log: (typeof logs)[0]) => {
    setForm({
      bedtime: log.bedtime ?? "22:30",
      wakeTime: log.wakeTime ?? "07:00",
      quality: log.quality ?? 3,
      hadNightWaking: log.hadNightWaking ?? false,
      nightWakings: log.nightWakings ?? 0,
      eveningMood: (log.eveningMood as MoodKey) ?? null,
      usedMeditation: log.usedMeditation ?? false,
      usedBreathing: log.usedBreathing ?? false,
      usedAmbient: log.usedAmbient ?? false,
      notes: log.notes ?? "",
    });
    setEditingId(log.id);
    setShowModal(true);
  }, []);

  const handleSave = useCallback(() => {
    const today = getTodayDate();
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...form, eveningMood: form.eveningMood ?? undefined });
    } else {
      createMutation.mutate({ sleepDate: today, ...form, eveningMood: form.eveningMood ?? undefined });
    }
  }, [form, editingId, createMutation, updateMutation]);

  const handleDelete = useCallback((id: number) => {
    Alert.alert("Supprimer", "Supprimer ce log de sommeil ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => deleteMutation.mutate({ id }) },
    ]);
  }, [deleteMutation]);

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <Text style={styles.emptyEmoji}>🔒</Text>
        <Text style={styles.emptyTitle}>Connexion requise</Text>
        <Text style={styles.emptyText}>Connectez-vous pour suivre votre sommeil</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push("/(auth)/welcome")}>
          <Text style={styles.primaryBtnText}>Se connecter</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-[#03020F]">
      <StarField />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Suivi du sommeil</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
            <Text style={styles.addBtnText}>+ Ajouter</Text>
          </TouchableOpacity>
        </View>

        {/* Stats globales */}
        {stats && (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🌙</Text>
              <Text style={styles.statValue}>{stats.totalLogs}</Text>
              <Text style={styles.statLabel}>Nuits suivies</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>⏱️</Text>
              <Text style={styles.statValue}>{formatDuration(stats.avgDurationMinutes)}</Text>
              <Text style={styles.statLabel}>Durée moy.</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>⭐</Text>
              <Text style={styles.statValue}>{stats.avgQuality.toFixed(1)}/5</Text>
              <Text style={styles.statLabel}>Qualité moy.</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🎯</Text>
              <Text style={styles.statValue}>{stats.nightsAtGoal}</Text>
              <Text style={styles.statLabel}>Nuits ≥ 7h30</Text>
            </View>
          </View>
        )}

        {/* Rapport hebdomadaire */}
        {weeklyReport && weeklyReport.thisWeek.nights > 0 && (
          <View style={[styles.chartCard, { marginBottom: 12 }]}>
            <Text style={styles.chartTitle}>📊 Bilan de la semaine</Text>
            <Text style={styles.chartSubtitle}>7 derniers jours vs semaine précédente</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <View style={{ flex: 1, backgroundColor: '#8B5CF622', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 22, fontWeight: '700', color: '#8B5CF6' }}>{weeklyReport.thisWeek.nights}</Text>
                <Text style={{ fontSize: 11, color: '#8B5CF6', marginTop: 2 }}>Nuits</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: '#22C55E22', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 22, fontWeight: '700', color: '#22C55E' }}>
                  {weeklyReport.thisWeek.avgDurationMinutes != null
                    ? `${Math.floor(weeklyReport.thisWeek.avgDurationMinutes / 60)}h${String(weeklyReport.thisWeek.avgDurationMinutes % 60).padStart(2, '0')}`
                    : '--'}
                </Text>
                <Text style={{ fontSize: 11, color: '#22C55E', marginTop: 2 }}>Durée moy.</Text>
                {weeklyReport.trends.duration !== 'stable' && (
                  <Text style={{ fontSize: 10, color: weeklyReport.trends.duration === 'up' ? '#22C55E' : '#EF4444', marginTop: 2 }}>
                    {weeklyReport.trends.duration === 'up' ? '↑ Hausse' : '↓ Baisse'}
                  </Text>
                )}
              </View>
              <View style={{ flex: 1, backgroundColor: '#F59E0B22', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 22, fontWeight: '700', color: '#F59E0B' }}>
                  {weeklyReport.thisWeek.avgQuality != null ? `${weeklyReport.thisWeek.avgQuality}/5` : '--'}
                </Text>
                <Text style={{ fontSize: 11, color: '#F59E0B', marginTop: 2 }}>Qualité moy.</Text>
                {weeklyReport.trends.quality !== 'stable' && (
                  <Text style={{ fontSize: 10, color: weeklyReport.trends.quality === 'up' ? '#22C55E' : '#EF4444', marginTop: 2 }}>
                    {weeklyReport.trends.quality === 'up' ? '↑ Améliorée' : '↓ Dégradée'}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
        {/* Graphique hebdomadaire */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Progression des 7 derniers jours</Text>
          <Text style={styles.chartSubtitle}>Durée et qualité du sommeil</Text>
          <View style={styles.chartWrapper}>
            <SleepChart logs={logs as Array<{ sleepDate: string; durationMinutes: number | null; quality: number | null }>} />
          </View>
          {/* Légende */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#8B5CF6" }]} />
              <Text style={styles.legendText}>Excellent</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#22C55E" }]} />
              <Text style={styles.legendText}>Bon</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#F59E0B" }]} />
              <Text style={styles.legendText}>Moyen</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#EF4444" }]} />
              <Text style={styles.legendText}>Mauvais</Text>
            </View>
          </View>
        </View>

        {/* Conseils selon la qualité */}
        {stats && stats.avgQuality < 3 && (
          <View style={styles.tipCard}>
            <Text style={styles.tipEmoji}>💡</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Conseil personnalisé</Text>
              <Text style={styles.tipText}>
                Votre qualité de sommeil est en dessous de la moyenne. Essayez la respiration 4-7-8 avant de dormir — elle réduit l'anxiété de 60% en 4 semaines.
              </Text>
              <TouchableOpacity onPress={() => router.push("/breathing")}>
                <Text style={styles.tipLink}>Essayer maintenant →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Historique */}
        <Text style={styles.sectionTitle}>Historique</Text>

        {isLoading && (
          <Text style={styles.loadingText}>Chargement...</Text>
        )}

        {!isLoading && logs.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌙</Text>
            <Text style={styles.emptyTitle}>Aucun suivi pour l'instant</Text>
            <Text style={styles.emptyText}>Commencez à noter votre sommeil pour voir votre progression</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={openAddModal}>
              <Text style={styles.primaryBtnText}>Ajouter ma première nuit</Text>
            </TouchableOpacity>
          </View>
        )}

        {logs.map((log) => (
          <View key={log.id} style={styles.logCard}>
            <View style={styles.logHeader}>
              <View>
                <Text style={styles.logDate}>{log.sleepDate}</Text>
                {log.bedtime && log.wakeTime && (
                  <Text style={styles.logTime}>{log.bedtime} → {log.wakeTime}</Text>
                )}
              </View>
              <View style={styles.logRight}>
                {log.durationMinutes ? (
                  <Text style={styles.logDuration}>{formatDuration(log.durationMinutes)}</Text>
                ) : null}
                {log.quality ? (
                  <View style={[styles.qualityBadge, { backgroundColor: getQualityColor(log.quality) + "33" }]}>
                    <Text style={[styles.qualityText, { color: getQualityColor(log.quality) }]}>
                      {getQualityLabel(log.quality)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Indicateurs */}
            <View style={styles.logIndicators}>
              {log.usedMeditation && <Text style={styles.indicator}>🧘 Méditation</Text>}
              {log.usedBreathing && <Text style={styles.indicator}>🌬️ Respiration</Text>}
              {log.usedAmbient && <Text style={styles.indicator}>🎵 Sons</Text>}
              {log.hadNightWaking && (
                <Text style={[styles.indicator, styles.indicatorWarn]}>
                  ⚠️ {log.nightWakings} réveil{(log.nightWakings ?? 0) > 1 ? "s" : ""}
                </Text>
              )}
            </View>

            {log.notes ? (
              <View style={styles.logNotesContainer}>
                <Text style={styles.logNotesIcon}>📝</Text>
                <Text style={styles.logNotes}>{log.notes}</Text>
              </View>
            ) : null}

            {/* Actions */}
            <View style={styles.logActions}>
              <TouchableOpacity onPress={() => openEditModal(log)} style={styles.editBtn}>
                <Text style={styles.editBtnText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(log.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal de saisie */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>
                {editingId ? "Modifier la nuit" : "Ajouter une nuit"}
              </Text>

              {/* Heures */}
              <Text style={styles.fieldLabel}>🌙 Heure de coucher</Text>
              <TextInput
                style={styles.timeInput}
                value={form.bedtime}
                onChangeText={(v) => setForm((f) => ({ ...f, bedtime: v }))}
                placeholder="22:30"
                placeholderTextColor="#6B7280"
                keyboardType="numbers-and-punctuation"
                returnKeyType="done"
              />

              <Text style={styles.fieldLabel}>☀️ Heure de réveil</Text>
              <TextInput
                style={styles.timeInput}
                value={form.wakeTime}
                onChangeText={(v) => setForm((f) => ({ ...f, wakeTime: v }))}
                placeholder="07:00"
                placeholderTextColor="#6B7280"
                keyboardType="numbers-and-punctuation"
                returnKeyType="done"
              />

              {/* Qualité */}
              <Text style={styles.fieldLabel}>⭐ Qualité du sommeil</Text>
              <View style={styles.qualityRow}>
                {[1, 2, 3, 4, 5].map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={[styles.qualityBtn, form.quality === q && { backgroundColor: getQualityColor(q) }]}
                    onPress={() => setForm((f) => ({ ...f, quality: q }))}
                  >
                    <Text style={[styles.qualityBtnText, form.quality === q && { color: "#fff" }]}>
                      {q}
                    </Text>
                    <Text style={styles.qualityBtnLabel}>{["", "😣", "😔", "😐", "😊", "😄"][q]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {form.quality > 0 && (
                <Text style={[styles.qualitySelected, { color: getQualityColor(form.quality) }]}>
                  {getQualityLabel(form.quality)}
                </Text>
              )}

              {/* Humeur du soir */}
              <Text style={styles.fieldLabel}>💭 Humeur du soir</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodRow}>
                {MOOD_OPTIONS.map((m) => (
                  <TouchableOpacity
                    key={m.key}
                    style={[styles.moodChip, form.eveningMood === m.key && styles.moodChipActive]}
                    onPress={() => setForm((f) => ({ ...f, eveningMood: f.eveningMood === m.key ? null : m.key }))}
                  >
                    <Text style={styles.moodEmoji}>{m.emoji}</Text>
                    <Text style={[styles.moodLabel, form.eveningMood === m.key && styles.moodLabelActive]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Réveils nocturnes */}
              <View style={styles.toggleRow}>
                <Text style={styles.fieldLabel}>⚠️ Réveil(s) nocturne(s)</Text>
                <TouchableOpacity
                  style={[styles.toggle, form.hadNightWaking && styles.toggleActive]}
                  onPress={() => setForm((f) => ({ ...f, hadNightWaking: !f.hadNightWaking }))}
                >
                  <Text style={styles.toggleText}>{form.hadNightWaking ? "Oui" : "Non"}</Text>
                </TouchableOpacity>
              </View>
              {form.hadNightWaking && (
                <View style={styles.wakingsRow}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <TouchableOpacity
                      key={n}
                      style={[styles.wakingBtn, form.nightWakings === n && styles.wakingBtnActive]}
                      onPress={() => setForm((f) => ({ ...f, nightWakings: n }))}
                    >
                      <Text style={[styles.wakingBtnText, form.nightWakings === n && { color: "#fff" }]}>{n}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Outils utilisés */}
              <Text style={styles.fieldLabel}>🛠️ Outils utilisés ce soir</Text>
              <View style={styles.toolsRow}>
                {[
                  { key: "usedMeditation" as const, label: "🧘 Méditation" },
                  { key: "usedBreathing" as const, label: "🌬️ Respiration" },
                  { key: "usedAmbient" as const, label: "🎵 Sons" },
                ].map((tool) => (
                  <TouchableOpacity
                    key={tool.key}
                    style={[styles.toolChip, form[tool.key] && styles.toolChipActive]}
                    onPress={() => setForm((f) => ({ ...f, [tool.key]: !f[tool.key] }))}
                  >
                    <Text style={[styles.toolLabel, form[tool.key] && styles.toolLabelActive]}>
                      {tool.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Notes */}
              <Text style={styles.fieldLabel}>📝 Notes (optionnel)</Text>
              <TextInput
                style={styles.notesInput}
                value={form.notes}
                onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))}
                placeholder="Comment vous êtes-vous sentie ?"
                placeholderTextColor="#6B7280"
                multiline
                numberOfLines={3}
                returnKeyType="done"
              />

              {/* Boutons */}
              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                  <Text style={styles.cancelBtnText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSave}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <Text style={styles.saveBtnText}>
                    {createMutation.isPending || updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

// ─── Palette SomnioPax v3 ────────────────────────────────────────────────
const S_BG      = '#03020F';
const S_SURFACE = '#0D0B22';
const S_GLASS   = 'rgba(255,255,255,0.04)';
const S_BORDER  = 'rgba(180,160,255,0.12)';
const S_GOLD    = '#C9A84C';
const S_GOLD_BG = 'rgba(201,168,76,0.14)';
const S_WHITE   = '#EDE9FF';
const S_LAV     = 'rgba(184,174,255,0.55)';
const S_LAV_DIM = 'rgba(184,174,255,0.35)';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: S_BG },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: { padding: 8 },
  backArrow: { fontSize: 22, color: S_LAV },
  headerTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 18, color: S_WHITE },
  addBtn: {
    backgroundColor: S_GOLD,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  addBtnText: { color: S_BG, fontSize: 13, fontWeight: '700' },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: S_GLASS,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: S_BORDER,
  },
  statEmoji: { fontSize: 22, marginBottom: 4 },
  statValue: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 20, color: S_GOLD },
  statLabel: { fontSize: 11, color: S_LAV_DIM, marginTop: 2, textAlign: 'center' },

  chartCard: {
    marginHorizontal: 16,
    backgroundColor: S_GLASS,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: S_BORDER,
  },
  chartTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 16, color: S_WHITE, marginBottom: 2 },
  chartSubtitle: { fontSize: 12, color: S_LAV_DIM, marginBottom: 12 },
  chartWrapper: { alignItems: "center" },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: "#9CA3AF" },

  tipCard: {
    marginHorizontal: 16,
    backgroundColor: S_GOLD_BG,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.22)',
  },
  tipEmoji: { fontSize: 24 },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 14, fontWeight: '700', color: S_GOLD, marginBottom: 4 },
  tipText: { fontSize: 13, color: S_LAV, lineHeight: 18 },
  tipLink: { fontSize: 13, color: S_GOLD, fontWeight: '600', marginTop: 6 },

  sectionTitle: {
    fontFamily: 'PlayfairDisplay-Medium',
    fontSize: 18,
    color: S_WHITE,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  loadingText: { color: S_LAV_DIM, textAlign: 'center', padding: 20 },

  emptyState: { alignItems: 'center', padding: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 18, color: S_WHITE, marginBottom: 8 },
  emptyText: { fontSize: 14, color: S_LAV_DIM, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  primaryBtn: {
    backgroundColor: S_GOLD,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  primaryBtnText: { color: S_BG, fontSize: 15, fontWeight: '700' },

  logCard: {
    marginHorizontal: 16,
    backgroundColor: S_GLASS,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: S_BORDER,
  },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  logDate: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 14, color: S_WHITE },
  logTime: { fontSize: 12, color: S_LAV_DIM, marginTop: 2 },
  logRight: { alignItems: 'flex-end', gap: 4 },
  logDuration: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 18, color: S_GOLD },
  qualityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  qualityText: { fontSize: 11, fontWeight: '600' },
  logIndicators: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  indicator: { fontSize: 11, color: S_LAV, backgroundColor: 'rgba(180,160,255,0.10)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  indicatorWarn: { color: '#FCD34D', backgroundColor: 'rgba(252,211,77,0.10)' },
  logNotesContainer: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: S_GOLD_BG, borderRadius: 10, padding: 10, marginBottom: 10, gap: 8 },
  logNotesIcon: { fontSize: 13, marginTop: 1 },
  logNotes: { flex: 1, fontSize: 13, color: S_GOLD, fontStyle: 'italic', lineHeight: 18 },
  logActions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  editBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: S_BORDER },
  editBtnText: { fontSize: 12, color: S_LAV },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)' },
  deleteBtnText: { fontSize: 12, color: '#F87171' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: S_SURFACE,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '90%',
    borderTopWidth: 1,
    borderColor: S_BORDER,
  },
  modalHandle: { width: 40, height: 4, backgroundColor: S_BORDER, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 20, color: S_WHITE, marginBottom: 20, textAlign: 'center' },

  fieldLabel: { fontSize: 14, fontWeight: '600', color: S_GOLD, marginBottom: 8, marginTop: 12 },
  timeInput: {
    backgroundColor: S_GLASS,
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    color: S_WHITE,
    borderWidth: 1,
    borderColor: S_BORDER,
    textAlign: 'center',
    letterSpacing: 2,
  },

  qualityRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  qualityBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: S_GLASS,
    borderRadius: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: S_BORDER,
  },
  qualityBtnText: { fontSize: 16, fontWeight: '700', color: S_LAV_DIM },
  qualityBtnLabel: { fontSize: 16 },
  qualitySelected: { fontSize: 13, fontWeight: '600', textAlign: 'center', marginTop: 4, color: S_GOLD },

  moodRow: { marginBottom: 4 },
  moodChip: {
    alignItems: 'center',
    backgroundColor: S_GLASS,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: S_BORDER,
  },
  moodChipActive: { borderColor: 'rgba(201,168,76,0.45)', backgroundColor: S_GOLD_BG },
  moodEmoji: { fontSize: 20 },
  moodLabel: { fontSize: 10, color: S_LAV_DIM, marginTop: 2 },
  moodLabelActive: { color: S_GOLD },

  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggle: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: S_GLASS,
    borderWidth: 1,
    borderColor: S_BORDER,
  },
  toggleActive: { backgroundColor: S_GOLD, borderColor: S_GOLD },
  toggleText: { fontSize: 13, color: S_LAV_DIM, fontWeight: '600' },

  wakingsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  wakingBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: S_GLASS,
    borderWidth: 1,
    borderColor: S_BORDER,
  },
  wakingBtnActive: { backgroundColor: S_GOLD, borderColor: S_GOLD },
  wakingBtnText: { fontSize: 15, fontWeight: '700', color: S_LAV_DIM },

  toolsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  toolChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: S_GLASS,
    borderWidth: 1,
    borderColor: S_BORDER,
  },
  toolChipActive: { backgroundColor: S_GOLD_BG, borderColor: 'rgba(201,168,76,0.4)' },
  toolLabel: { fontSize: 13, color: S_LAV_DIM },
  toolLabelActive: { color: S_GOLD },

  notesInput: {
    backgroundColor: S_GLASS,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: S_WHITE,
    borderWidth: 1,
    borderColor: S_BORDER,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: S_GLASS,
    borderWidth: 1,
    borderColor: S_BORDER,
  },
  cancelBtnText: { fontSize: 15, color: S_LAV_DIM, fontWeight: '600' },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: S_GOLD,
  },
  saveBtnText: { fontSize: 15, color: S_BG, fontWeight: '700' },
});
