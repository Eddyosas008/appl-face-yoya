import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/screen-container";
import { StarField } from "@/components/star-field";
import { trpc } from "@/lib/trpc";
import { useUser } from "@/lib/user-context";
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from "expo-audio";
import { useThemeContext } from "@/lib/theme-provider";

// ─── Données statiques ─────────────────────────────────────────────────────────

const BREATHING_CONFIG: Record<string, {
  label: string;
  desc: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdOut?: number;
  color: string;
}> = {
  "4-7-8": {
    label: "Respiration 4-7-8",
    desc: "Technique anti-stress pour l'endormissement",
    inhale: 4, hold: 7, exhale: 8, holdOut: 0,
    color: "#1E3A5F",
  },
  coherence: {
    label: "Cohérence cardiaque",
    desc: "5 respirations par minute pour calmer le système nerveux",
    inhale: 5, hold: 0, exhale: 5, holdOut: 0,
    color: "#1A2E1A",
  },
  box: {
    label: "Respiration carrée",
    desc: "Équilibre parfait pour réduire l'anxiété",
    inhale: 4, hold: 4, exhale: 4, holdOut: 4,
    color: "#2D1B69",
  },
  energizing: {
    label: "Respiration énergisante",
    desc: "Respirations profondes pour revitaliser",
    inhale: 3, hold: 0, exhale: 3, holdOut: 0,
    color: "#1E3A5F",
  },
};

const AMBIENT_LABELS: Record<string, { label: string; emoji: string; route: string }> = {
  rain: { label: "Pluie apaisante", emoji: "🌧️", route: "/ambient" },
  forest: { label: "Forêt nocturne", emoji: "🌲", route: "/ambient" },
  ocean: { label: "Vagues de l'océan", emoji: "🌊", route: "/ambient" },
  fire: { label: "Feu de cheminée", emoji: "🔥", route: "/ambient" },
  wind: { label: "Vent doux", emoji: "💨", route: "/ambient" },
  birds: { label: "Chants d'oiseaux", emoji: "🐦", route: "/ambient" },
};

// ─── Composant minuteur de respiration ─────────────────────────────────────────

function BreathingTimer({ config }: { config: typeof BREATHING_CONFIG[string] }) {
  const [phase, setPhase] = useState<"idle" | "inhale" | "hold" | "exhale" | "holdOut">("idle");
  const [timeLeft, setTimeLeft] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const PHASES: Array<"inhale" | "hold" | "exhale" | "holdOut"> = [
    "inhale",
    ...(config.hold > 0 ? ["hold" as const] : []),
    "exhale",
    ...(config.holdOut && config.holdOut > 0 ? ["holdOut" as const] : []),
  ];

  const PHASE_LABELS: Record<string, string> = {
    inhale: "Inspirez",
    hold: "Retenez",
    exhale: "Expirez",
    holdOut: "Pause",
    idle: "Prêt",
  };

  const PHASE_DURATIONS: Record<string, number> = {
    inhale: config.inhale,
    hold: config.hold,
    exhale: config.exhale,
    holdOut: config.holdOut ?? 0,
  };

  const currentPhaseIndex = useRef(0);

  const startCycle = () => {
    currentPhaseIndex.current = 0;
    const firstPhase = PHASES[0];
    setPhase(firstPhase);
    setTimeLeft(PHASE_DURATIONS[firstPhase]);
    setIsRunning(true);
  };

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setPhase("idle");
    setTimeLeft(0);
  };

  useEffect(() => {
    if (!isRunning) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Passer à la phase suivante
          const nextIndex = (currentPhaseIndex.current + 1) % PHASES.length;
          if (nextIndex === 0) {
            setCycles((c) => c + 1);
          }
          currentPhaseIndex.current = nextIndex;
          const nextPhase = PHASES[nextIndex];
          setPhase(nextPhase);
          return PHASE_DURATIONS[nextPhase];
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const phaseColor: Record<string, string> = {
    inhale: "#7C3AED",
    hold: "#F59E0B",
    exhale: "#059669",
    holdOut: "#6366F1",
    idle: "#374151",
  };

  const circleSize = phase === "inhale" ? 110 : phase === "exhale" ? 80 : 95;

  return (
    <View style={breathStyles.container}>
      {/* Cercle animé */}
      <View
        style={[
          breathStyles.circle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            backgroundColor: phaseColor[phase] + "33",
            borderColor: phaseColor[phase],
          },
        ]}
      >
        <Text style={[breathStyles.phaseLabel, { color: phaseColor[phase] }]}>
          {PHASE_LABELS[phase]}
        </Text>
        {isRunning && (
          <Text style={[breathStyles.timeLeft, { color: phaseColor[phase] }]}>
            {timeLeft}s
          </Text>
        )}
      </View>

      {/* Cycles */}
      {cycles > 0 && (
        <Text style={breathStyles.cycles}>{cycles} cycle{cycles > 1 ? "s" : ""} complété{cycles > 1 ? "s" : ""}</Text>
      )}

      {/* Boutons */}
      <View style={breathStyles.btns}>
        {!isRunning ? (
          <TouchableOpacity style={breathStyles.startBtn} onPress={startCycle}>
            <Text style={breathStyles.startBtnText}>▶ Démarrer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={breathStyles.stopBtn} onPress={stop}>
            <Text style={breathStyles.stopBtnText}>⏹ Arrêter</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Guide */}
      <Text style={breathStyles.guide}>
        {config.inhale}s inspir
        {config.hold > 0 ? ` · ${config.hold}s pause` : ""}
        {` · ${config.exhale}s expir`}
        {config.holdOut && config.holdOut > 0 ? ` · ${config.holdOut}s pause` : ""}
      </Text>
    </View>
  );
}

const breathStyles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: 20 },
  circle: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    marginBottom: 12,
  },
  phaseLabel: { fontSize: 14, fontWeight: "700" },
  timeLeft: { fontSize: 22, fontWeight: "800", marginTop: 2 },
  cycles: { color: "#A78BFA", fontSize: 12, marginBottom: 12 },
  btns: { flexDirection: "row", gap: 10 },
  startBtn: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  startBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  stopBtn: {
    backgroundColor: "#374151",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  stopBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  guide: { color: "#6B7280", fontSize: 11, marginTop: 10 },
});

// ─── Composant minuteur général ─────────────────────────────────────────────────

function SimpleTimer({ minutes }: { minutes: number }) {
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggle = () => {
    if (isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRunning(false);
    } else {
      setIsRunning(true);
    }
  };

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setSecondsLeft(minutes * 60);
  };

  useEffect(() => {
    if (!isRunning) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning]);

  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  const pct = 1 - secondsLeft / (minutes * 60);

  return (
    <View style={timerStyles.container}>
      <Text style={timerStyles.time}>
        {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      </Text>
      <View style={timerStyles.bar}>
        <View style={[timerStyles.barFill, { width: `${pct * 100}%` as unknown as number }]} />
      </View>
      <View style={timerStyles.btns}>
        <TouchableOpacity style={timerStyles.btn} onPress={toggle}>
          <Text style={timerStyles.btnText}>{isRunning ? "⏸ Pause" : "▶ Démarrer"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={timerStyles.resetBtn} onPress={reset}>
          <Text style={timerStyles.resetBtnText}>↺</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const timerStyles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: 12 },
  time: { fontSize: 40, fontWeight: "800", color: "#E9D5FF", marginBottom: 10 },
  bar: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 12,
  },
  barFill: { height: 6, backgroundColor: "#A78BFA", borderRadius: 3 },
  btns: { flexDirection: "row", gap: 10 },
  btn: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  resetBtn: {
    backgroundColor: "#374151",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  resetBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

// ─── Composant lecteur audio ────────────────────────────────────────────────────
function AudioPlayerCard({ audioUrl, durationSeconds }: { audioUrl: string; durationSeconds?: number | null }) {
  const player = useAudioPlayer(audioUrl);
  const status = useAudioPlayerStatus(player);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    return () => { player.release(); };
  }, []);

  useEffect(() => {
    if (status.isLoaded) setIsReady(true);
  }, [status.isLoaded]);

  const togglePlay = useCallback(() => {
    if (Platform.OS !== "web") {
      const { Haptics } = require("expo-haptics");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [status.playing, player]);

  const totalSecs = durationSeconds && durationSeconds > 0
    ? durationSeconds
    : Math.round((status.duration ?? 0) / 1000);
  const currentSecs = Math.round((status.currentTime ?? 0) / 1000);
  const pct = totalSecs > 0 ? Math.min(currentSecs / totalSecs, 1) : 0;
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <View style={audioStyles.container}>
      <View style={audioStyles.row}>
        <TouchableOpacity
          style={[audioStyles.playBtn, !isReady && audioStyles.playBtnDisabled]}
          onPress={togglePlay}
          disabled={!isReady}
          activeOpacity={0.8}
        >
          <Text style={audioStyles.playBtnText}>{status.playing ? "⏸" : "▶"}</Text>
        </TouchableOpacity>
        <View style={audioStyles.info}>
          <View style={audioStyles.progressBg}>
            <View style={[audioStyles.progressFill, { width: `${pct * 100}%` as unknown as number }]} />
          </View>
          <View style={audioStyles.timeRow}>
            <Text style={audioStyles.timeText}>{fmt(currentSecs)}</Text>
            {totalSecs > 0 && (
              <Text style={audioStyles.timeText}>{fmt(totalSecs)}</Text>
            )}
          </View>
        </View>
      </View>
      {!isReady && (
        <Text style={audioStyles.loadingText}>Chargement de l'audio...</Text>
      )}
    </View>
  );
}
const audioStyles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(167,139,250,0.12)",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.3)",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  playBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },
  playBtnDisabled: { backgroundColor: "#374151" },
  playBtnText: { fontSize: 20, color: "#fff" },
  info: { flex: 1 },
  progressBg: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 2,
    marginBottom: 6,
    overflow: "hidden",
  },
  progressFill: { height: 4, backgroundColor: "#A78BFA", borderRadius: 2 },
  timeRow: { flexDirection: "row", justifyContent: "space-between" },
  timeText: { color: "rgba(255,255,255,0.5)", fontSize: 11 },
  loadingText: { color: "#6B7280", fontSize: 12, marginTop: 8, textAlign: "center" },
});
// ─── Écran principal ────────────────────────────────────────────────────────────
export default function ProgramDayScreen() {
  const { slug, day } = useLocalSearchParams<{ slug: string; day: string }>();
  const router = useRouter();
  const { isAuthenticated } = useUser();
  const { isDark } = useThemeContext();
  const styles = useMemo(() => makeStyles(isDark), [isDark]);
  const [isCompleting, setIsCompleting] = useState(false);

  // Couleurs dynamiques
  const GOLD    = isDark ? '#C8A96E' : '#A0722A';
  const FG      = isDark ? '#EDE8DC' : '#1E1A3C';
  const LAV     = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(100,80,180,0.75)';
  const LAV_DIM = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(100,80,180,0.50)';
  const BORDER  = isDark ? 'rgba(180,160,255,0.14)' : 'rgba(120,100,200,0.18)';
  const SURFACE = isDark ? '#2A2540' : 'rgba(255,255,255,0.70)';
  const [routineChecked, setRoutineChecked] = useState<Record<number, boolean>>({});
  const [showBreathing, setShowBreathing] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [journalNote, setJournalNote] = useState("");
  const utils = trpc.useUtils();

  const dayNumber = parseInt(day ?? "1", 10);

  const { data: programDay, isLoading } = trpc.programs.getDay.useQuery(
    { programSlug: slug ?? "", dayNumber },
    { enabled: !!slug && !!dayNumber }
  );

  const { data: program } = trpc.programs.get.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  const { data: progress } = trpc.programs.progress.useQuery(
    { programSlug: slug ?? "" },
    { enabled: !!isAuthenticated && !!slug }
  );

  const completeDayMutation = trpc.programs.completeDay.useMutation({
    onSuccess: (data) => {
      utils.programs.progress.invalidate({ programSlug: slug ?? "" });
      utils.programs.myPrograms.invalidate();
      setIsCompleting(false);
      if (data.isProgramCompleted) {
        // Dernier jour : naviguer vers l'écran de félicitations
        router.replace(`/program-complete/${slug}` as never);
      } else {
        Alert.alert(
          "🎉 Jour complété !",
          "Bravo ! Vous avez terminé ce jour du programme. Continuez ainsi pour transformer votre sommeil.",
          [{ text: "Continuer", onPress: () => router.back() }]
        );
      }
    },
    onError: () => setIsCompleting(false),
  });

  const completedDays: number[] = progress ? JSON.parse(progress.completedDays || "[]") : [];
  const isDone = completedDays.includes(dayNumber);

  const handleComplete = () => {
    if (!isAuthenticated) {
      Alert.alert("Connexion requise", "Connectez-vous pour suivre votre progression.");
      return;
    }
    setIsCompleting(true);
    completeDayMutation.mutate({ programSlug: slug ?? "", dayNumber });
  };

  if (isLoading) {
    return (
      <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={isDark ? '#A78BFA' : '#6B46C1'} size="large" />
        </View>
      </ScreenContainer>
    );
  }

  if (!programDay) {
    return (
      <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Jour introuvable</Text>
        </View>
      </ScreenContainer>
    );
  }

  const breathingConfig = programDay.breathingExercise
    ? BREATHING_CONFIG[programDay.breathingExercise]
    : null;
  const ambientInfo = programDay.ambientSound
    ? AMBIENT_LABELS[programDay.ambientSound]
    : null;

  // Routine steps
  const routineSteps = programDay.eveningRoutine
    ? programDay.eveningRoutine
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const routineCompleted = routineSteps.filter((_, i) => routineChecked[i]).length;

  // Calcul de la progression des activités
  const totalActivities = [
    programDay.meditationSlug,
    programDay.breathingExercise,
    programDay.ambientSound,
    routineSteps.length > 0 ? "routine" : null,
  ].filter(Boolean).length;

  return (
    <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
      <StarField />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <LinearGradient
          colors={[program?.coverColor ?? "#1E1B4B", program?.coverColor2 ?? "#312E81"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={[styles.backBtnText, { color: 'rgba(255,255,255,0.80)' }]}>← {program?.title ?? "Programme"}</Text>
          </TouchableOpacity>

          <View style={styles.heroBadgeRow}>
            <View style={styles.dayBadge}>
              <Text style={styles.dayBadgeText}>Jour {dayNumber}</Text>
            </View>
            {isDone && (
              <View style={styles.doneBadge}>
                <Text style={styles.doneBadgeText}>✅ Complété</Text>
              </View>
            )}
          </View>

          <Text style={styles.heroTitle}>{programDay.title}</Text>
          {programDay.theme && (
            <Text style={[styles.heroTheme, { color: 'rgba(255,255,255,0.75)' }]}>✦ {programDay.theme}</Text>
          )}

          <View style={styles.heroMeta}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>⏱ {programDay.estimatedMinutes} min</Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>
                {totalActivities} activité{totalActivities > 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Description */}
        {programDay.description && (
          <View style={styles.section}>
            <Text style={[styles.description, { color: LAV }]}>{programDay.description}</Text>
          </View>
        )}

         {/* ── Activités ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: FG }]}>🌙 Activités du soir</Text>
          {/* Audio du jour */}
          {programDay.audioUrl && (
            <View style={styles.activityCard}>
              <LinearGradient
                colors={["#1A0533", "#2D1B69"]}
                style={styles.activityGradient}
              >
                <View style={styles.activityRow}>
                  <View style={styles.activityIconBox}>
                    <Text style={styles.activityIconText}>🎧</Text>
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Audio du jour</Text>
                    <Text style={styles.activitySub}>Méditation guidée pour ce jour</Text>
                  </View>
                </View>
                <AudioPlayerCard
                  audioUrl={programDay.audioUrl}
                  durationSeconds={programDay.audioDurationSeconds}
                />
              </LinearGradient>
            </View>
          )}
          {/* Méditation */}
          {programDay.meditationSlug && (
            <TouchableOpacity
              style={styles.activityCard}
              onPress={() => router.push(`/meditation/${programDay.meditationSlug}` as never)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#2D1B69", "#4C1D95"]}
                style={styles.activityGradient}
              >
                <View style={styles.activityRow}>
                  <View style={styles.activityIconBox}>
                    <Text style={styles.activityIconText}>🧘</Text>
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Méditation guidée</Text>
                    <Text style={styles.activitySub}>
                      Séance de méditation pour préparer votre sommeil
                    </Text>
                  </View>
                  <Text style={styles.activityArrow}>→</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Respiration */}
          {breathingConfig && (
            <View style={styles.activityCard}>
              <LinearGradient
                colors={[breathingConfig.color, breathingConfig.color + "CC"]}
                style={styles.activityGradient}
              >
                <TouchableOpacity
                  style={styles.activityRow}
                  onPress={() => setShowBreathing(!showBreathing)}
                  activeOpacity={0.85}
                >
                  <View style={styles.activityIconBox}>
                    <Text style={styles.activityIconText}>💨</Text>
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{breathingConfig.label}</Text>
                    <Text style={styles.activitySub}>{breathingConfig.desc}</Text>
                  </View>
                  <Text style={styles.activityArrow}>
                    {showBreathing ? "▲" : "▼"}
                  </Text>
                </TouchableOpacity>

                {showBreathing && (
                  <BreathingTimer config={breathingConfig} />
                )}
              </LinearGradient>
            </View>
          )}

          {/* Sons d'ambiance */}
          {ambientInfo && (
            <TouchableOpacity
              style={styles.activityCard}
              onPress={() => router.push("/ambient" as never)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#1A2E1A", "#166534"]}
                style={styles.activityGradient}
              >
                <View style={styles.activityRow}>
                  <View style={styles.activityIconBox}>
                    <Text style={styles.activityIconText}>{ambientInfo.emoji}</Text>
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{ambientInfo.label}</Text>
                    <Text style={styles.activitySub}>
                      Son d'ambiance recommandé pour cette nuit
                    </Text>
                  </View>
                  <Text style={styles.activityArrow}>→</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Minuteur de séance */}
          <View style={styles.activityCard}>
            <LinearGradient
              colors={["#1F1B35", "#2D2060"]}
              style={styles.activityGradient}
            >
              <TouchableOpacity
                style={styles.activityRow}
                onPress={() => setShowTimer(!showTimer)}
                activeOpacity={0.85}
              >
                <View style={styles.activityIconBox}>
                  <Text style={styles.activityIconText}>⏱</Text>
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Minuteur de séance</Text>
                  <Text style={styles.activitySub}>
                    {programDay.estimatedMinutes} minutes recommandées
                  </Text>
                </View>
                <Text style={styles.activityArrow}>{showTimer ? "▲" : "▼"}</Text>
              </TouchableOpacity>

              {showTimer && (
                <SimpleTimer minutes={programDay.estimatedMinutes ?? 10} />
              )}
            </LinearGradient>
          </View>
        </View>

             {/* Routine du soir */}
        {routineSteps.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: FG }]}>📋 Routine du soir</Text>
              <Text style={[styles.routineProgress, { color: GOLD }]}>
                {routineCompleted}/{routineSteps.length}
              </Text>
            </View>
            <View style={[styles.routineCard, { backgroundColor: SURFACE, borderColor: BORDER }]}>
              {routineSteps.map((step, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.routineStep}
                  onPress={() =>
                    setRoutineChecked((prev) => ({ ...prev, [i]: !prev[i] }))
                  }
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.routineCheckbox,
                      { borderColor: BORDER },
                      routineChecked[i] && { backgroundColor: GOLD, borderColor: GOLD },
                    ]}
                  >
                    {routineChecked[i] && (
                      <Text style={[styles.routineCheckmark, { color: isDark ? '#0D0B1A' : '#FFFFFF' }]}>✓</Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.routineStepText,
                      { color: LAV },
                      routineChecked[i] && { color: LAV_DIM, textDecorationLine: 'line-through' },
                    ]}
                  >
                    {step.replace(/^[-•\d.]\s*/, "")}
                  </Text>
                </TouchableOpacity>
              ))}
              {routineCompleted === routineSteps.length && routineSteps.length > 0 && (
                <View style={[styles.routineDoneBanner, { backgroundColor: isDark ? 'rgba(201,168,76,0.08)' : 'rgba(160,114,42,0.08)', borderColor: isDark ? 'rgba(201,168,76,0.2)' : 'rgba(160,114,42,0.2)' }]}>
                  <Text style={[styles.routineDoneText, { color: GOLD }]}>
                    🎉 Routine complète ! Excellent travail.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Conseil scientifique ── */}
        {programDay.sleepTip && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: FG }]}>💡 Conseil scientifique</Text>
            <View style={[styles.tipCard, { backgroundColor: isDark ? 'rgba(201,168,76,0.04)' : 'rgba(160,114,42,0.06)', borderColor: isDark ? 'rgba(201,168,76,0.15)' : 'rgba(160,114,42,0.20)' }]}>
              <Text style={[styles.tipQuote, { color: GOLD }]}>"</Text>
              <Text style={[styles.tipText, { color: LAV }]}>{programDay.sleepTip}</Text>
            </View>
          </View>
        )}

        {/* ── Journal ── */}
        {programDay.journalPrompt && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: FG }]}>📓 Réflexion du soir</Text>
            <View style={[styles.journalCard, { backgroundColor: SURFACE, borderColor: BORDER }]}>
              <Text style={[styles.journalPrompt, { color: LAV }]}>
                "{programDay.journalPrompt}"
              </Text>
              <TextInput
                style={[styles.journalInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)', color: FG, borderColor: BORDER }]}
                placeholder="Écrivez vos pensées ici..."
                placeholderTextColor={LAV_DIM}
                multiline
                numberOfLines={4}
                value={journalNote}
                onChangeText={setJournalNote}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.journalBtn, { backgroundColor: isDark ? 'rgba(201,168,76,0.12)' : 'rgba(160,114,42,0.10)', borderColor: isDark ? 'rgba(201,168,76,0.2)' : 'rgba(160,114,42,0.2)' }]}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/journal" as never,
                    params: { prompt: programDay.journalPrompt ?? "" },
                  })
                }
              >
                <Text style={[styles.journalBtnText, { color: GOLD }]}>Ouvrir le journal complet →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Bouton de validation ── */}
        <View style={styles.completeSection}>
          {isDone ? (
            <View style={[styles.completedBanner, { backgroundColor: isDark ? 'rgba(201,168,76,0.06)' : 'rgba(160,114,42,0.06)', borderColor: isDark ? 'rgba(201,168,76,0.25)' : 'rgba(160,114,42,0.25)' }]}>
              <Text style={styles.completedBannerEmoji}>✅</Text>
              <Text style={[styles.completedBannerTitle, { color: GOLD }]}>Jour complété !</Text>
              <Text style={[styles.completedBannerSub, { color: LAV_DIM }]}>
                Vous avez terminé ce jour du programme. Continuez ainsi !
              </Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.completeBtn}
                onPress={handleComplete}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#059669", "#10B981"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.completeBtnGradient}
                >
                  {isCompleting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.completeBtnText}>
                      ✓ Marquer ce jour comme terminé
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              <Text style={[styles.completeNote, { color: LAV_DIM }]}>
                Validez une fois toutes les activités réalisées
              </Text>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function makeStyles(isDark: boolean) {
  const CARD   = isDark ? '#2A2540' : '#FFFFFF';
  const CARD2  = isDark ? '#201C38' : '#F5F0E8';
  const TEXT1  = isDark ? '#F0EBE0' : '#1C1410';
  const TEXT2  = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(60,40,20,0.65)';
  const TEXT3  = isDark ? 'rgba(240,235,224,0.70)' : 'rgba(60,40,20,0.70)';
  const GOLD_C = isDark ? '#C8A96E' : '#8B6914';
  const BORD   = isDark ? 'rgba(200,169,110,0.40)' : 'rgba(139,105,20,0.30)';
  const BORD2  = isDark ? 'rgba(200,169,110,0.30)' : 'rgba(139,105,20,0.20)';
  return StyleSheet.create({
  scroll: { paddingBottom: 120 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#F87171', fontSize: 16 },

  // Hero
  hero: { padding: 24, paddingTop: 16 },
  backBtn: { marginBottom: 16 },
  backBtnText: { fontSize: 15, fontWeight: '600' },
  heroBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  dayBadge: {
    backgroundColor: 'rgba(201,168,76,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.35)',
  },
  dayBadgeText: { color: GOLD_C, fontSize: 12, fontWeight: '700' },
  doneBadge: {
    backgroundColor: 'rgba(34,197,94,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.35)',
  },
  doneBadgeText: { color: '#86EFAC', fontSize: 12, fontWeight: '700' },
  heroTitle: {
    fontFamily: 'PlayfairDisplay-Medium',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 30,
  },
  heroTheme: { fontSize: 14, marginBottom: 14 },
  heroMeta: { flexDirection: 'row', gap: 8 },
  heroBadge: {
    backgroundColor: 'rgba(0,0,0,0.20)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  heroBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

  // Sections
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 16 },
  description: { fontSize: 14, lineHeight: 22 },

  // Activités
  activityCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
  },
  activityGradient: { padding: 16 },
  activityRow: { flexDirection: 'row', alignItems: 'center' },
  activityIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityIconText: { fontSize: 22 },
  activityContent: { flex: 1 },
  activityTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  activitySub: { color: 'rgba(255,255,255,0.60)', fontSize: 12 },
  activityArrow: { color: GOLD_C, fontSize: 18, fontWeight: '700' },

  // Routine
  routineProgress: { fontSize: 14, fontWeight: '700' },
  routineCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  routineStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  routineCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  routineCheckboxDone: {},
  routineCheckmark: { fontSize: 12, fontWeight: '800' },
  routineStepText: { flex: 1, fontSize: 13, lineHeight: 20 },
  routineStepDone: {},
  routineDoneBanner: {
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  routineDoneText: { fontSize: 13, fontWeight: '600' },

  // Conseil
  tipCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  tipQuote: {
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: -4,
  },
  tipText: { fontSize: 13, lineHeight: 22 },

  // Journal
  journalCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  journalPrompt: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  journalInput: {
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    lineHeight: 20,
    minHeight: 80,
    marginBottom: 12,
    borderWidth: 1,
  },
  journalBtn: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  journalBtnText: { fontSize: 13, fontWeight: '700' },

  // Validation
  completeSection: { paddingHorizontal: 20, paddingTop: 24 },
  completeBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 8 },
  completeBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  completeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  completeNote: { textAlign: 'center', fontSize: 12 },
  completedBanner: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
  },
  completedBannerEmoji: { fontSize: 40, marginBottom: 8 },
  completedBannerTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 18, marginBottom: 4 },
  completedBannerSub: { fontSize: 13, textAlign: 'center' },
  });
}
