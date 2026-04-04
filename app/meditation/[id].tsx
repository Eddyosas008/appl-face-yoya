import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Platform, ActivityIndicator, Dimensions, Share, TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { trpc } from '@/lib/trpc';
import { useUser } from '@/lib/user-context';
import { useAuth } from '@/hooks/use-auth';
import { StaggeredItem } from '@/components/staggered-item';
import { useThemeContext } from '@/lib/theme-provider';
import { useColors } from '@/hooks/use-colors';
import { StarField } from '@/components/star-field';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Couleurs de catégories ──────────────────────────────────────────────────
const CATEGORY_COLORS_DARK: Record<string, [string, string]> = {
  stress:      ['#2D1B69', '#4C1D95'],
  sleep:       ['#0F0C29', '#302B63'],
  focus:       ['#1A0A2E', '#3B1F6E'],
  'self-love': ['#2D0A1E', '#7C1D4E'],
  morning:     ['#1A1000', '#5C3A00'],
  breathing:   ['#001A2E', '#003D6B'],
  gratitude:   ['#2D0A2E', '#7C1D7C'],
  'body-scan': ['#0A1A2E', '#1D3D7C'],
};
const CATEGORY_COLORS_LIGHT: Record<string, [string, string]> = {
  stress:      ['#C4B5FD', '#A78BFA'],
  sleep:       ['#BAE6FD', '#7DD3FC'],
  focus:       ['#DDD6FE', '#C4B5FD'],
  'self-love': ['#FBCFE8', '#F9A8D4'],
  morning:     ['#FEF08A', '#FDE047'],
  breathing:   ['#BAE6FD', '#93C5FD'],
  gratitude:   ['#E9D5FF', '#D8B4FE'],
  'body-scan': ['#BFDBFE', '#93C5FD'],
};

// ─── Vitesses de lecture ─────────────────────────────────────────────────────
const SPEEDS = [0.75, 1.0, 1.25, 1.5] as const;
type Speed = typeof SPEEDS[number];

// ─── Minuteur de sommeil ─────────────────────────────────────────────────────
const SLEEP_TIMERS = [
  { label: 'Off', minutes: 0 },
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '60 min', minutes: 60 },
];

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Composant visualiseur audio animé ──────────────────────────────────────
function AudioVisualizer({ isPlaying, progress, color, dimColor }: {
  isPlaying: boolean;
  progress: number;
  color: string;
  dimColor: string;
}) {
  const BAR_COUNT = 36;
  const bars = useMemo(() => Array.from({ length: BAR_COUNT }, (_, i) => {
    const baseH = 4 + Math.abs(Math.sin(i * 0.8)) * 18 + Math.abs(Math.cos(i * 0.5)) * 10;
    return { baseH, phase: i * 0.3 };
  }), []);

  const tick = useSharedValue(0);

  useEffect(() => {
    if (isPlaying) {
      tick.value = withRepeat(
        withTiming(Math.PI * 2, { duration: 2000, easing: Easing.linear }),
        -1, false
      );
    } else {
      tick.value = withTiming(0, { duration: 600 });
    }
  }, [isPlaying]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2.5, height: 50 }}>
      {bars.map((bar, i) => {
        const active = i / BAR_COUNT <= progress;
        return (
          <AnimatedBar
            key={i}
            baseH={bar.baseH}
            phase={bar.phase}
            tick={tick}
            isPlaying={isPlaying}
            active={active}
            color={color}
            dimColor={dimColor}
          />
        );
      })}
    </View>
  );
}

function AnimatedBar({ baseH, phase, tick, isPlaying, active, color, dimColor }: {
  baseH: number; phase: number; tick: SharedValue<number>;
  isPlaying: boolean; active: boolean; color: string; dimColor: string;
}) {
  const animStyle = useAnimatedStyle(() => {
    const h = isPlaying
      ? baseH * (0.5 + 0.5 * Math.abs(Math.sin(tick.value + phase)))
      : baseH * 0.35;
    return {
      height: withTiming(h, { duration: 80 }),
      opacity: active ? 1 : 0.35,
      backgroundColor: active ? color : dimColor,
    };
  });
  return <Animated.View style={[{ width: 3, borderRadius: 2 }, animStyle]} />;
}

// ─── Composant principal ─────────────────────────────────────────────────────
export default function MeditationPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useUser();
  const { isAuthenticated } = useAuth();
  const { isDark } = useThemeContext();
  const styles = useMemo(() => makeStyles(isDark), [isDark]);
  const colors = useColors();

  // ── Palette dynamique ──────────────────────────────────────────────────────
  const NIGHT_BG     = isDark ? '#07051C' : '#FAF7F2';
  const NIGHT_MID    = isDark ? '#0C0830' : '#E8E3F5';
  const GOLD         = isDark ? '#D4A853' : '#8B6914';
  const GOLD_GLOW    = isDark ? 'rgba(212,168,83,0.25)' : 'rgba(184,146,46,0.20)';
  const GOLD_SOFT    = isDark ? 'rgba(212,168,83,0.10)' : 'rgba(184,146,46,0.12)';
  const LAVENDER     = isDark ? 'rgba(180,168,220,0.75)' : 'rgba(100,80,160,0.80)';
  const LAVENDER_DIM = isDark ? 'rgba(180,168,220,0.12)' : 'rgba(100,80,160,0.12)';
  const WHITE_SOFT   = isDark ? '#F0EEF8' : '#1A1240';
  const GLASS_BG     = isDark ? '#2A2540' : 'rgba(255,255,255,0.70)';
  const GLASS_BORDER = isDark ? 'rgba(180,168,220,0.14)' : 'rgba(100,80,160,0.18)';
  const CATEGORY_COLORS = isDark ? CATEGORY_COLORS_DARK : CATEGORY_COLORS_LIGHT;

  // ── Données ────────────────────────────────────────────────────────────────
  const { data: meditation, isLoading: loadingMed } = trpc.catalog.get.useQuery(
    { slug: id ?? '' }, { enabled: !!id }
  );
  const { data: categories = [] } = trpc.catalog.categories.useQuery();
  const completeSessionMutation = trpc.sessions.complete.useMutation();
  const toggleFavMutation = trpc.favorites.toggle.useMutation();
  const playedMutation = trpc.catalog.played.useMutation();
  const { data: favList = [], refetch: refetchFavs } = trpc.favorites.list.useQuery(
    undefined, { enabled: isAuthenticated }
  );
  const { data: allMeds = [] } = trpc.catalog.list.useQuery({ limit: 100 });

  // ── État ───────────────────────────────────────────────────────────────────
  const isLocked = meditation?.isPremium && !profile?.isPremium;
  const isFav = meditation ? favList.includes(String(meditation.id)) : false;
  const [hasCompleted, setHasCompleted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<Speed>(1.0);
  const [isLooping, setIsLooping] = useState(false);
  const [sleepTimerIdx, setSleepTimerIdx] = useState(0);
  const [sleepSecondsLeft, setSleepSecondsLeft] = useState<number | null>(null);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [scriptExpanded, setScriptExpanded] = useState(false);
  const completedRef = useRef(false);
  const playCountedRef = useRef(false);
  const sleepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useKeepAwake();

  const isPlaceholderAudio = !meditation?.audioUrl ||
    meditation.audioUrl.includes('placeholder.yoya-wellness.com');
  const audioSource = (!isPlaceholderAudio && meditation?.audioUrl)
    ? { uri: meditation.audioUrl }
    : null;

  const player = useAudioPlayer(audioSource ?? { uri: '' });
  const status = useAudioPlayerStatus(player);

  // ── Animations ─────────────────────────────────────────────────────────────
  const artworkRotate = useSharedValue(0);
  const artworkScale = useSharedValue(1);
  const haloScale = useSharedValue(1);
  const haloOpacity = useSharedValue(0);

  const artworkStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${artworkRotate.value}deg` },
      { scale: artworkScale.value },
    ],
  }));
  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: haloScale.value }],
    opacity: haloOpacity.value,
  }));

  useEffect(() => {
    if (status.playing) {
      artworkRotate.value = withRepeat(
        withTiming(360, { duration: 20000, easing: Easing.linear }),
        -1, false
      );
      artworkScale.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0,  { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ), -1, false
      );
      haloScale.value = withRepeat(
        withSequence(
          withTiming(1.6, { duration: 2000, easing: Easing.out(Easing.ease) }),
          withTiming(1.0, { duration: 0 })
        ), -1, false
      );
      haloOpacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 700 }),
          withTiming(0,   { duration: 1300 })
        ), -1, false
      );
    } else {
      artworkRotate.value = withTiming(artworkRotate.value, { duration: 1500 });
      artworkScale.value = withTiming(1, { duration: 400 });
      haloOpacity.value = withTiming(0, { duration: 400 });
    }
  }, [status.playing]);

  // ── Setup audio ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'web') {
      setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    }
    return () => {
      player.remove();
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    };
  }, []);

  // ── Vitesse de lecture ─────────────────────────────────────────────────────
  useEffect(() => {
    try { player.setPlaybackRate(playbackSpeed); } catch (_) {}
  }, [playbackSpeed]);

  // ── Boucle ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    try { player.loop = isLooping; } catch (_) {}
  }, [isLooping]);

  // ── Play count ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status.playing && !playCountedRef.current && meditation && isAuthenticated) {
      playCountedRef.current = true;
      playedMutation.mutate({ meditationDbId: meditation.id });
    }
  }, [status.playing, meditation, isAuthenticated]);

  // ── Complétion ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (
      !completedRef.current &&
      status.duration > 0 &&
      status.currentTime >= status.duration - 1 &&
      !status.playing
    ) {
      completedRef.current = true;
      setHasCompleted(true);
      handleComplete(Math.ceil(status.duration / 60));
    }
  }, [status.currentTime, status.duration, status.playing]);

  // ── Minuteur de sommeil ────────────────────────────────────────────────────
  function startSleepTimer(minutes: number) {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    if (minutes === 0) { setSleepSecondsLeft(null); return; }
    setSleepSecondsLeft(minutes * 60);
    sleepTimerRef.current = setInterval(() => {
      setSleepSecondsLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(sleepTimerRef.current!);
          player.pause();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleComplete(minutes: number) {
    if (!meditation) return;
    if (isAuthenticated) {
      await completeSessionMutation.mutateAsync({
        meditationId: String(meditation.id),
        meditationTitle: meditation.title,
        category: meditation.categorySlug,
        duration: minutes || 1,
        completed: true,
      });
    }
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  function togglePlay() {
    if (!audioSource) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (status.playing) {
      player.pause();
    } else {
      if (status.currentTime >= status.duration - 1 && status.duration > 0) player.seekTo(0);
      player.play();
    }
  }

  function seekBackward() {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    player.seekTo(Math.max(0, status.currentTime - 15));
  }
  function seekForward() {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    player.seekTo(Math.min(status.duration, status.currentTime + 15));
  }

  function handleSeekOnTrack(evt: any) {
    if (status.duration <= 0) return;
    const { locationX, target } = evt.nativeEvent;
    // Largeur de la piste = SCREEN_W - 40 - 48 (padding)
    const trackW = SCREEN_W - 88;
    const ratio = Math.max(0, Math.min(1, locationX / trackW));
    player.seekTo(ratio * status.duration);
  }

  async function handleShare() {
    if (!meditation) return;
    try {
      await Share.share({
        message: `🧘 "${meditation.title}" — une méditation guidée sur SomnioPax`,
        title: meditation.title,
      });
    } catch (_) {}
  }

  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;
  const categoryInfo = categories.find(c => c.slug === meditation?.categorySlug);
  const coverGradient = CATEGORY_COLORS[meditation?.categorySlug ?? ''] ?? (isDark ? ['#1A0A2E', '#302B63'] : ['#DDD6FE', '#C4B5FD']);
  const tags: string[] = meditation?.tags ? JSON.parse(meditation.tags) : [];

  const similar = useMemo(() =>
    allMeds.filter(m => m.categorySlug === meditation?.categorySlug && m.id !== meditation?.id).slice(0, 6),
    [allMeds, meditation]
  );

  // ── Chargement ─────────────────────────────────────────────────────────────
  if (loadingMed) {
    return (
      <View style={[styles.root, { backgroundColor: NIGHT_BG }]}>
        <LinearGradient colors={[NIGHT_BG, NIGHT_MID]} style={StyleSheet.absoluteFillObject} />
        <StarField />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={[styles.loadingText, { color: LAVENDER }]}>Chargement de la méditation...</Text>
        </View>
      </View>
    );
  }

  if (!meditation) {
    return (
      <View style={[styles.root, { backgroundColor: NIGHT_BG }]}>
        <LinearGradient colors={[NIGHT_BG, NIGHT_MID]} style={StyleSheet.absoluteFillObject} />
        <StarField />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 32 }}>
          <Text style={{ fontSize: 48 }}>🔍</Text>
          <Text style={[styles.notFoundTitle, { color: WHITE_SOFT }]}>Méditation introuvable</Text>
          <Text style={[styles.notFoundSub, { color: LAVENDER }]}>Cette méditation n'est pas disponible.</Text>
          <Pressable
            style={({ pressed }) => [styles.backBtn, { backgroundColor: GOLD_SOFT, borderColor: isDark ? 'rgba(212,168,83,0.4)' : 'rgba(184,146,46,0.4)', opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backBtnText, { color: GOLD }]}>Retour</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Rendu principal ───────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: NIGHT_BG }]}>
      {/* Fond dégradé immersif */}
      <LinearGradient
        colors={isDark
          ? [NIGHT_BG, NIGHT_MID, '#0F0B2E']
          : [NIGHT_BG, NIGHT_MID, '#EDE8F8']}
        style={StyleSheet.absoluteFillObject}
      />
      <StarField />

      {/* Boutons flottants */}
      <View style={styles.floatRow}>
        <Pressable
          style={({ pressed }) => [styles.floatBtn, { backgroundColor: GLASS_BG, borderColor: GLASS_BORDER, opacity: pressed ? 0.7 : 1 }]}
          onPress={() => router.back()}
        >
          <IconSymbol name="xmark" size={16} color={WHITE_SOFT} />
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            style={({ pressed }) => [styles.floatBtn, { backgroundColor: GLASS_BG, borderColor: GLASS_BORDER, opacity: pressed ? 0.7 : 1 }]}
            onPress={handleShare}
          >
            <IconSymbol name="square.and.arrow.up" size={16} color={WHITE_SOFT} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.floatBtn, { backgroundColor: isFav ? 'rgba(244,63,94,0.15)' : GLASS_BG, borderColor: isFav ? 'rgba(244,63,94,0.4)' : GLASS_BORDER, opacity: pressed ? 0.7 : 1 }]}
            onPress={async () => {
              if (isAuthenticated) {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                await toggleFavMutation.mutateAsync({ meditationId: String(meditation.id) });
                refetchFavs();
              }
            }}
          >
            <IconSymbol
              name={isFav ? 'heart.fill' : 'heart'}
              size={18}
              color={isFav ? '#F43F5E' : WHITE_SOFT}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Hero : artwork ─────────────────────────────────────────────── */}
        <View style={styles.heroSection}>
          {/* Halo de fond */}
          <Animated.View style={[styles.artworkHalo, { backgroundColor: GOLD_GLOW, shadowColor: GOLD }, haloStyle]} />

          {/* Artwork animé */}
          <Animated.View style={[styles.artworkWrapper, artworkStyle]}>
            <LinearGradient
              colors={[...coverGradient, isDark ? 'rgba(212,168,83,0.1)' : 'rgba(184,146,46,0.1)']}
              style={[styles.artworkGlass, { borderColor: isDark ? 'rgba(212,168,83,0.3)' : 'rgba(184,146,46,0.35)' }]}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
            >
              <Text style={styles.artworkEmoji}>{categoryInfo?.emoji ?? '🧘'}</Text>
            </LinearGradient>
          </Animated.View>

          {/* Reflet */}
          <View style={[styles.artworkReflect, { backgroundColor: GOLD_GLOW }]} />

          {/* Titre & catégorie */}
          <View style={styles.titleBlock}>
            <Text style={[styles.categoryLabel, { color: GOLD }]}>
              {categoryInfo?.name?.toUpperCase() ?? meditation.categorySlug.toUpperCase()}
              {meditation.instructor ? `  ·  ${meditation.instructor}` : ''}
            </Text>
            <Text style={[styles.meditationTitle, { color: WHITE_SOFT }]} numberOfLines={2}>
              {meditation.title}
            </Text>
            {meditation.subtitle && (
              <Text style={[styles.meditationSubtitle, { color: LAVENDER }]}>{meditation.subtitle}</Text>
            )}
          </View>
        </View>

        {/* ── Contenu ──────────────────────────────────────────────────────── */}
        <View style={styles.content}>

          {/* Tags */}
          {tags.length > 0 && (
            <View style={styles.tags}>
              {tags.map(tag => (
                <View key={tag} style={[styles.tag, { backgroundColor: GOLD_SOFT, borderColor: isDark ? 'rgba(212,168,83,0.3)' : 'rgba(184,146,46,0.35)' }]}>
                  <Text style={[styles.tagText, { color: GOLD }]}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Description */}
          {meditation.description ? (
            <Text style={[styles.description, { color: LAVENDER }]}>{meditation.description}</Text>
          ) : null}

          {/* Bannière de complétion */}
          {hasCompleted && (
            <View style={styles.completionBanner}>
              <Text style={{ fontSize: 22 }}>🎉</Text>
              <Text style={styles.completionText}>
                Félicitations ! Vous avez terminé cette méditation.
              </Text>
            </View>
          )}

          {/* ── Lecteur ──────────────────────────────────────────────────── */}
          {isLocked ? (
            <View style={[styles.player, { backgroundColor: GLASS_BG, borderColor: GLASS_BORDER, alignItems: 'center', gap: 12, paddingVertical: 36 }]}>
              <Text style={{ fontSize: 40 }}>🔒</Text>
              <Text style={[styles.lockedTitle, { color: WHITE_SOFT }]}>Contenu Premium</Text>
              <Text style={[styles.lockedSub, { color: LAVENDER }]}>
                Débloquez toutes les méditations avec un abonnement Premium.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.unlockButton, { backgroundColor: GOLD, opacity: pressed ? 0.85 : 1 }]}
                onPress={() => router.back()}
              >
                <Text style={[styles.unlockButtonText, { color: NIGHT_BG }]}>Découvrir Premium</Text>
              </Pressable>
            </View>
          ) : (
            <View style={[styles.player, { backgroundColor: GLASS_BG, borderColor: GLASS_BORDER }]}>

              {/* ── Visualiseur audio animé ── */}
              <AudioVisualizer
                isPlaying={status.playing}
                progress={progress}
                color={GOLD}
                dimColor={LAVENDER_DIM}
              />

              {/* ── Barre de progression interactive ── */}
              <View style={styles.progressContainer}>
                <Pressable onPress={handleSeekOnTrack} style={styles.progressTouchArea}>
                  <View style={[styles.progressTrack, { backgroundColor: LAVENDER_DIM }]}>
                    <View style={[styles.progressFill, { width: `${progress * 100}%` as any, backgroundColor: GOLD }]} />
                    <View style={[styles.progressThumb, {
                      left: `${Math.max(0, Math.min(97, progress * 100 - 1.5))}%` as any,
                      backgroundColor: GOLD,
                      shadowColor: GOLD,
                    }]} />
                  </View>
                </Pressable>
                <View style={styles.timeRow}>
                  <Text style={[styles.timeText, { color: LAVENDER }]}>
                    {status.duration > 0 ? formatTime(status.currentTime) : '0:00'}
                  </Text>
                  {sleepSecondsLeft !== null && (
                    <View style={[styles.sleepBadge, { backgroundColor: GOLD_SOFT, borderColor: isDark ? 'rgba(212,168,83,0.3)' : 'rgba(184,146,46,0.3)' }]}>
                      <Text style={{ fontSize: 10 }}>🌙</Text>
                      <Text style={[styles.sleepBadgeText, { color: GOLD }]}>{formatTime(sleepSecondsLeft)}</Text>
                    </View>
                  )}
                  <Text style={[styles.timeText, { color: LAVENDER }]}>
                    {status.duration > 0
                      ? `-${formatTime(status.duration - status.currentTime)}`
                      : formatTime(meditation.audioDurationSeconds)}
                  </Text>
                </View>
              </View>

              {/* ── Contrôles principaux ── */}
              <View style={styles.controls}>
                {/* Reculer 15s */}
                <Pressable
                  style={({ pressed }) => [styles.seekBtn, { opacity: pressed ? 0.6 : 1 }]}
                  onPress={seekBackward}
                >
                  <IconSymbol name="backward.fill" size={26} color={LAVENDER} />
                  <Text style={[styles.seekLabel, { color: LAVENDER }]}>15</Text>
                </Pressable>

                {/* Bouton play principal */}
                <View style={styles.playBtnWrapper}>
                  <Animated.View style={[styles.playHalo, haloStyle, { backgroundColor: GOLD_GLOW }]} />
                  <Pressable
                    style={({ pressed }) => [
                      styles.playButton,
                      { opacity: pressed ? 0.9 : 1, shadowColor: GOLD },
                      !audioSource && styles.playButtonDisabled,
                    ]}
                    onPress={togglePlay}
                  >
                    <LinearGradient
                      colors={['#E8C06A', GOLD, '#B8882A']}
                      style={styles.playButtonGradient}
                      start={{ x: 0.2, y: 0 }}
                      end={{ x: 0.8, y: 1 }}
                    >
                      <IconSymbol
                        name={status.playing ? 'pause.fill' : 'play.fill'}
                        size={34}
                        color={NIGHT_BG}
                      />
                    </LinearGradient>
                  </Pressable>
                </View>

                {/* Avancer 15s */}
                <Pressable
                  style={({ pressed }) => [styles.seekBtn, { opacity: pressed ? 0.6 : 1 }]}
                  onPress={seekForward}
                >
                  <IconSymbol name="forward.fill" size={26} color={LAVENDER} />
                  <Text style={[styles.seekLabel, { color: LAVENDER }]}>15</Text>
                </Pressable>
              </View>

              {/* ── Contrôles secondaires ── */}
              <View style={styles.secondaryControls}>
                {/* Boucle */}
                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryBtn,
                    { backgroundColor: isLooping ? GOLD_SOFT : 'transparent', borderColor: isLooping ? GOLD : GLASS_BORDER, opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setIsLooping(v => !v);
                  }}
                >
                  <Text style={{ fontSize: 14 }}>🔁</Text>
                  <Text style={[styles.secondaryBtnLabel, { color: isLooping ? GOLD : LAVENDER }]}>Boucle</Text>
                </Pressable>

                {/* Vitesse */}
                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryBtn,
                    { backgroundColor: playbackSpeed !== 1.0 ? GOLD_SOFT : 'transparent', borderColor: playbackSpeed !== 1.0 ? GOLD : GLASS_BORDER, opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={() => setShowSpeedMenu(v => !v)}
                >
                  <Text style={{ fontSize: 14 }}>⚡</Text>
                  <Text style={[styles.secondaryBtnLabel, { color: playbackSpeed !== 1.0 ? GOLD : LAVENDER }]}>{playbackSpeed}x</Text>
                </Pressable>

                {/* Minuteur sommeil */}
                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryBtn,
                    { backgroundColor: sleepTimerIdx > 0 ? GOLD_SOFT : 'transparent', borderColor: sleepTimerIdx > 0 ? GOLD : GLASS_BORDER, opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={() => setShowSleepMenu(v => !v)}
                >
                  <Text style={{ fontSize: 14 }}>🌙</Text>
                  <Text style={[styles.secondaryBtnLabel, { color: sleepTimerIdx > 0 ? GOLD : LAVENDER }]}>
                    {sleepTimerIdx > 0 ? SLEEP_TIMERS[sleepTimerIdx].label : 'Sommeil'}
                  </Text>
                </Pressable>
              </View>

              {/* ── Menu vitesse ── */}
              {showSpeedMenu && (
                <View style={[styles.menuContainer, { backgroundColor: GLASS_BG, borderColor: GLASS_BORDER }]}>
                  <Text style={[styles.menuTitle, { color: WHITE_SOFT }]}>Vitesse de lecture</Text>
                  <View style={styles.menuRow}>
                    {SPEEDS.map(speed => (
                      <Pressable
                        key={speed}
                        style={({ pressed }) => [
                          styles.menuChip,
                          { backgroundColor: playbackSpeed === speed ? GOLD : GOLD_SOFT, borderColor: GOLD, opacity: pressed ? 0.8 : 1 },
                        ]}
                        onPress={() => {
                          setPlaybackSpeed(speed);
                          setShowSpeedMenu(false);
                          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                      >
                        <Text style={[styles.menuChipText, { color: playbackSpeed === speed ? NIGHT_BG : GOLD }]}>{speed}x</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {/* ── Menu minuteur sommeil ── */}
              {showSleepMenu && (
                <View style={[styles.menuContainer, { backgroundColor: GLASS_BG, borderColor: GLASS_BORDER }]}>
                  <Text style={[styles.menuTitle, { color: WHITE_SOFT }]}>Minuteur de sommeil</Text>
                  <View style={styles.menuRow}>
                    {SLEEP_TIMERS.map((t, idx) => (
                      <Pressable
                        key={t.label}
                        style={({ pressed }) => [
                          styles.menuChip,
                          { backgroundColor: sleepTimerIdx === idx ? GOLD : GOLD_SOFT, borderColor: GOLD, opacity: pressed ? 0.8 : 1 },
                        ]}
                        onPress={() => {
                          setSleepTimerIdx(idx);
                          startSleepTimer(t.minutes);
                          setShowSleepMenu(false);
                          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                      >
                        <Text style={[styles.menuChipText, { color: sleepTimerIdx === idx ? NIGHT_BG : GOLD }]}>{t.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {/* Hint */}
              <Text style={[styles.playerHint, { color: LAVENDER }]}>
                {status.playing
                  ? '✦  Méditation en cours  ✦'
                  : isPlaceholderAudio
                  ? '✦  Script disponible ci-dessous  ✦'
                  : '✦  Appuyez pour commencer  ✦'}
              </Text>
            </View>
          )}

          {/* ── Infos enrichies ──────────────────────────────────────────── */}
          <View style={[styles.infoCard, { backgroundColor: GLASS_BG, borderColor: GLASS_BORDER }]}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoEmoji}>⏱</Text>
                <Text style={[styles.infoValue, { color: WHITE_SOFT }]}>
                  {Math.round(meditation.audioDurationSeconds / 60)} min
                </Text>
                <Text style={[styles.infoLabel, { color: LAVENDER }]}>Durée</Text>
              </View>
              <View style={[styles.infoSep, { backgroundColor: GLASS_BORDER }]} />
              <View style={styles.infoItem}>
                <Text style={styles.infoEmoji}>
                  {meditation.level === 'beginner' ? '🌱' : meditation.level === 'intermediate' ? '🌿' : meditation.level === 'advanced' ? '🌳' : '✨'}
                </Text>
                <Text style={[styles.infoValue, { color: WHITE_SOFT }]}>
                  {meditation.level === 'beginner' ? 'Débutant' : meditation.level === 'intermediate' ? 'Intermédiaire' : meditation.level === 'advanced' ? 'Avancé' : 'Tous niveaux'}
                </Text>
                <Text style={[styles.infoLabel, { color: LAVENDER }]}>Niveau</Text>
              </View>
              <View style={[styles.infoSep, { backgroundColor: GLASS_BORDER }]} />
              <View style={styles.infoItem}>
                <Text style={styles.infoEmoji}>{categoryInfo?.emoji ?? '🧘'}</Text>
                <Text style={[styles.infoValue, { color: WHITE_SOFT }]} numberOfLines={1}>
                  {categoryInfo?.name ?? meditation.categorySlug}
                </Text>
                <Text style={[styles.infoLabel, { color: LAVENDER }]}>Catégorie</Text>
              </View>
              {meditation.playCount > 0 && (
                <>
                  <View style={[styles.infoSep, { backgroundColor: GLASS_BORDER }]} />
                  <View style={styles.infoItem}>
                    <Text style={styles.infoEmoji}>🎧</Text>
                    <Text style={[styles.infoValue, { color: WHITE_SOFT }]}>{meditation.playCount}</Text>
                    <Text style={[styles.infoLabel, { color: LAVENDER }]}>Écoutes</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* ── Script de méditation (déroulant) ─────────────────────────── */}
          {meditation.scriptText && (
            <View style={[styles.scriptContainer, { backgroundColor: GLASS_BG, borderColor: GLASS_BORDER }]}>
              <Pressable
                style={({ pressed }) => [styles.scriptHeader, { opacity: pressed ? 0.8 : 1 }]}
                onPress={() => setScriptExpanded(v => !v)}
              >
                <Text style={styles.scriptTitleIcon}>📖</Text>
                <Text style={[styles.scriptTitle, { color: WHITE_SOFT, flex: 1 }]}>Script de méditation</Text>
                <Text style={{ color: GOLD, fontSize: 18 }}>{scriptExpanded ? '▲' : '▼'}</Text>
              </Pressable>
              {scriptExpanded && (
                <Text style={[styles.scriptText, { color: LAVENDER }]}>{meditation.scriptText}</Text>
              )}
            </View>
          )}

          {/* ── Méditations similaires ───────────────────────────────────── */}
          {similar.length > 0 && (
            <View style={styles.similarSection}>
              <Text style={[styles.similarTitle, { color: WHITE_SOFT }]}>Dans la même catégorie</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 4 }}>
                {similar.map((sim, idx) => {
                  const simCat = categories.find(c => c.slug === sim.categorySlug);
                  const simGrad = CATEGORY_COLORS[sim.categorySlug] ?? (isDark ? ['#1A0A2E', '#302B63'] : ['#DDD6FE', '#C4B5FD']);
                  return (
                    <StaggeredItem key={sim.id} index={idx} staggerDelay={70} translateY={14}>
                      <Pressable
                        style={({ pressed }) => [styles.simCard, { backgroundColor: GLASS_BG, borderColor: GLASS_BORDER, opacity: pressed ? 0.85 : 1 }]}
                        onPress={() => router.replace(`/meditation/${sim.slug}` as never)}
                      >
                        <LinearGradient colors={simGrad} style={styles.simCover}>
                          <Text style={styles.simEmoji}>{simCat?.emoji ?? '🧘'}</Text>
                          {sim.isPremium && (
                            <View style={[styles.simPremiumBadge, { backgroundColor: GOLD }]}>
                              <Text style={{ fontSize: 8, color: '#000', fontWeight: '700' }}>PRO</Text>
                            </View>
                          )}
                        </LinearGradient>
                        <View style={styles.simInfo}>
                          <Text style={[styles.simCatLabel, { color: GOLD }]} numberOfLines={1}>
                            {simCat?.name ?? sim.categorySlug}
                          </Text>
                          <Text style={[styles.simCardTitle, { color: WHITE_SOFT }]} numberOfLines={2}>{sim.title}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <Text style={[styles.simDuration, { color: LAVENDER }]}>
                              {Math.round(sim.audioDurationSeconds / 60)} min
                            </Text>
                            {sim.playCount > 0 && (
                              <Text style={[styles.simDuration, { color: LAVENDER }]}>· {sim.playCount} 🎧</Text>
                            )}
                          </View>
                        </View>
                      </Pressable>
                    </StaggeredItem>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
function makeStyles(isDark: boolean) {
  const NIGHT_BG = isDark ? '#07051C' : '#FAF7F2';
  return StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 0 },

  // Loading / erreur
  loadingText: { fontSize: 14, letterSpacing: 0.3 },
  notFoundTitle: { fontFamily: 'CormorantGaramond-Medium', fontSize: 22, textAlign: 'center' },
  notFoundSub: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  backBtn: { marginTop: 8, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 999, borderWidth: 0.5 },
  backBtnText: { fontWeight: '600', fontSize: 14 },

  // Boutons flottants
  floatRow: {
    position: 'absolute', top: 52, left: 20, right: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    zIndex: 10,
  },
  floatBtn: {
    width: 40, height: 40, borderRadius: 13,
    borderWidth: 0.5,
    alignItems: 'center', justifyContent: 'center',
  },

  // Hero / Artwork
  heroSection: {
    paddingTop: 110,
    paddingBottom: 28,
    alignItems: 'center',
  },
  artworkHalo: {
    position: 'absolute',
    top: 80,
    width: 260, height: 260,
    borderRadius: 130,
    shadowRadius: 50,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 0 },
  },
  artworkWrapper: {
    width: 220, height: 220,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
  },
  artworkGlass: {
    width: 210, height: 210,
    borderRadius: 38,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowRadius: 24,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  artworkEmoji: { fontSize: 88 },
  artworkReflect: {
    position: 'absolute',
    bottom: 28,
    width: 200,
    height: 30,
    borderRadius: 100,
    opacity: 0.3,
  },

  // Titre
  titleBlock: { alignItems: 'center', paddingHorizontal: 24, gap: 6 },
  categoryLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.4 },
  meditationTitle: {
    fontFamily: 'CormorantGaramond-Medium',
    fontSize: 30, textAlign: 'center', lineHeight: 36,
  },
  meditationSubtitle: { fontSize: 13, textAlign: 'center', letterSpacing: 0.3 },

  // Contenu
  content: { paddingHorizontal: 20 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 0.5 },
  tagText: { fontSize: 11, fontWeight: '500', letterSpacing: 0.3 },
  description: { fontSize: 14, lineHeight: 22, marginBottom: 20, letterSpacing: 0.2 },

  // Bannière complétion
  completionBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 16, padding: 16, marginBottom: 20,
    backgroundColor: 'rgba(74,222,128,0.08)',
    borderWidth: 0.5, borderColor: 'rgba(74,222,128,0.25)',
  },
  completionText: { flex: 1, fontSize: 13, color: '#4ADE80', fontWeight: '500', lineHeight: 18 },

  // Lecteur verrouillé
  lockedTitle: { fontFamily: 'CormorantGaramond-Medium', fontSize: 22 },
  lockedSub: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  unlockButton: { marginTop: 8, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 999 },
  unlockButtonText: { fontWeight: '700', fontSize: 14, letterSpacing: 0.3 },

  // Lecteur actif
  player: { borderRadius: 24, padding: 22, marginBottom: 20, borderWidth: 0.5 },

  // Barre de progression
  progressContainer: { marginBottom: 20, marginTop: 16 },
  progressTouchArea: { paddingVertical: 10 },
  progressTrack: { height: 4, borderRadius: 2, position: 'relative' },
  progressFill: { height: 4, borderRadius: 2, position: 'absolute', top: 0, left: 0 },
  progressThumb: {
    width: 14, height: 14, borderRadius: 7,
    position: 'absolute', top: -5,
    shadowRadius: 8, shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  timeText: { fontSize: 11, letterSpacing: 0.3 },
  sleepBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 999, borderWidth: 0.5,
  },
  sleepBadgeText: { fontSize: 10, fontWeight: '600' },

  // Contrôles principaux
  controls: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 32, marginBottom: 20,
  },
  seekBtn: { alignItems: 'center', gap: 3 },
  seekLabel: { fontSize: 9, letterSpacing: 0.3 },
  playBtnWrapper: { width: 84, height: 84, alignItems: 'center', justifyContent: 'center' },
  playHalo: { position: 'absolute', width: 84, height: 84, borderRadius: 42 },
  playButton: {
    width: 80, height: 80, borderRadius: 40, overflow: 'hidden',
    shadowRadius: 20, shadowOpacity: 0.6, shadowOffset: { width: 0, height: 4 }, elevation: 10,
  },
  playButtonGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  playButtonDisabled: { opacity: 0.4 },

  // Contrôles secondaires
  secondaryControls: {
    flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 14,
  },
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 999, borderWidth: 0.5,
  },
  secondaryBtnLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },

  // Menus
  menuContainer: {
    borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 0.5,
  },
  menuTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3, marginBottom: 12, textAlign: 'center' },
  menuRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  menuChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 0.5,
  },
  menuChipText: { fontSize: 12, fontWeight: '700' },

  playerHint: { textAlign: 'center', fontSize: 11, letterSpacing: 0.8, marginTop: 4 },

  // Infos enrichies
  infoCard: { borderRadius: 18, padding: 18, marginBottom: 20, borderWidth: 0.5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  infoItem: { flex: 1, alignItems: 'center', gap: 4 },
  infoEmoji: { fontSize: 22 },
  infoValue: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  infoLabel: { fontSize: 10, textAlign: 'center', letterSpacing: 0.3 },
  infoSep: { width: 0.5, height: 48, opacity: 0.5 },

  // Script
  scriptContainer: { borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 0.5 },
  scriptHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scriptTitleIcon: { fontSize: 16 },
  scriptTitle: { fontFamily: 'CormorantGaramond-Medium', fontSize: 18 },
  scriptText: { fontSize: 14, lineHeight: 24, letterSpacing: 0.2, marginTop: 14 },

  // Similaires
  similarSection: { marginBottom: 8 },
  similarTitle: { fontFamily: 'CormorantGaramond-Medium', fontSize: 18, marginBottom: 14 },
  simCard: { borderRadius: 16, overflow: 'hidden', width: 160, borderWidth: 0.5 },
  simCover: { height: 90, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  simEmoji: { fontSize: 32 },
  simPremiumBadge: {
    position: 'absolute', top: 6, right: 6,
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4,
  },
  simInfo: { padding: 10 },
  simCatLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 },
  simCardTitle: { fontSize: 12, fontWeight: '500', lineHeight: 16, marginBottom: 3 },
  simDuration: { fontSize: 10 },
  });
}
