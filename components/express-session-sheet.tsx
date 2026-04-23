/**
 * ExpressSessionSheet
 * ───────────────────
 * Bottom sheet modal qui lance une méditation de 5 minutes sans navigation.
 * Contient un mini-player audio complet : play/pause, barre de progression,
 * visualiseur animé et minuteur de décompte.
 */
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, Modal,
  Animated, Dimensions, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { incrementDailyExpressCount } from '@/hooks/use-express-session-history';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import RAnimated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withSequence, Easing,
} from 'react-native-reanimated';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('window');

// ─── Constantes visuelles ────────────────────────────────────────────────────
const GOLD       = '#C8A96E';
const NIGHT_BG   = '#0D0B1A';
const INDIGO     = '#2E1870';
const SURFACE    = '#1E1A35';
const WHITE_SOFT = '#F0EBE0';
const TEXT_SOFT  = '#A89880';
const DURATION_OPTIONS = [
  { label: '3 min', seconds: 3 * 60 },
  { label: '5 min', seconds: 5 * 60 },
  { label: '10 min', seconds: 10 * 60 },
];
const DEFAULT_DURATION_IDX = 1; // 5 min par défaut
const EXPRESS_SESSIONS_KEY = '@somnioPax:expressSessionsWeek';

// ─── Méditations express embarquées (fallback si pas de DB) ─────────────────
const EXPRESS_MEDITATIONS = [
  {
    id: -1,
    slug: 'express-respiration',
    title: 'Respiration apaisante',
    subtitle: 'Séance express · 5 min',
    instructor: 'Yoya',
    categorySlug: 'stress',
    emoji: '🌬️',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/03/15/audio_1b3b3b3b3b.mp3',
    audioDurationSeconds: 300,
    coverColor: '#2D1B69',
  },
  {
    id: -2,
    slug: 'express-ancrage',
    title: 'Ancrage du moment présent',
    subtitle: 'Séance express · 5 min',
    instructor: 'Yoya',
    categorySlug: 'pleine-conscience',
    emoji: '🌿',
    audioUrl: '',
    audioDurationSeconds: 300,
    coverColor: '#14532D',
  },
  {
    id: -3,
    slug: 'express-sommeil',
    title: 'Détente avant le sommeil',
    subtitle: 'Séance express · 5 min',
    instructor: 'Yoya',
    categorySlug: 'sleep',
    emoji: '🌙',
    audioUrl: '',
    audioDurationSeconds: 300,
    coverColor: '#0F0C29',
  },
];

// ─── Helpers utilitaires ────────────────────────────────────────────────────
function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// ─── KeepAwake guard (ne monte que sur iOS/Android pour éviter le crash WakeLock web) ──
function KeepAwakeGuard() {
  useKeepAwake();
  return null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Visualiseur audio animé (barres) ────────────────────────────────────────
function MiniVisualizer({ isPlaying }: { isPlaying: boolean }) {
  const BAR_COUNT = 20;
  const bars = useMemo(() =>
    Array.from({ length: BAR_COUNT }, (_, i) => ({
      baseH: 4 + Math.abs(Math.sin(i * 0.9)) * 14 + Math.abs(Math.cos(i * 0.5)) * 8,
      phase: i * 0.3,
    })), []);

  return (
    <View style={vizStyles.container}>
      {bars.map((bar, i) => (
        <MiniBar key={i} baseH={bar.baseH} phase={bar.phase} isPlaying={isPlaying} />
      ))}
    </View>
  );
}

function MiniBar({ baseH, phase, isPlaying }: { baseH: number; phase: number; isPlaying: boolean }) {
  const h = useSharedValue(4);
  useEffect(() => {
    if (isPlaying) {
      h.value = withRepeat(
        withSequence(
          withTiming(baseH, { duration: 400 + phase * 80, easing: Easing.inOut(Easing.ease) }),
          withTiming(4,     { duration: 400 + phase * 80, easing: Easing.inOut(Easing.ease) }),
        ), -1, false
      );
    } else {
      h.value = withTiming(4, { duration: 300 });
    }
  }, [isPlaying]);

  const style = useAnimatedStyle(() => ({
    height: h.value,
    backgroundColor: GOLD,
    opacity: isPlaying ? 0.85 : 0.35,
  }));

  return <RAnimated.View style={[vizStyles.bar, style]} />;
}

const vizStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 32 },
  bar:       { width: 3, borderRadius: 2 },
});

// ─── Composant principal ─────────────────────────────────────────────────────
interface ExpressSessionSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Appelé quand une séance est complétée (minuteur = 0) */
  onSessionComplete?: () => void;
}

export function ExpressSessionSheet({ visible, onClose, onSessionComplete }: ExpressSessionSheetProps) {
  // Données DB — méditations courtes (≤ 6 min)
  const { data: allMeds = [] } = trpc.catalog.list.useQuery({ limit: 100 });
  const { isAuthenticated } = useAuth();
  const playedMutation = trpc.catalog.played.useMutation();

  // Sélectionner les méditations courtes ou utiliser le fallback
  const shortMeds = useMemo(() => {
    const db = (allMeds as any[]).filter((m: any) =>
      m.audioDurationSeconds > 0 && m.audioDurationSeconds <= 360 && m.audioUrl
    );
    return db.length > 0 ? db : EXPRESS_MEDITATIONS;
  }, [allMeds]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  // Durée personnalisable
  const [durationIdx, setDurationIdx] = useState(DEFAULT_DURATION_IDX);
  const sessionDuration = DURATION_OPTIONS[durationIdx].seconds;
  // Player cloche de fin (URI embarquée en base64 — son court)
  const bellPlayer = useAudioPlayer(
    { uri: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73467.mp3' }
  );
  const meditation = shortMeds[selectedIndex] ?? shortMeds[0];

  // Animation slide-up
  const slideAnim = useRef(new Animated.Value(SCREEN_H)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: SCREEN_H, duration: 280, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  // Player audio
  const hasAudio = !!(meditation?.audioUrl);
  const player = useAudioPlayer(hasAudio ? { uri: meditation.audioUrl } : { uri: '' });
  const status = useAudioPlayerStatus(player);
  const playCountedRef = useRef(false);

  // KeepAwake est géré par le composant KeepAwakeGuard ci-dessous (évite le crash WakeLock web)

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    }
    return () => { player.remove(); };
  }, []);

  // Compter la lecture
  useEffect(() => {
    if (status.playing && !playCountedRef.current && meditation && isAuthenticated && (meditation as any).id > 0) {
      playCountedRef.current = true;
      playedMutation.mutate({ meditationDbId: (meditation as any).id });
    }
  }, [status.playing]);

  // Minuteur décompte 5 min
  const [timeLeft, setTimeLeft] = useState(sessionDuration);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            setTimerActive(false);
            player.pause();
            // Son de fin + haptic
            if (Platform.OS !== 'web') {
              bellPlayer.play();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            // Incrémenter les compteurs (hebdomadaire + journalier)
            incrementWeeklyCount();
            incrementDailyExpressCount();
            onSessionComplete?.();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]);

  // Barre de progression audio ou minuteur
  const progress = hasAudio && status.duration > 0
    ? status.currentTime / status.duration
    : 1 - timeLeft / sessionDuration;

  // Halo animé
  const haloScale = useSharedValue(1);
  const haloOpacity = useSharedValue(0);
  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: haloScale.value }],
    opacity: haloOpacity.value,
  }));

  useEffect(() => {
    if (status.playing || timerActive) {
      haloScale.value = withRepeat(
        withSequence(
          withTiming(1.5, { duration: 1800, easing: Easing.out(Easing.ease) }),
          withTiming(1.0, { duration: 0 })
        ), -1, false
      );
      haloOpacity.value = withRepeat(
        withSequence(
          withTiming(0.45, { duration: 900 }),
          withTiming(0,    { duration: 900 })
        ), -1, false
      );
    } else {
      haloOpacity.value = withTiming(0, { duration: 400 });
    }
  }, [status.playing, timerActive]);

  // Changer de méditation
  const handleSelectMed = useCallback((idx: number) => {
    player.pause();
    setSelectedIndex(idx);
    setTimeLeft(sessionDuration);
    setTimerActive(false);
    playCountedRef.current = false;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [player]);

  // Play / Pause
  const handlePlayPause = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (hasAudio) {
      if (status.playing) {
        player.pause();
        setTimerActive(false);
      } else {
        player.play();
        setTimerActive(true);
      }
    } else {
      // Pas d'audio : utiliser uniquement le minuteur
      if (timerActive) {
        setTimerActive(false);
      } else {
        setTimerActive(true);
      }
    }
  }, [hasAudio, status.playing, timerActive, player]);

  const isPlaying = hasAudio ? status.playing : timerActive;

  // Fermer et réinitialiser
  // Compteur hebdomadaire
  const incrementWeeklyCount = useCallback(async () => {
    try {
      const now = new Date();
      const weekKey = `${now.getFullYear()}-W${getWeekNumber(now)}`;
      const raw = await AsyncStorage.getItem(EXPRESS_SESSIONS_KEY);
      const data: Record<string, number> = raw ? JSON.parse(raw) : {};
      data[weekKey] = (data[weekKey] ?? 0) + 1;
      await AsyncStorage.setItem(EXPRESS_SESSIONS_KEY, JSON.stringify(data));
    } catch (_) {}
  }, []);

  const handleClose = useCallback(() => {
    player.pause();
    setTimerActive(false);
    setTimeLeft(sessionDuration);
    playCountedRef.current = false;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [player, onClose]);

  if (!visible) return null;

  const med = meditation as any;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose} statusBarTranslucent>
      {/* KeepAwake uniquement sur iOS/Android (WakeLock non disponible sur web) */}
      {Platform.OS !== 'web' && <KeepAwakeGuard />}
      {/* Backdrop */}
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(7,5,28,0.72)', opacity: backdropAnim, pointerEvents: visible ? 'auto' : 'none' }]}
      >
        <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <LinearGradient colors={['#1A1530', '#0D0B1A']} style={styles.sheetInner}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerBadge}>⚡ SÉANCE EXPRESS</Text>
              <Text style={styles.headerTitle}>{DURATION_OPTIONS[durationIdx].label} pour vous recentrer</Text>
            </View>
            <Pressable style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.6 : 1 }]} onPress={handleClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* Sélecteur de durée */}
          <View style={styles.durationSelector}>
            {DURATION_OPTIONS.map((opt, i) => (
              <Pressable
                key={opt.label}
                style={({ pressed }) => [
                  styles.durationChip,
                  durationIdx === i && styles.durationChipActive,
                  { opacity: pressed ? 0.75 : 1 },
                ]}
                onPress={() => {
                  setDurationIdx(i);
                  setTimeLeft(opt.seconds);
                  setTimerActive(false);
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={[styles.durationChipLabel, durationIdx === i && styles.durationChipLabelActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Sélecteur de méditation */}
          {shortMeds.length > 1 && (
            <View style={styles.medSelector}>
              {shortMeds.slice(0, 3).map((m: any, i: number) => (
                <Pressable
                  key={m.slug}
                  style={({ pressed }) => [
                    styles.medChip,
                    selectedIndex === i && styles.medChipActive,
                    { opacity: pressed ? 0.75 : 1 },
                  ]}
                  onPress={() => handleSelectMed(i)}
                >
                  <Text style={styles.medChipEmoji}>{m.emoji ?? '🧘'}</Text>
                  <Text style={[styles.medChipLabel, selectedIndex === i && styles.medChipLabelActive]} numberOfLines={1}>
                    {m.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Zone centrale : halo + bouton play */}
          <View style={styles.playerCenter}>
            {/* Halo */}
            <RAnimated.View style={[styles.halo, haloStyle]} />
            {/* Cercle emoji */}
            <View style={[styles.emojiCircle, { backgroundColor: med.coverColor ?? INDIGO }]}>
              <Text style={styles.emojiText}>{med.emoji ?? '🧘'}</Text>
            </View>
            {/* Titre méditation */}
            <Text style={styles.medTitle}>{med.title}</Text>
            <Text style={styles.medSub}>{med.instructor ?? 'Yoya'} · {Math.round((med.audioDurationSeconds ?? 300) / 60)} min</Text>

            {/* Visualiseur */}
            <View style={styles.vizWrapper}>
              <MiniVisualizer isPlaying={isPlaying} />
            </View>
          </View>

          {/* Minuteur décompte */}
          <View style={styles.timerRow}>
            <Text style={styles.timerLabel}>Temps restant</Text>
            <Text style={[styles.timerValue, timeLeft < 60 && styles.timerValueUrgent]}>
              {formatTime(timeLeft)}
            </Text>
          </View>

          {/* Barre de progression */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` as any }]} />
          </View>

          {/* Contrôles */}
          <View style={styles.controls}>
            {/* Recommencer */}
            <Pressable
              style={({ pressed }) => [styles.controlBtn, { opacity: pressed ? 0.6 : 1 }]}
              onPress={() => {
                player.seekTo(0);
                setTimeLeft(sessionDuration);
                setTimerActive(false);
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={styles.controlBtnText}>↺</Text>
            </Pressable>

            {/* Play / Pause principal */}
            <Pressable
              style={({ pressed }) => [styles.playBtn, { transform: [{ scale: pressed ? 0.94 : 1 }] }]}
              onPress={handlePlayPause}
            >
              <LinearGradient colors={['#C8A96E', '#A07840']} style={styles.playBtnGradient}>
                <Text style={styles.playBtnIcon}>{isPlaying ? '⏸' : '▶'}</Text>
              </LinearGradient>
            </Pressable>

            {/* Ouvrir le player complet */}
            <Pressable
              style={({ pressed }) => [styles.controlBtn, { opacity: pressed ? 0.6 : 1 }]}
              onPress={() => {
                handleClose();
                // Navigation vers le player complet si disponible
              }}
            >
              <Text style={styles.controlBtnText}>⤢</Text>
            </Pressable>
          </View>

          {/* Message d'encouragement */}
          <Text style={styles.encouragement}>
            {timeLeft === sessionDuration
              ? 'Prenez une grande inspiration et commencez.'
              : isPlaying
              ? 'Restez dans le moment présent…'
              : timeLeft === 0
              ? '✨ Séance terminée. Bravo !'
              : 'En pause — reprenez quand vous êtes prêt.'}
          </Text>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.4, shadowRadius: 20 },
      android: { elevation: 20 },
    }),
  },
  sheetInner: {
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  durationSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  durationChip: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(200,169,110,0.35)',
    backgroundColor: 'rgba(200,169,110,0.08)',
  },
  durationChipActive: {
    backgroundColor: 'rgba(200,169,110,0.22)',
    borderColor: '#C8A96E',
  },
  durationChipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(200,169,110,0.6)',
    letterSpacing: 0.3,
  },
  durationChipLabelActive: {
    color: '#C8A96E',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(200,169,110,0.4)',
    alignSelf: 'center', marginBottom: 20,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20,
  },
  headerBadge: {
    fontSize: 10, fontWeight: '800', color: GOLD, letterSpacing: 1.2,
    textTransform: 'uppercase', marginBottom: 4,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: WHITE_SOFT, lineHeight: 22 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(200,169,110,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: 14, color: TEXT_SOFT, fontWeight: '600' },

  // Sélecteur
  medSelector: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  medChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10,
    borderWidth: 1, borderColor: 'rgba(200,169,110,0.15)',
  },
  medChipActive: {
    backgroundColor: 'rgba(200,169,110,0.14)',
    borderColor: 'rgba(200,169,110,0.55)',
  },
  medChipEmoji: { fontSize: 14 },
  medChipLabel: { fontSize: 10, color: TEXT_SOFT, fontWeight: '600', flex: 1 },
  medChipLabelActive: { color: GOLD },

  // Zone centrale
  playerCenter: { alignItems: 'center', marginBottom: 20 },
  halo: {
    position: 'absolute',
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: GOLD,
    top: 0,
  },
  emojiCircle: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    ...Platform.select({
      ios:     { shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  emojiText: { fontSize: 36 },
  medTitle: { fontSize: 18, fontWeight: '700', color: WHITE_SOFT, textAlign: 'center', marginBottom: 4 },
  medSub:   { fontSize: 12, color: TEXT_SOFT, textAlign: 'center', marginBottom: 16 },
  vizWrapper: { height: 36, justifyContent: 'center' },

  // Minuteur
  timerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  timerLabel: { fontSize: 12, color: TEXT_SOFT },
  timerValue: { fontSize: 22, fontWeight: '700', color: GOLD, fontVariant: ['tabular-nums'] },
  timerValueUrgent: { color: '#F97316' },

  // Barre de progression
  progressBar: {
    height: 4, borderRadius: 2,
    backgroundColor: 'rgba(200,169,110,0.18)',
    overflow: 'hidden', marginBottom: 28,
  },
  progressFill: { height: 4, borderRadius: 2, backgroundColor: GOLD },

  // Contrôles
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 20 },
  controlBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(200,169,110,0.10)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(200,169,110,0.25)',
  },
  controlBtnText: { fontSize: 20, color: TEXT_SOFT },
  playBtn: { width: 68, height: 68, borderRadius: 34 },
  playBtnGradient: {
    flex: 1, borderRadius: 34,
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios:     { shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  playBtnIcon: { fontSize: 26, color: '#07051C' },

  // Encouragement
  encouragement: {
    fontSize: 13, color: TEXT_SOFT, textAlign: 'center',
    fontStyle: 'italic', lineHeight: 18,
  },
});
