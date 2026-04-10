import React, { useState, useCallback, useRef, useEffect } from "react";
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
  Animated,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/screen-container";
import { StarField } from "@/components/star-field";
import { HealthSyncCard } from "@/components/health-sync-card";
import { trpc } from "@/lib/trpc";
import { useUser } from "@/lib/user-context";
import Svg, {
  Path, Circle, Line, Text as SvgText, Rect,
  Defs, LinearGradient as SvgGradient, Stop,
} from "react-native-svg";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Palette ──────────────────────────────────────────────────────────────────
const GOLD   = "#C8A96E";
const NIGHT  = "#0D0B1A";
const PURPLE = "#2D1A6E";
const CARD   = "#1A1530";
const BORDER = "rgba(200,169,110,0.30)";

// ─── Types ────────────────────────────────────────────────────────────────────
type MoodKey = "anxious" | "sad" | "neutral" | "calm" | "happy" | "energetic" | "grateful";
type TabKey  = "overview" | "history" | "recommendations";

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
function getQualityLabel(q: number): string {
  return ["", "Très mauvais", "Mauvais", "Moyen", "Bon", "Excellent"][q] ?? "";
}
function getQualityColor(q: number): string {
  return ["", "#EF4444", "#F97316", "#EAB308", "#22C55E", "#8B5CF6"][q] ?? "#6B7280";
}
function getQualityEmoji(q: number): string {
  return ["", "😫", "😔", "😐", "😊", "✨"][q] ?? "😐";
}
function getSleepScoreColor(s: number): string {
  if (s >= 80) return "#22C55E";
  if (s >= 60) return GOLD;
  if (s >= 40) return "#F97316";
  return "#EF4444";
}
function getSleepScoreLabel(s: number): string {
  if (s >= 80) return "Excellent";
  if (s >= 60) return "Bon";
  if (s >= 40) return "Moyen";
  return "À améliorer";
}

const MOOD_OPTIONS: { key: MoodKey; emoji: string; label: string }[] = [
  { key: "anxious",   emoji: "😰", label: "Anxieux" },
  { key: "sad",       emoji: "😔", label: "Triste" },
  { key: "neutral",   emoji: "😐", label: "Neutre" },
  { key: "calm",      emoji: "😌", label: "Calme" },
  { key: "happy",     emoji: "😊", label: "Heureux" },
  { key: "energetic", emoji: "⚡", label: "Énergique" },
  { key: "grateful",  emoji: "🙏", label: "Reconnaissant" },
];

const SLEEP_TIPS = [
  { emoji: "📵", title: "Écrans éteints", desc: "Évitez les écrans 1h avant le coucher. La lumière bleue perturbe la mélatonine." },
  { emoji: "🌡️", title: "Chambre fraîche", desc: "La température idéale pour dormir est entre 16 et 19°C." },
  { emoji: "⏰", title: "Horaires fixes", desc: "Se coucher et se lever à la même heure renforce votre horloge biologique." },
  { emoji: "☕", title: "Caféine avant 14h", desc: "La caféine reste active 6 à 8h. Évitez-la l'après-midi." },
  { emoji: "🛁", title: "Bain chaud", desc: "Un bain chaud 1h avant le coucher favorise l'endormissement." },
  { emoji: "📖", title: "Routine du soir", desc: "Un rituel régulier signale à votre cerveau qu'il est temps de dormir." },
];

const AMBIENT_SOUNDS = [
  { slug: "rain",        name: "Pluie douce",     emoji: "🌧️", color: "#1E3A5F" },
  { slug: "forest",      name: "Forêt",           emoji: "🌲", color: "#1A3A2A" },
  { slug: "ocean",       name: "Océan",           emoji: "🌊", color: "#0F3460" },
  { slug: "white-noise", name: "Bruit blanc",     emoji: "🔊", color: "#2D1B69" },
  { slug: "brown-noise", name: "Bruit brun",      emoji: "🎵", color: "#3D2B1F" },
  { slug: "fire",        name: "Feu de cheminée", emoji: "🔥", color: "#4A1A0A" },
];

// ─── Score circulaire ──────────────────────────────────────────────────────────
function SleepScoreCircle({ score }: { score: number }) {
  const SIZE   = 110;
  const RADIUS = 44;
  const STROKE = 7;
  const CIRC   = 2 * Math.PI * RADIUS;
  const dash   = (score / 100) * CIRC;
  const color  = getSleepScoreColor(score);
  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" }}>
      <Svg width={SIZE} height={SIZE}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="rgba(200,169,110,0.15)" strokeWidth={STROKE} />
        <Circle
          cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
          fill="none" stroke={color} strokeWidth={STROKE}
          strokeDasharray={`${dash} ${CIRC - dash}`}
          strokeDashoffset={CIRC / 4} strokeLinecap="round"
        />
      </Svg>
      <View style={StyleSheet.absoluteFillObject as any} pointerEvents="none">
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 26, fontWeight: "700", color }}>{score}</Text>
          <Text style={{ fontSize: 9, color: "rgba(200,169,110,0.6)" }}>/ 100</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Graphique SVG ─────────────────────────────────────────────────────────────
function SleepChart({ logs, period }: { logs: any[]; period: "week" | "month" }) {
  const W = SCREEN_W - 48;
  const H = 170;
  const P = { top: 18, right: 14, bottom: 34, left: 42 };
  const cW = W - P.left - P.right;
  const cH = H - P.top - P.bottom;
  const days = period === "week" ? 7 : 14;

  const data: { date: string; duration: number; quality: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    const log = logs.find((l: any) => l.sleepDate === ds);
    data.push({ date: ds, duration: log?.durationMinutes ?? 0, quality: log?.quality ?? 0 });
  }

  const maxDur = Math.max(...data.map(d => d.duration), 600);
  const GOAL   = 450;
  const xStep  = cW / (days - 1);
  const goalY  = P.top + cH - (GOAL / maxDur) * cH;

  const pts = data.map((d, i) => ({
    x: P.left + i * xStep,
    y: d.duration > 0 ? P.top + cH - (d.duration / maxDur) * cH : -1,
    ...d,
  }));

  const linePath = pts.filter(p => p.y >= 0)
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <Svg width={W} height={H}>
      <Defs>
        <SvgGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={GOLD} stopOpacity="0.8" />
          <Stop offset="1" stopColor={PURPLE} stopOpacity="0.3" />
        </SvgGradient>
      </Defs>
      {[0, 0.25, 0.5, 0.75, 1].map(r => {
        const y = P.top + cH * r;
        return (
          <React.Fragment key={r}>
            <Line x1={P.left} y1={y} x2={P.left + cW} y2={y} stroke="rgba(200,169,110,0.1)" strokeWidth="1" />
            <SvgText x={P.left - 5} y={y + 4} fontSize="9" fill="rgba(200,169,110,0.45)" textAnchor="end">
              {formatDuration(Math.round(maxDur * (1 - r)))}
            </SvgText>
          </React.Fragment>
        );
      })}
      <Line x1={P.left} y1={goalY} x2={P.left + cW} y2={goalY} stroke={GOLD} strokeWidth="1" strokeDasharray="4,3" opacity="0.45" />
      <SvgText x={P.left + cW + 2} y={goalY + 4} fontSize="8" fill={GOLD} opacity="0.6">7h30</SvgText>
      {pts.map((p, i) => {
        const bW = Math.max(4, xStep * 0.52);
        const bH = p.duration > 0 ? cH - (p.y - P.top) : 3;
        const bc = p.quality >= 4 ? "#22C55E" : p.quality >= 3 ? GOLD : p.quality > 0 ? "#F97316" : "rgba(200,169,110,0.12)";
        const d  = new Date(p.date + "T12:00:00");
        const lb = ["D","L","M","M","J","V","S"][d.getDay()];
        return (
          <React.Fragment key={i}>
            <Rect x={p.x - bW/2} y={p.y >= 0 ? p.y : P.top + cH - 3} width={bW} height={bH} rx={3} fill={bc} opacity={0.82} />
            <SvgText x={p.x} y={P.top + cH + 14} fontSize="9" fill="rgba(200,169,110,0.55)" textAnchor="middle">{lb}</SvgText>
          </React.Fragment>
        );
      })}
      {linePath && <Path d={linePath} fill="none" stroke="rgba(139,92,246,0.65)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
      {pts.filter(p => p.y >= 0).map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={3} fill={getQualityColor(p.quality)} />
      ))}
    </Svg>
  );
}

// ─── Carte méditation ──────────────────────────────────────────────────────────
function MedCard({ med, onPress }: { med: any; onPress: () => void }) {
  const dur = med.audioDurationSeconds ? Math.round(med.audioDurationSeconds / 60) : 0;
  const emoji = med.categorySlug === "morning" ? "☀️" : med.categorySlug === "breathing" ? "💨" : med.categorySlug === "stress" ? "🌿" : "🌙";
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}
      style={{ width: 140, marginRight: 12, backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, overflow: "hidden" }}>
      <LinearGradient colors={["#2D1A6E", "#1A1530"]} style={{ padding: 12, minHeight: 96 }}>
        <Text style={{ fontSize: 22, marginBottom: 6 }}>{emoji}</Text>
        <Text style={{ fontSize: 12, fontWeight: "600", color: "#F0EBE0", lineHeight: 16 }} numberOfLines={2}>{med.title}</Text>
        <Text style={{ fontSize: 10, color: "rgba(200,169,110,0.7)", marginTop: 4 }}>
          {dur > 0 ? `${dur} min · ` : ""}{med.instructor ?? "Yoya"}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Notes de nuit (avec expansion et édition inline) ────────────────────────────
function LogNoteBlock({ notes, logId, onNoteUpdated }: { notes: string; logId: number; onNoteUpdated: (id: number, newNote: string) => void }) {
  const [expanded, setExpanded] = React.useState(false);
  const [editing, setEditing]   = React.useState(false);
  const [draft, setDraft]       = React.useState(notes);
  const isLong = notes.length > 80;

  const handleSave = () => {
    onNoteUpdated(logId, draft.trim());
    setEditing(false);
  };

  if (editing) {
    return (
      <View style={{
        marginTop: 8,
        backgroundColor: "rgba(200,169,110,0.08)",
        borderRadius: 10,
        borderLeftWidth: 2,
        borderLeftColor: GOLD,
        paddingHorizontal: 10,
        paddingVertical: 8,
      }}>
        <Text style={{ fontSize: 9, color: "rgba(200,169,110,0.5)", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>📓 Modifier la note</Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          multiline
          autoFocus
          style={{
            fontSize: 12, color: "#F0EBE0", fontStyle: "italic", lineHeight: 18,
            borderWidth: 1, borderColor: "rgba(200,169,110,0.30)", borderRadius: 8,
            padding: 8, minHeight: 60, backgroundColor: "rgba(0,0,0,0.2)",
          }}
          placeholderTextColor="rgba(200,169,110,0.4)"
          placeholder="Vos notes de nuit..."
        />
        <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
          <TouchableOpacity onPress={() => { setEditing(false); setDraft(notes); }}>
            <Text style={{ fontSize: 12, color: "rgba(200,169,110,0.5)" }}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={{ backgroundColor: GOLD, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 }}>
            <Text style={{ fontSize: 12, color: "#07051C", fontWeight: "700" }}>Sauver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{
      marginTop: 8,
      backgroundColor: "rgba(200,169,110,0.06)",
      borderRadius: 10,
      borderLeftWidth: 2,
      borderLeftColor: "rgba(200,169,110,0.40)",
      paddingHorizontal: 10,
      paddingVertical: 8,
    }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <Text style={{ fontSize: 9, color: "rgba(200,169,110,0.5)", letterSpacing: 0.8, textTransform: "uppercase" }}>📓 Notes de nuit</Text>
        <TouchableOpacity onPress={() => setEditing(true)} hitSlop={8}>
          <Text style={{ fontSize: 10, color: "rgba(200,169,110,0.55)" }}>✏️ Modifier</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => isLong && setExpanded(e => !e)} activeOpacity={isLong ? 0.75 : 1}>
        <Text
          style={{ fontSize: 12, color: "rgba(240,235,224,0.80)", fontStyle: "italic", lineHeight: 18 }}
          numberOfLines={expanded ? undefined : 3}
        >
          {notes}
        </Text>
        {isLong && (
          <Text style={{ fontSize: 10, color: "rgba(200,169,110,0.50)", marginTop: 5, textAlign: "right" }}>
            {expanded ? "Voir moins ▲" : "Voir plus ▼"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Carte son ambiant ─────────────────────────────────────────────────────────
function AmbientCard({ sound, onPress }: { sound: typeof AMBIENT_SOUNDS[0]; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}
      style={{ width: 96, marginRight: 10, backgroundColor: sound.color, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 12, alignItems: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 6 }}>{sound.emoji}</Text>
      <Text style={{ fontSize: 11, color: "#F0EBE0", textAlign: "center", fontWeight: "500" }} numberOfLines={2}>{sound.name}</Text>
    </TouchableOpacity>
  );
}

// ─── Écran principal ───────────────────────────────────────────────────────────
export default function SleepTrackerScreen() {
  const { isAuthenticated } = useUser();
  const [activeTab, setActiveTab]     = useState<TabKey>("overview");
  const [showModal, setShowModal]     = useState(false);
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [chartPeriod, setChartPeriod] = useState<"week" | "month">("week");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [historyFilter, setHistoryFilter] = useState<"all" | "notes" | "q4" | "q5">("all");
  const [form, setForm] = useState<SleepFormData>({
    bedtime: "22:30", wakeTime: "07:00", quality: 3,
    hadNightWaking: false, nightWakings: 0, eveningMood: null,
    usedMeditation: false, usedBreathing: false, usedAmbient: false, notes: "",
  });

  const utils = trpc.useUtils();
  const { data: logs = [], isLoading } = trpc.sleep.list.useQuery({ limit: 30 }, { enabled: isAuthenticated });
  const { data: stats }         = trpc.sleep.stats.useQuery(undefined, { enabled: isAuthenticated });
  const { data: weeklyReport }  = trpc.sleep.weeklyReport.useQuery(undefined, { enabled: isAuthenticated });
  const { data: recs }          = trpc.sleep.recommendations.useQuery(undefined, { enabled: isAuthenticated });

  const invalidate = () => {
    utils.sleep.list.invalidate();
    utils.sleep.stats.invalidate();
    utils.sleep.recommendations.invalidate();
  };

  const createMutation = trpc.sleep.create.useMutation({
    onSuccess: () => { invalidate(); setShowModal(false); resetForm(); },
    onError: (e) => Alert.alert("Erreur", e.message),
  });
  const updateMutation = trpc.sleep.update.useMutation({
    onSuccess: () => { invalidate(); setShowModal(false); setEditingId(null); resetForm(); },
    onError: (e) => Alert.alert("Erreur", e.message),
  });
  const deleteMutation = trpc.sleep.delete.useMutation({ onSuccess: invalidate });

  const handleNoteUpdate = useCallback((logId: number, newNote: string) => {
    const log = (logs as any[]).find((l: any) => l.id === logId);
    if (!log) return;
    updateMutation.mutate({
      id: logId,
      bedtime: log.bedtime ?? "22:30",
      wakeTime: log.wakeTime ?? "07:00",
      quality: log.quality ?? 3,
      nightWakings: log.nightWakings ?? 0,
      eveningMood: log.eveningMood ?? undefined,
      usedMeditation: log.usedMeditation ?? false,
      usedBreathing: log.usedBreathing ?? false,
      usedAmbient: log.usedAmbient ?? false,
      notes: newNote || undefined,
    });
  }, [logs, updateMutation]);

  const resetForm = useCallback(() => {
    setForm({ bedtime: "22:30", wakeTime: "07:00", quality: 3, hadNightWaking: false, nightWakings: 0, eveningMood: null, usedMeditation: false, usedBreathing: false, usedAmbient: false, notes: "" });
  }, []);

  const openEdit = useCallback((log: any) => {
    setEditingId(log.id);
    setForm({
      bedtime: log.bedtime ?? "22:30", wakeTime: log.wakeTime ?? "07:00", quality: log.quality ?? 3,
      hadNightWaking: (log.nightWakings ?? 0) > 0, nightWakings: log.nightWakings ?? 0,
      eveningMood: log.eveningMood ?? null, usedMeditation: log.usedMeditation ?? false,
      usedBreathing: log.usedBreathing ?? false, usedAmbient: log.usedAmbient ?? false, notes: log.notes ?? "",
    });
    setShowModal(true);
  }, []);

  const handleSave = useCallback(() => {
    const payload = {
      sleepDate: editingId ? (logs as any[]).find((l: any) => l.id === editingId)?.sleepDate ?? getTodayDate() : getTodayDate(),
      bedtime: form.bedtime, wakeTime: form.wakeTime, quality: form.quality,
      nightWakings: form.hadNightWaking ? form.nightWakings : 0,
      eveningMood: form.eveningMood ?? undefined,
      usedMeditation: form.usedMeditation, usedBreathing: form.usedBreathing, usedAmbient: form.usedAmbient,
      notes: form.notes.trim() || undefined,
    };
    if (editingId) updateMutation.mutate({ id: editingId, ...payload });
    else createMutation.mutate(payload);
  }, [form, editingId, logs, createMutation, updateMutation]);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const todayStr = getTodayDate();
  const todayLog = (logs as any[]).find((l: any) => l.sleepDate === todayStr);
  const sleepScore = recs?.sleepScore ?? (stats ? Math.min(100, Math.round(((stats.avgQuality ?? 3) / 5) * 70 + 30)) : 0);
  const isPending  = createMutation.isPending || updateMutation.isPending;

  return (
    <ScreenContainer containerClassName="bg-[#0D0B1A]" safeAreaClassName="bg-[#0D0B1A]">
      <StarField />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* HEADER */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <Text style={s.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.headerTitle}>Suivi du sommeil</Text>
              <Text style={s.headerSub}>Analysez et améliorez votre repos</Text>
            </View>
            <TouchableOpacity onPress={() => { resetForm(); setEditingId(null); setShowModal(true); }} style={s.addBtn}>
              <Text style={s.addBtnText}>+ Nuit</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* SCORE GLOBAL */}
        {isAuthenticated && (
          <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: 20, marginBottom: 20 }}>
            <LinearGradient colors={["#2D1A6E", "#1A1240", "#0D0B1A"]} style={s.scoreCard}>
              <View style={{ alignItems: "center" }}>
                <SleepScoreCircle score={sleepScore} />
                <Text style={[s.scoreLabel, { color: getSleepScoreColor(sleepScore) }]}>{getSleepScoreLabel(sleepScore)}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={s.scoreTitle}>Score de sommeil</Text>
                <Text style={s.scoreDesc}>7 derniers jours</Text>
                <View style={{ flexDirection: "row", gap: 14, marginTop: 10 }}>
                  {[
                    { val: stats?.avgQuality ? `${stats.avgQuality}/5` : "—", lbl: "Qualité" },
                    { val: stats?.avgDurationMinutes ? formatDuration(stats.avgDurationMinutes) : "—", lbl: "Durée" },
                    { val: String(stats?.totalLogs ?? 0), lbl: "Nuits" },
                  ].map(m => (
                    <View key={m.lbl} style={{ alignItems: "center" }}>
                      <Text style={s.metaVal}>{m.val}</Text>
                      <Text style={s.metaLbl}>{m.lbl}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* NUIT D'AUJOURD'HUI */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🌙 Cette nuit</Text>
          <TouchableOpacity
            onPress={() => todayLog ? openEdit(todayLog) : (() => { resetForm(); setEditingId(null); setShowModal(true); })()}
            activeOpacity={0.85}
          >
            <LinearGradient colors={todayLog ? ["#1A3A2A", "#1A1530"] : ["#2D1A6E", "#1A1240"]} style={s.todayCard}>
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <Text style={{ fontSize: 30 }}>{todayLog ? getQualityEmoji(todayLog.quality ?? 3) : "🌙"}</Text>
                <View style={{ marginLeft: 14 }}>
                  <Text style={s.todayTitle}>{todayLog ? "Nuit enregistrée" : "Enregistrer cette nuit"}</Text>
                  {todayLog ? (
                    <>
                      <Text style={s.todaySub}>{todayLog.bedtime} → {todayLog.wakeTime}{todayLog.durationMinutes ? ` · ${formatDuration(todayLog.durationMinutes)}` : ""}</Text>
                      <View style={s.qualBadge}>
                        <View style={[s.qualDot, { backgroundColor: getQualityColor(todayLog.quality ?? 3) }]} />
                        <Text style={[s.qualText, { color: getQualityColor(todayLog.quality ?? 3) }]}>{getQualityLabel(todayLog.quality ?? 3)}</Text>
                      </View>
                    </>
                  ) : (
                    <Text style={s.todaySub}>Coucher · Lever · Qualité · Humeur</Text>
                  )}
                </View>
              </View>
              <Text style={{ color: GOLD, fontSize: 18 }}>{todayLog ? "✏️" : "+"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ONGLETS */}
        <View style={s.tabs}>
          {([
            { key: "overview",        label: "Aperçu" },
            { key: "history",         label: "Historique" },
            { key: "recommendations", label: "Conseils" },
          ] as { key: TabKey; label: string }[]).map(tab => (
            <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)}
              style={[s.tab, activeTab === tab.key && s.tabActive]}>
              <Text style={[s.tabText, activeTab === tab.key && s.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── APERÇU ── */}
        {activeTab === "overview" && (
          <View>
            {/* Graphique */}
            <View style={s.section}>
              <View style={s.rowBetween}>
                <Text style={s.sectionTitle}>📊 Graphique</Text>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {(["week", "month"] as const).map(p => (
                    <TouchableOpacity key={p} onPress={() => setChartPeriod(p)}
                      style={[s.periodBtn, chartPeriod === p && s.periodBtnActive]}>
                      <Text style={[s.periodBtnText, chartPeriod === p && { color: GOLD, fontWeight: "600" }]}>{p === "week" ? "7j" : "14j"}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={s.chartBox}>
                {(logs as any[]).length > 0 ? <SleepChart logs={logs as any[]} period={chartPeriod} /> : (
                  <View style={{ height: 100, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: "rgba(200,169,110,0.4)", fontSize: 13 }}>Enregistrez vos nuits pour voir le graphique</Text>
                  </View>
                )}
              </View>
              <View style={{ flexDirection: "row", justifyContent: "center", gap: 14, marginTop: 8 }}>
                {[{ c: GOLD, l: "Durée (barres)" }, { c: "#8B5CF6", l: "Qualité (courbe)" }, { c: GOLD, l: "Objectif 7h30", o: 0.45 }].map(i => (
                  <View key={i.l} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i.c, opacity: i.o ?? 1 }} />
                    <Text style={{ fontSize: 10, color: "rgba(200,169,110,0.55)" }}>{i.l}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Stats */}
            {stats && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>📈 Statistiques</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                  {[
                    { emoji: "🌙", val: String(stats.totalLogs ?? 0), lbl: "Nuits enregistrées" },
                    { emoji: "⏱️", val: stats.avgDurationMinutes ? formatDuration(stats.avgDurationMinutes) : "—", lbl: "Durée moyenne" },
                    { emoji: "⭐", val: stats.avgQuality ? `${stats.avgQuality}/5` : "—", lbl: "Qualité moyenne" },
                    { emoji: "🏆", val: stats.bestNightMinutes ? formatDuration(stats.bestNightMinutes) : "—", lbl: "Meilleure nuit" },
                  ].map(st => (
                    <View key={st.lbl} style={s.statCard}>
                      <Text style={{ fontSize: 20, marginBottom: 5 }}>{st.emoji}</Text>
                      <Text style={s.statVal}>{st.val}</Text>
                      <Text style={s.statLbl}>{st.lbl}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Rapport hebdo */}
            {weeklyReport && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>📅 Cette semaine vs semaine dernière</Text>
                <View style={s.weekCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.weekColTitle}>Cette semaine</Text>
                    <Text style={s.weekVal}>{weeklyReport.thisWeek.nights} nuits</Text>
                    <Text style={s.weekSub}>{weeklyReport.thisWeek.avgDurationMinutes ? formatDuration(weeklyReport.thisWeek.avgDurationMinutes) : "—"} moy.</Text>
                    <Text style={s.weekSub}>Qualité {weeklyReport.thisWeek.avgQuality ? `${weeklyReport.thisWeek.avgQuality}/5` : "—"}</Text>
                  </View>
                  <View style={{ width: 1, height: 60, backgroundColor: BORDER, marginHorizontal: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.weekColTitle}>Semaine dernière</Text>
                    <Text style={s.weekVal}>{weeklyReport.lastWeek.nights} nuits</Text>
                    <Text style={s.weekSub}>{weeklyReport.lastWeek.avgDurationMinutes ? formatDuration(weeklyReport.lastWeek.avgDurationMinutes) : "—"} moy.</Text>
                    <Text style={s.weekSub}>Qualité {weeklyReport.lastWeek.avgQuality ? `${weeklyReport.lastWeek.avgQuality}/5` : "—"}</Text>
                  </View>
                  <View style={{ alignItems: "center", marginLeft: 12 }}>
                    <Text style={{ fontSize: 22 }}>{weeklyReport.trends.quality === "up" ? "📈" : weeklyReport.trends.quality === "down" ? "📉" : "➡️"}</Text>
                    <Text style={{ fontSize: 10, color: "rgba(200,169,110,0.6)", marginTop: 4, textAlign: "center" }}>
                      {weeklyReport.trends.quality === "up" ? "En progrès" : weeklyReport.trends.quality === "down" ? "En baisse" : "Stable"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Montre connectée — Apple Health / Google Health Connect */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>⌚ Montre connectée</Text>
              <HealthSyncCard
                onSyncComplete={() => {
                  invalidate();
                }}
              />
              {/* Autres appareils — bientôt disponibles */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                {[
                  { name: "Garmin",    emoji: "⌚" },
                  { name: "Fitbit",    emoji: "📊" },
                  { name: "Withings",  emoji: "💤" },
                  { name: "Oura Ring", emoji: "💍" },
                ].map(opt => (
                  <TouchableOpacity key={opt.name}
                    onPress={() => Alert.alert("Bientôt disponible", `L'intégration avec ${opt.name} sera disponible dans une prochaine mise à jour.`)}
                    style={s.watchOption}>
                    <Text style={{ fontSize: 16 }}>{opt.emoji}</Text>
                    <Text style={s.watchOptionText}>{opt.name}</Text>
                    <Text style={s.watchBadge}>Bientôt</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Conseils */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>💡 Conseils scientifiques</Text>
              {SLEEP_TIPS.map((tip, i) => (
                <View key={i} style={s.tipCard}>
                  <Text style={{ fontSize: 18, width: 30 }}>{tip.emoji}</Text>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={s.tipTitle}>{tip.title}</Text>
                    <Text style={s.tipDesc}>{tip.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── HISTORIQUE ── */}
        {activeTab === "history" && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>📋 Historique des nuits</Text>

            {/* Filtres */}
            {(logs as any[]).length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }} contentContainerStyle={{ gap: 8 }}>
                {([
                  { key: "all",   label: "Toutes",         emoji: "🌙" },
                  { key: "notes", label: "Avec notes",     emoji: "📓" },
                  { key: "q5",    label: "Excellentes",    emoji: "✨" },
                  { key: "q4",    label: "Bonnes",         emoji: "😊" },
                ] as { key: typeof historyFilter; label: string; emoji: string }[]).map(f => (
                  <TouchableOpacity
                    key={f.key}
                    onPress={() => setHistoryFilter(f.key)}
                    style={{
                      flexDirection: "row", alignItems: "center", gap: 5,
                      borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7,
                      backgroundColor: historyFilter === f.key ? GOLD : "rgba(200,169,110,0.10)",
                      borderWidth: 1, borderColor: historyFilter === f.key ? GOLD : "rgba(200,169,110,0.25)",
                    }}
                  >
                    <Text style={{ fontSize: 12 }}>{f.emoji}</Text>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: historyFilter === f.key ? "#07051C" : "rgba(200,169,110,0.80)" }}>{f.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {isLoading ? (
              <Text style={{ color: "rgba(200,169,110,0.4)", textAlign: "center", paddingVertical: 20 }}>Chargement…</Text>
            ) : (logs as any[]).length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Text style={{ fontSize: 44, marginBottom: 12 }}>🌙</Text>
                <Text style={s.emptyTitle}>Aucune nuit enregistrée</Text>
                <Text style={s.emptyDesc}>Commencez à suivre votre sommeil pour voir votre historique ici.</Text>
                <TouchableOpacity onPress={() => { resetForm(); setEditingId(null); setShowModal(true); }} style={s.emptyBtn}>
                  <Text style={s.emptyBtnText}>Enregistrer ma première nuit</Text>
                </TouchableOpacity>
              </View>
            ) : (() => {
              const filtered = (logs as any[]).filter((log: any) => {
                if (historyFilter === "notes") return !!log.notes;
                if (historyFilter === "q5") return (log.quality ?? 0) >= 5;
                if (historyFilter === "q4") return (log.quality ?? 0) === 4;
                return true;
              });
              if (filtered.length === 0) {
                return (
                  <View style={{ alignItems: "center", paddingVertical: 30 }}>
                    <Text style={{ fontSize: 32, marginBottom: 8 }}>🔍</Text>
                    <Text style={{ color: "rgba(200,169,110,0.6)", fontSize: 13, textAlign: "center" }}>Aucune nuit ne correspond à ce filtre</Text>
                    <TouchableOpacity onPress={() => setHistoryFilter("all")} style={{ marginTop: 10 }}>
                      <Text style={{ color: GOLD, fontSize: 12, fontWeight: "600" }}>Voir toutes les nuits</Text>
                    </TouchableOpacity>
                  </View>
                );
              }
              return filtered.map((log: any) => (
                <View key={log.id} style={s.logCard}>
                  <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-start" }}>
                    <View style={{ alignItems: "center" }}>
                      <Text style={{ fontSize: 22 }}>{getQualityEmoji(log.quality ?? 3)}</Text>
                      {log.notes ? <Text style={{ fontSize: 9, marginTop: 3, opacity: 0.6 }}>📓</Text> : null}
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={s.logDate}>
                        {new Date(log.sleepDate + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" })}
                      </Text>
                      <Text style={s.logTime}>{log.bedtime} → {log.wakeTime}{log.durationMinutes ? ` · ${formatDuration(log.durationMinutes)}` : ""}</Text>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 5 }}>
                        <View style={[s.qualBadge, { backgroundColor: `${getQualityColor(log.quality ?? 3)}22` }]}>
                          <View style={[s.qualDot, { backgroundColor: getQualityColor(log.quality ?? 3) }]} />
                          <Text style={[s.qualText, { color: getQualityColor(log.quality ?? 3) }]}>{getQualityLabel(log.quality ?? 3)}</Text>
                        </View>
                        {log.usedMeditation && <Text style={s.logTag}>🧘 Médit.</Text>}
                        {log.usedBreathing  && <Text style={s.logTag}>💨 Resp.</Text>}
                        {log.usedAmbient    && <Text style={s.logTag}>🎵 Sons</Text>}
                      </View>
                      {log.notes ? <LogNoteBlock notes={log.notes} logId={log.id} onNoteUpdated={handleNoteUpdate} /> : null}
                    </View>
                  </View>
                  <View style={{ gap: 6 }}>
                    <TouchableOpacity onPress={() => openEdit(log)} style={s.logActionBtn}><Text style={{ color: GOLD, fontSize: 13 }}>✏️</Text></TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => Alert.alert("Supprimer", "Supprimer cette entrée ?", [
                        { text: "Annuler", style: "cancel" },
                        { text: "Supprimer", style: "destructive", onPress: () => deleteMutation.mutate({ id: log.id }) },
                      ])}
                      style={s.logActionBtn}><Text style={{ color: "#EF4444", fontSize: 13 }}>🗑️</Text></TouchableOpacity>
                  </View>
                </View>
              ));
            })()}
          </View>
        )}

        {/* ── RECOMMANDATIONS ── */}
        {activeTab === "recommendations" && (
          <View>
            {/* Analyse */}
            {recs && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>🤖 Analyse personnalisée</Text>
                <LinearGradient colors={["#2D1A6E", "#1A1240"]} style={s.analysisCard}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
                    <SleepScoreCircle score={recs.sleepScore} />
                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <Text style={{ fontSize: 14, fontWeight: "700", color: "#F0EBE0" }}>Score : {recs.sleepScore}/100</Text>
                      <Text style={[{ fontSize: 12, fontWeight: "600", marginTop: 2 }, { color: getSleepScoreColor(recs.sleepScore) }]}>{getSleepScoreLabel(recs.sleepScore)}</Text>
                      <Text style={{ fontSize: 12, color: "rgba(200,169,110,0.8)", marginTop: 6, lineHeight: 18 }}>{recs.analysis}</Text>
                    </View>
                  </View>
                  <View style={s.analysisTip}>
                    <Text style={{ fontSize: 16, marginRight: 8 }}>💡</Text>
                    <Text style={{ flex: 1, fontSize: 12, color: "rgba(200,169,110,0.9)", lineHeight: 18 }}>{recs.tip}</Text>
                  </View>
                  {recs.durationStatus && (
                    <View style={[s.analysisTip, { backgroundColor: "rgba(234,179,8,0.1)", marginTop: 8 }]}>
                      <Text style={{ fontSize: 16, marginRight: 8 }}>⏱️</Text>
                      <Text style={{ flex: 1, fontSize: 12, color: "rgba(200,169,110,0.9)", lineHeight: 18 }}>{recs.durationStatus}</Text>
                    </View>
                  )}
                </LinearGradient>
              </View>
            )}

            {/* Méditations sommeil */}
            {recs?.meditations && recs.meditations.length > 0 && (
              <View style={s.section}>
                <View style={s.rowBetween}>
                  <Text style={s.sectionTitle}>🌙 Méditations pour le sommeil</Text>
                  <TouchableOpacity onPress={() => router.push("/explore" as never)}><Text style={s.seeAll}>Voir tout</Text></TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
                  {recs.meditations.map((med: any) => <MedCard key={med.slug} med={med} onPress={() => router.push(`/meditation/${med.slug}` as never)} />)}
                </ScrollView>
              </View>
            )}

            {/* Méditations matinales */}
            {recs?.morningMeditations && recs.morningMeditations.length > 0 && (
              <View style={s.section}>
                <View style={s.rowBetween}>
                  <Text style={s.sectionTitle}>☀️ Méditations matinales</Text>
                  <TouchableOpacity onPress={() => router.push("/explore" as never)}><Text style={s.seeAll}>Voir tout</Text></TouchableOpacity>
                </View>
                <Text style={s.sectionDesc}>Démarrez votre journée avec énergie</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
                  {recs.morningMeditations.map((med: any) => <MedCard key={med.slug} med={med} onPress={() => router.push(`/meditation/${med.slug}` as never)} />)}
                </ScrollView>
              </View>
            )}

            {/* Respiration */}
            {recs?.breathingMeditations && recs.breathingMeditations.length > 0 && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>💨 Exercices de respiration</Text>
                <Text style={s.sectionDesc}>Techniques pour faciliter l'endormissement</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
                  {recs.breathingMeditations.map((med: any) => <MedCard key={med.slug} med={med} onPress={() => router.push(`/meditation/${med.slug}` as never)} />)}
                </ScrollView>
              </View>
            )}

            {/* Sons de relaxation */}
            <View style={s.section}>
              <View style={s.rowBetween}>
                <Text style={s.sectionTitle}>🎵 Sons de relaxation</Text>
                <TouchableOpacity onPress={() => router.push("/ambient" as never)}><Text style={s.seeAll}>Voir tout</Text></TouchableOpacity>
              </View>
              <Text style={s.sectionDesc}>Créez votre ambiance sonore idéale pour dormir</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
                {AMBIENT_SOUNDS.map(sound => <AmbientCard key={sound.slug} sound={sound} onPress={() => router.push("/ambient" as never)} />)}
              </ScrollView>
            </View>

            {/* Routine du soir */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>🌛 Routine du soir recommandée</Text>
              <View style={s.routineCard}>
                {[
                  { time: "21h00", emoji: "📵", title: "Écrans éteints",        desc: "Activez le mode nuit sur vos appareils" },
                  { time: "21h30", emoji: "🛁", title: "Bain ou douche chaude", desc: "Abaisse la température corporelle" },
                  { time: "22h00", emoji: "🧘", title: "Méditation guidée",     desc: "10-15 min de scan corporel ou respiration" },
                  { time: "22h15", emoji: "🎵", title: "Sons relaxants",        desc: "Pluie, forêt ou bruit blanc" },
                  { time: "22h30", emoji: "😴", title: "Coucher",               desc: "Objectif : 7h30 de sommeil" },
                ].map((step, i) => (
                  <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 8 }}>
                    <Text style={{ width: 42, fontSize: 10, color: "rgba(200,169,110,0.55)", paddingTop: 2, fontWeight: "600" }}>{step.time}</Text>
                    <View style={{ width: 20, alignItems: "center", marginRight: 10 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: GOLD, marginTop: 2 }} />
                      {i < 4 && <View style={{ width: 1, flex: 1, backgroundColor: "rgba(200,169,110,0.2)", marginTop: 2, minHeight: 26 }} />}
                    </View>
                    <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-start", paddingBottom: 8 }}>
                      <Text style={{ fontSize: 16, marginRight: 8 }}>{step.emoji}</Text>
                      <View>
                        <Text style={{ fontSize: 13, fontWeight: "600", color: "#F0EBE0" }}>{step.title}</Text>
                        <Text style={{ fontSize: 11, color: "rgba(200,169,110,0.6)", marginTop: 2 }}>{step.desc}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── MODAL SAISIE ── */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <View style={s.modal}>
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => { setShowModal(false); setEditingId(null); resetForm(); }}>
              <Text style={s.modalCancel}>Annuler</Text>
            </TouchableOpacity>
            <Text style={s.modalTitle}>{editingId ? "Modifier la nuit" : "Enregistrer ma nuit"}</Text>
            <TouchableOpacity onPress={handleSave} disabled={isPending}>
              <Text style={[s.modalSave, { opacity: isPending ? 0.5 : 1 }]}>{isPending ? "…" : "Sauver"}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

            <Text style={s.modalSection}>⏰ Horaires</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              {[
                { label: "Coucher", key: "bedtime" as const, ph: "22:30" },
                { label: "Lever",   key: "wakeTime" as const, ph: "07:00" },
              ].map((f, i) => (
                <React.Fragment key={f.key}>
                  {i === 1 && <Text style={{ color: GOLD, fontSize: 18, marginTop: 16 }}>→</Text>}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: "rgba(200,169,110,0.6)", marginBottom: 6 }}>{f.label}</Text>
                    <TextInput
                      style={s.timeInput}
                      value={form[f.key]}
                      onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                      placeholder={f.ph} placeholderTextColor="rgba(200,169,110,0.35)"
                      keyboardType="numbers-and-punctuation" returnKeyType="done"
                    />
                  </View>
                </React.Fragment>
              ))}
            </View>

            <Text style={s.modalSection}>⭐ Qualité du sommeil</Text>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {[1, 2, 3, 4, 5].map(q => (
                <TouchableOpacity key={q} onPress={() => setForm(f => ({ ...f, quality: q }))}
                  style={[s.qualBtn, form.quality === q && { borderColor: getQualityColor(q), backgroundColor: `${getQualityColor(q)}22` }]}>
                  <Text style={{ fontSize: 18 }}>{getQualityEmoji(q)}</Text>
                  <Text style={[{ fontSize: 9, color: "rgba(200,169,110,0.5)", marginTop: 3, textAlign: "center" }, form.quality === q && { color: getQualityColor(q) }]}>{getQualityLabel(q)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.modalSection}>😌 Humeur du soir</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
              {MOOD_OPTIONS.map(m => (
                <TouchableOpacity key={m.key} onPress={() => setForm(f => ({ ...f, eveningMood: f.eveningMood === m.key ? null : m.key }))}
                  style={[s.moodBtn, form.eveningMood === m.key && s.moodBtnActive]}>
                  <Text style={{ fontSize: 20 }}>{m.emoji}</Text>
                  <Text style={[{ fontSize: 10, color: "rgba(200,169,110,0.55)", marginTop: 3, textAlign: "center" }, form.eveningMood === m.key && { color: GOLD }]}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={s.modalSection}>🌃 Réveils nocturnes</Text>
            <TouchableOpacity onPress={() => setForm(f => ({ ...f, hadNightWaking: !f.hadNightWaking }))} style={s.toggleRow}>
              <Text style={{ fontSize: 13, color: "#F0EBE0", flex: 1 }}>J'ai eu des réveils cette nuit</Text>
              <View style={[s.toggle, form.hadNightWaking && s.toggleActive]}>
                <View style={[s.toggleThumb, form.hadNightWaking && s.toggleThumbActive]} />
              </View>
            </TouchableOpacity>
            {form.hadNightWaking && (
              <View style={s.wakingBox}>
                <Text style={{ fontSize: 12, color: "rgba(200,169,110,0.6)", marginBottom: 10 }}>Nombre de réveils :</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <TouchableOpacity key={n} onPress={() => setForm(f => ({ ...f, nightWakings: n }))}
                      style={[s.wakingBtn, form.nightWakings === n && s.wakingBtnActive]}>
                      <Text style={[{ color: "rgba(200,169,110,0.55)", fontWeight: "600" }, form.nightWakings === n && { color: GOLD }]}>{n}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <Text style={s.modalSection}>🧘 Pratiques du soir</Text>
            {[
              { key: "usedMeditation" as const, emoji: "🧘", label: "Méditation guidée" },
              { key: "usedBreathing"  as const, emoji: "💨", label: "Exercice de respiration" },
              { key: "usedAmbient"    as const, emoji: "🎵", label: "Sons relaxants" },
            ].map(p => (
              <TouchableOpacity key={p.key} onPress={() => setForm(f => ({ ...f, [p.key]: !f[p.key] }))} style={s.practiceRow}>
                <Text style={{ fontSize: 18, marginRight: 12 }}>{p.emoji}</Text>
                <Text style={{ flex: 1, fontSize: 13, color: "#F0EBE0" }}>{p.label}</Text>
                <View style={[s.checkbox, form[p.key] && s.checkboxActive]}>
                  {form[p.key] && <Text style={{ color: NIGHT, fontSize: 11, fontWeight: "700" }}>✓</Text>}
                </View>
              </TouchableOpacity>
            ))}

            <Text style={s.modalSection}>📝 Notes</Text>
            <TextInput
              style={s.notesInput}
              value={form.notes}
              onChangeText={v => setForm(f => ({ ...f, notes: v }))}
              placeholder="Comment s'est passée votre nuit ? Rêves, sensations…"
              placeholderTextColor="rgba(200,169,110,0.35)"
              multiline numberOfLines={4} returnKeyType="done"
            />

            <TouchableOpacity onPress={handleSave} disabled={isPending}
              style={[{ marginTop: 24, borderRadius: 16, overflow: "hidden" }, { opacity: isPending ? 0.6 : 1 }]}>
              <LinearGradient colors={["#C8A96E", "#8B6914"]} style={{ padding: 16, alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: NIGHT }}>
                  {isPending ? "Enregistrement…" : "🌙 Sauvegarder ma nuit"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  header:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 12 },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(200,169,110,0.15)", alignItems: "center", justifyContent: "center" },
  backIcon:    { color: GOLD, fontSize: 18, marginTop: -2 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#F0EBE0" },
  headerSub:   { fontSize: 12, color: "rgba(200,169,110,0.6)", marginTop: 2 },
  addBtn:      { backgroundColor: "rgba(200,169,110,0.18)", borderWidth: 1, borderColor: BORDER, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  addBtnText:  { color: GOLD, fontSize: 13, fontWeight: "600" },

  scoreCard:   { borderRadius: 20, borderWidth: 1, borderColor: BORDER, padding: 18, flexDirection: "row", alignItems: "center", gap: 14 },
  scoreLabel:  { fontSize: 11, fontWeight: "600", marginTop: 4 },
  scoreTitle:  { fontSize: 15, fontWeight: "700", color: "#F0EBE0", marginBottom: 2 },
  scoreDesc:   { fontSize: 11, color: "rgba(200,169,110,0.55)" },
  metaVal:     { fontSize: 14, fontWeight: "700", color: GOLD },
  metaLbl:     { fontSize: 9, color: "rgba(200,169,110,0.55)", marginTop: 1 },

  section:      { paddingHorizontal: 20, marginBottom: 22 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#F0EBE0", marginBottom: 12 },
  sectionDesc:  { fontSize: 12, color: "rgba(200,169,110,0.55)", marginTop: -8, marginBottom: 12 },
  rowBetween:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  seeAll:       { fontSize: 12, color: GOLD, fontWeight: "600" },

  todayCard:  { borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  todayTitle: { fontSize: 15, fontWeight: "600", color: "#F0EBE0" },
  todaySub:   { fontSize: 12, color: "rgba(200,169,110,0.65)", marginTop: 3 },
  qualBadge:  { flexDirection: "row", alignItems: "center", marginTop: 5, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3, backgroundColor: "rgba(255,255,255,0.05)" },
  qualDot:    { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  qualText:   { fontSize: 11, fontWeight: "600" },

  tabs:         { flexDirection: "row", marginHorizontal: 20, marginBottom: 20, backgroundColor: "rgba(200,169,110,0.07)", borderRadius: 12, padding: 4 },
  tab:          { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  tabActive:    { backgroundColor: "rgba(200,169,110,0.18)" },
  tabText:      { fontSize: 12, color: "rgba(200,169,110,0.45)", fontWeight: "500" },
  tabTextActive:{ color: GOLD, fontWeight: "700" },

  chartBox:   { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 10, alignItems: "center" },
  periodBtn:  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: BORDER },
  periodBtnActive: { backgroundColor: "rgba(200,169,110,0.18)", borderColor: GOLD },
  periodBtnText: { fontSize: 11, color: "rgba(200,169,110,0.45)" },

  statCard: { flex: 1, minWidth: "45%", backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14, alignItems: "center" },
  statVal:  { fontSize: 17, fontWeight: "700", color: GOLD },
  statLbl:  { fontSize: 10, color: "rgba(200,169,110,0.55)", marginTop: 3, textAlign: "center" },

  weekCard:    { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16, flexDirection: "row", alignItems: "center" },
  weekColTitle:{ fontSize: 11, color: "rgba(200,169,110,0.55)", marginBottom: 6, fontWeight: "600" },
  weekVal:     { fontSize: 16, fontWeight: "700", color: "#F0EBE0" },
  weekSub:     { fontSize: 11, color: "rgba(200,169,110,0.65)", marginTop: 2 },

  watchCard:       { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16 },
  watchTitle:      { fontSize: 14, fontWeight: "600", color: "#F0EBE0" },
  watchSub:        { fontSize: 11, color: "rgba(200,169,110,0.55)", marginTop: 2 },
  watchOption:     { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(200,169,110,0.07)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: BORDER },
  watchOptionText: { fontSize: 12, color: "#F0EBE0", fontWeight: "500" },
  watchBadge:      { fontSize: 9, color: GOLD, backgroundColor: "rgba(200,169,110,0.13)", borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },

  tipCard:  { flexDirection: "row", alignItems: "flex-start", backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 12, marginBottom: 8 },
  tipTitle: { fontSize: 13, fontWeight: "600", color: "#F0EBE0", marginBottom: 3 },
  tipDesc:  { fontSize: 11, color: "rgba(200,169,110,0.65)", lineHeight: 16 },

  logCard:      { flexDirection: "row", alignItems: "flex-start", backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14, marginBottom: 10 },
  logDate:      { fontSize: 13, fontWeight: "600", color: "#F0EBE0" },
  logTime:      { fontSize: 11, color: "rgba(200,169,110,0.65)", marginTop: 2 },
  logTag:       { fontSize: 10, color: "rgba(200,169,110,0.65)", backgroundColor: "rgba(200,169,110,0.07)", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  logNotes:     { fontSize: 11, color: "rgba(200,169,110,0.45)", marginTop: 4, fontStyle: "italic" },
  logActionBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(200,169,110,0.07)", alignItems: "center", justifyContent: "center" },

  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#F0EBE0", marginBottom: 8 },
  emptyDesc:  { fontSize: 13, color: "rgba(200,169,110,0.55)", textAlign: "center", lineHeight: 20, marginBottom: 20 },
  emptyBtn:   { backgroundColor: "rgba(200,169,110,0.18)", borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, borderColor: BORDER },
  emptyBtnText: { color: GOLD, fontSize: 13, fontWeight: "600" },

  analysisCard: { borderRadius: 20, borderWidth: 1, borderColor: BORDER, padding: 18 },
  analysisTip:  { flexDirection: "row", alignItems: "flex-start", backgroundColor: "rgba(200,169,110,0.07)", borderRadius: 12, padding: 12 },

  routineCard: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16 },

  // Modal
  modal:       { flex: 1, backgroundColor: "#0D0B1A" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: BORDER },
  modalCancel: { fontSize: 15, color: "rgba(200,169,110,0.55)" },
  modalTitle:  { fontSize: 16, fontWeight: "700", color: "#F0EBE0" },
  modalSave:   { fontSize: 15, color: GOLD, fontWeight: "700" },
  modalSection:{ fontSize: 14, fontWeight: "700", color: "#F0EBE0", marginTop: 20, marginBottom: 12 },

  timeInput: { backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 12, color: "#F0EBE0", fontSize: 18, fontWeight: "600", textAlign: "center" },

  qualBtn: { flex: 1, alignItems: "center", backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 8 },

  moodBtn:      { alignItems: "center", backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 10, marginRight: 8, minWidth: 68 },
  moodBtnActive:{ borderColor: GOLD, backgroundColor: "rgba(200,169,110,0.13)" },

  toggleRow:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 14, marginBottom: 10 },
  toggle:          { width: 44, height: 24, borderRadius: 12, backgroundColor: "rgba(200,169,110,0.12)", borderWidth: 1, borderColor: BORDER, justifyContent: "center", paddingHorizontal: 2 },
  toggleActive:    { backgroundColor: "rgba(200,169,110,0.3)", borderColor: GOLD },
  toggleThumb:     { width: 18, height: 18, borderRadius: 9, backgroundColor: "rgba(200,169,110,0.35)" },
  toggleThumbActive: { backgroundColor: GOLD, alignSelf: "flex-end" },

  wakingBox:    { backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 14, marginBottom: 10 },
  wakingBtn:    { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(200,169,110,0.07)", borderWidth: 1, borderColor: BORDER, alignItems: "center", justifyContent: "center" },
  wakingBtnActive: { borderColor: GOLD, backgroundColor: "rgba(200,169,110,0.18)" },

  practiceRow: { flexDirection: "row", alignItems: "center", backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 14, marginBottom: 8 },
  checkbox:    { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: BORDER, alignItems: "center", justifyContent: "center" },
  checkboxActive: { backgroundColor: GOLD, borderColor: GOLD },

  notesInput: { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14, color: "#F0EBE0", fontSize: 14, minHeight: 96, textAlignVertical: "top" },
});
