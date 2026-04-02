import { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Platform, ActivityIndicator, FlatList, Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing,
} from 'react-native-reanimated';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PremiumBadge } from '@/components/ui/premium-badge';
import { trpc } from '@/lib/trpc';
import { useUser } from '@/lib/user-context';
import { useAuth } from '@/hooks/use-auth';

// ─── Palette Sanctuaire du Sommeil ─────────────────────────────────────────
const NIGHT_BG     = '#07051C';
const NIGHT_MID    = '#0C0830';
const GOLD         = '#D4A853';
const GOLD_GLOW    = 'rgba(212,168,83,0.25)';
const GOLD_SOFT    = 'rgba(212,168,83,0.10)';
const LAVENDER     = 'rgba(180,168,220,0.55)';
const LAVENDER_DIM = 'rgba(180,168,220,0.12)';
const WHITE_SOFT   = '#F0EEF8';
const GLASS_BG     = 'rgba(255,255,255,0.05)';
const GLASS_BORDER = 'rgba(180,168,220,0.14)';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Étoiles statiques (rendu SVG-like avec Views) ─────────────────────────
const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: (i * 73 + 17) % 100,
  y: (i * 47 + 11) % 60,
  size: i % 5 === 0 ? 2.5 : i % 3 === 0 ? 1.8 : 1.2,
  opacity: 0.3 + (i % 7) * 0.1,
}));

function StarField() {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {STARS.map(star => (
        <View
          key={star.id}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: WHITE_SOFT,
            opacity: star.opacity,
          }}
        />
      ))}
    </View>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const CATEGORY_COLORS: Record<string, [string, string]> = {
  stress:      ['#2D1B69', '#4C1D95'],
  sleep:       ['#0F0C29', '#302B63'],
  focus:       ['#1A0A2E', '#3B1F6E'],
  'self-love': ['#2D0A1E', '#7C1D4E'],
  morning:     ['#1A1000', '#5C3A00'],
  breathing:   ['#001A2E', '#003D6B'],
  gratitude:   ['#2D0A2E', '#7C1D7C'],
  'body-scan': ['#0A1A2E', '#1D3D7C'],
};

// ─── Composant principal ─────────────────────────────────────────────────────
export default function MeditationPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useUser();
  const { isAuthenticated } = useAuth();

  const { data: meditation, isLoading: loadingMed } = trpc.catalog.get.useQuery(
    { slug: id ?? '' },
    { enabled: !!id }
  );
  const { data: categories = [] } = trpc.catalog.categories.useQuery();
  const completeSessionMutation = trpc.sessions.complete.useMutation();
  const toggleFavMutation = trpc.favorites.toggle.useMutation();
  const playedMutation = trpc.catalog.played.useMutation();
  const { data: favList = [], refetch: refetchFavs } = trpc.favorites.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: allMeds = [] } = trpc.catalog.list.useQuery({ limit: 100 });

  const isLocked = meditation?.isPremium && !profile?.isPremium;
  const isFav = meditation ? favList.includes(String(meditation.id)) : false;
  const [hasCompleted, setHasCompleted] = useState(false);
  const completedRef = useRef(false);
  const playCountedRef = useRef(false);

  useKeepAwake();

  const isPlaceholderAudio = !meditation?.audioUrl ||
    meditation.audioUrl.includes('placeholder.yoya-wellness.com');
  const audioSource = (!isPlaceholderAudio && meditation?.audioUrl)
    ? { uri: meditation.audioUrl }
    : null;

  const player = useAudioPlayer(audioSource ?? { uri: '' });
  const status = useAudioPlayerStatus(player);

  // Animation pulsante du bouton play
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  // Halo animé autour du bouton play
  const haloScale = useSharedValue(1);
  const haloOpacity = useSharedValue(0);
  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: haloScale.value }],
    opacity: haloOpacity.value,
  }));

  useEffect(() => {
    if (status.playing) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0,  { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1, false
      );
      haloScale.value = withRepeat(
        withSequence(
          withTiming(1.5, { duration: 1800, easing: Easing.out(Easing.ease) }),
          withTiming(1.0, { duration: 0 })
        ),
        -1, false
      );
      haloOpacity.value = withRepeat(
        withSequence(
          withTiming(0.35, { duration: 600 }),
          withTiming(0,    { duration: 1200 })
        ),
        -1, false
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
      haloOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [status.playing]);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    }
    return () => { player.remove(); };
  }, []);

  useEffect(() => {
    if (status.playing && !playCountedRef.current && meditation && isAuthenticated) {
      playCountedRef.current = true;
      playedMutation.mutate({ meditationDbId: meditation.id });
    }
  }, [status.playing, meditation, isAuthenticated]);

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

  function seekBackward() { player.seekTo(Math.max(0, status.currentTime - 15)); }
  function seekForward()  { player.seekTo(Math.min(status.duration, status.currentTime + 15)); }

  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;
  const categoryInfo = categories.find(c => c.slug === meditation?.categorySlug);
  const coverGradient = CATEGORY_COLORS[meditation?.categorySlug ?? ''] ?? ['#1A0A2E', '#302B63'];
  const tags: string[] = meditation?.tags ? JSON.parse(meditation.tags) : [];

  const similar = useMemo(() =>
    allMeds.filter(m => m.categorySlug === meditation?.categorySlug && m.id !== meditation?.id).slice(0, 6),
    [allMeds, meditation]
  );

  // ── États de chargement / erreur ──────────────────────────────────────────
  if (loadingMed) {
    return (
      <View style={styles.root}>
        <StarField />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={styles.loadingText}>Chargement de la méditation...</Text>
        </View>
      </View>
    );
  }

  if (!meditation) {
    return (
      <View style={styles.root}>
        <StarField />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 32 }}>
          <Text style={{ fontSize: 48 }}>🔍</Text>
          <Text style={styles.notFoundTitle}>Méditation introuvable</Text>
          <Text style={styles.notFoundSub}>Cette méditation n'est pas disponible.</Text>
          <Pressable
            style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backBtnText}>Retour</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Rendu principal ───────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      {/* Fond étoilé */}
      <LinearGradient
        colors={[NIGHT_BG, NIGHT_MID, '#0F0B2E']}
        style={StyleSheet.absoluteFillObject}
      />
      <StarField />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Hero : pochette ──────────────────────────────────────────────── */}
        <View style={styles.heroSection}>
          {/* Boutons flottants */}
          <Pressable
            style={({ pressed }) => [styles.floatBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.back()}
          >
            <IconSymbol name="xmark" size={16} color={WHITE_SOFT} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.floatBtnRight, { opacity: pressed ? 0.7 : 1 }]}
            onPress={async () => {
              if (isAuthenticated) {
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

          {/* Pochette glassmorphisme */}
          <View style={styles.coverWrapper}>
            {/* Halo extérieur */}
            <View style={styles.coverHaloOuter} />
            <LinearGradient
              colors={[...coverGradient, 'rgba(212,168,83,0.08)']}
              style={styles.coverGlass}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
            >
              <Text style={styles.coverEmoji}>{categoryInfo?.emoji ?? '🧘'}</Text>
            </LinearGradient>
            {/* Reflet doré en bas */}
            <View style={styles.coverReflect} />
          </View>

          {/* Titre & catégorie */}
          <View style={styles.titleBlock}>
            <Text style={styles.categoryLabel}>
              {categoryInfo?.name ?? meditation.categorySlug}
              {meditation.instructor ? `  ·  ${meditation.instructor}` : ''}
            </Text>
            <Text style={styles.meditationTitle} numberOfLines={2}>{meditation.title}</Text>
            {meditation.subtitle && (
              <Text style={styles.meditationSubtitle}>{meditation.subtitle}</Text>
            )}
          </View>
        </View>

        {/* ── Contenu ──────────────────────────────────────────────────────── */}
        <View style={styles.content}>

          {/* Tags */}
          {tags.length > 0 && (
            <View style={styles.tags}>
              {tags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Description */}
          {meditation.description ? (
            <Text style={styles.description}>{meditation.description}</Text>
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
            <View style={styles.lockedPlayer}>
              <Text style={{ fontSize: 36 }}>🔒</Text>
              <Text style={styles.lockedTitle}>Contenu Premium</Text>
              <Text style={styles.lockedSub}>
                Débloquez toutes les méditations avec un abonnement Premium.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.unlockButton, { opacity: pressed ? 0.85 : 1 }]}
                onPress={() => router.back()}
              >
                <Text style={styles.unlockButtonText}>Découvrir Premium</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.player}>
              {/* Waveform dorée */}
              <View style={styles.waveform}>
                {Array.from({ length: 30 }).map((_, i) => {
                  const h = status.playing
                    ? 6 + Math.abs(Math.sin((i + Date.now() / 400) * 0.9)) * 22
                    : 3 + (i % 4) * 5;
                  const active = i / 30 <= progress;
                  return (
                    <View
                      key={i}
                      style={[
                        styles.waveBar,
                        {
                          height: h,
                          backgroundColor: active ? GOLD : LAVENDER_DIM,
                          opacity: status.playing ? 1 : 0.6,
                        },
                      ]}
                    />
                  );
                })}
              </View>

              {/* Barre de progression */}
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
                  <View style={[styles.progressThumb, { left: `${Math.max(0, Math.min(98, progress * 100 - 1))}%` as any }]} />
                </View>
                <View style={styles.timeRow}>
                  <Text style={styles.timeText}>
                    {status.duration > 0 ? formatTime(status.currentTime) : '0:00'}
                  </Text>
                  <Text style={styles.timeText}>
                    {status.duration > 0
                      ? formatTime(status.duration)
                      : formatTime(meditation.audioDurationSeconds)}
                  </Text>
                </View>
              </View>

              {/* Contrôles */}
              <View style={styles.controls}>
                {/* Reculer 15s */}
                <Pressable
                  style={({ pressed }) => [styles.seekBtn, { opacity: pressed ? 0.6 : 1 }]}
                  onPress={seekBackward}
                >
                  <IconSymbol name="backward.fill" size={24} color={LAVENDER} />
                  <Text style={styles.seekLabel}>15</Text>
                </Pressable>

                {/* Bouton play principal */}
                <View style={styles.playBtnWrapper}>
                  {/* Halo animé */}
                  <Animated.View style={[styles.playHalo, haloStyle]} />
                  <Animated.View style={pulseStyle}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.playButton,
                        { opacity: pressed ? 0.9 : 1 },
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
                          size={32}
                          color={NIGHT_BG}
                        />
                      </LinearGradient>
                    </Pressable>
                  </Animated.View>
                </View>

                {/* Avancer 15s */}
                <Pressable
                  style={({ pressed }) => [styles.seekBtn, { opacity: pressed ? 0.6 : 1 }]}
                  onPress={seekForward}
                >
                  <IconSymbol name="forward.fill" size={24} color={LAVENDER} />
                  <Text style={styles.seekLabel}>15</Text>
                </Pressable>
              </View>

              {/* Hint */}
              <Text style={styles.playerHint}>
                {status.playing
                  ? '✦  Méditation en cours  ✦'
                  : isPlaceholderAudio
                  ? 'Script disponible ci-dessous'
                  : 'Appuyez pour commencer'}
              </Text>
            </View>
          )}

          {/* ── Script de méditation ─────────────────────────────────────── */}
          {meditation.scriptText && (
            <View style={styles.scriptContainer}>
              <View style={styles.scriptHeader}>
                <Text style={styles.scriptTitleIcon}>📖</Text>
                <Text style={styles.scriptTitle}>Script de méditation</Text>
              </View>
              <Text style={styles.scriptText}>{meditation.scriptText}</Text>
            </View>
          )}

          {/* ── Méditations similaires ───────────────────────────────────── */}
          {similar.length > 0 && (
            <View style={styles.similarSection}>
              <Text style={styles.similarTitle}>Dans la même catégorie</Text>
              <FlatList
                horizontal
                data={similar}
                keyExtractor={item => String(item.id)}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
                renderItem={({ item: sim }) => {
                  const simCat = categories.find(c => c.slug === sim.categorySlug);
                  const simGrad = CATEGORY_COLORS[sim.categorySlug] ?? ['#1A0A2E', '#302B63'];
                  return (
                    <Pressable
                      style={({ pressed }) => [styles.simCard, { opacity: pressed ? 0.85 : 1 }]}
                      onPress={() => router.replace(`/meditation/${sim.slug}` as never)}
                    >
                      <LinearGradient colors={simGrad} style={styles.simCover}>
                        <Text style={styles.simEmoji}>{simCat?.emoji ?? '🧘'}</Text>
                      </LinearGradient>
                      <View style={styles.simInfo}>
                        <Text style={styles.simCatLabel} numberOfLines={1}>
                          {simCat?.name ?? sim.categorySlug}
                        </Text>
                        <Text style={styles.simCardTitle} numberOfLines={2}>{sim.title}</Text>
                        <Text style={styles.simDuration}>
                          {Math.round(sim.audioDurationSeconds / 60)} min
                        </Text>
                      </View>
                    </Pressable>
                  );
                }}
              />
            </View>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: NIGHT_BG,
  },
  scroll: { paddingBottom: 0 },

  // Loading / erreur
  loadingText: { color: LAVENDER, fontSize: 14, letterSpacing: 0.3 },
  notFoundTitle: { fontFamily: 'CormorantGaramond-Medium', fontSize: 22, color: WHITE_SOFT, textAlign: 'center' },
  notFoundSub: { fontSize: 13, color: LAVENDER, textAlign: 'center', lineHeight: 20 },
  backBtn: {
    marginTop: 8, paddingHorizontal: 28, paddingVertical: 12,
    borderRadius: 999, backgroundColor: GOLD_SOFT,
    borderWidth: 0.5, borderColor: 'rgba(212,168,83,0.4)',
  },
  backBtnText: { color: GOLD, fontWeight: '600', fontSize: 14 },

  // Hero
  heroSection: {
    paddingTop: 56,
    paddingBottom: 32,
    alignItems: 'center',
    position: 'relative',
  },
  floatBtn: {
    position: 'absolute', top: 52, left: 20,
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: GLASS_BG, borderWidth: 0.5, borderColor: GLASS_BORDER,
    alignItems: 'center', justifyContent: 'center',
  },
  floatBtnRight: {
    position: 'absolute', top: 52, right: 20,
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: GLASS_BG, borderWidth: 0.5, borderColor: GLASS_BORDER,
    alignItems: 'center', justifyContent: 'center',
  },

  // Pochette
  coverWrapper: {
    width: 200, height: 200,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
  },
  coverHaloOuter: {
    position: 'absolute',
    width: 220, height: 220,
    borderRadius: 110,
    backgroundColor: GOLD_GLOW,
    shadowColor: GOLD,
    shadowRadius: 40,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
  },
  coverGlass: {
    width: 190, height: 190,
    borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: 'rgba(212,168,83,0.25)',
    overflow: 'hidden',
  },
  coverEmoji: { fontSize: 80 },
  coverReflect: {
    position: 'absolute',
    bottom: 0,
    width: 190,
    height: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    backgroundColor: 'rgba(212,168,83,0.06)',
  },

  // Titre
  titleBlock: { alignItems: 'center', paddingHorizontal: 24, gap: 6 },
  categoryLabel: {
    fontSize: 10, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 1.2, color: GOLD,
  },
  meditationTitle: {
    fontFamily: 'CormorantGaramond-Medium',
    fontSize: 28, color: WHITE_SOFT,
    textAlign: 'center', lineHeight: 34,
  },
  meditationSubtitle: {
    fontSize: 13, color: LAVENDER,
    textAlign: 'center', letterSpacing: 0.3,
  },

  // Contenu
  content: { paddingHorizontal: 20 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag: {
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5,
    backgroundColor: GOLD_SOFT, borderWidth: 0.5, borderColor: 'rgba(212,168,83,0.3)',
  },
  tagText: { fontSize: 11, color: GOLD, fontWeight: '500', letterSpacing: 0.3 },
  description: {
    fontSize: 14, color: LAVENDER, lineHeight: 22,
    marginBottom: 20, letterSpacing: 0.2,
  },

  // Bannière complétion
  completionBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 16, padding: 16, marginBottom: 20,
    backgroundColor: 'rgba(74,222,128,0.08)',
    borderWidth: 0.5, borderColor: 'rgba(74,222,128,0.25)',
  },
  completionText: {
    flex: 1, fontSize: 13, color: '#4ADE80',
    fontWeight: '500', lineHeight: 18,
  },

  // Lecteur verrouillé
  lockedPlayer: {
    borderRadius: 24, padding: 32, marginBottom: 24,
    backgroundColor: GLASS_BG, borderWidth: 0.5, borderColor: GLASS_BORDER,
    alignItems: 'center', gap: 12,
  },
  lockedTitle: {
    fontFamily: 'CormorantGaramond-Medium',
    fontSize: 22, color: WHITE_SOFT,
  },
  lockedSub: { fontSize: 13, color: LAVENDER, textAlign: 'center', lineHeight: 20 },
  unlockButton: {
    marginTop: 8, paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 999, backgroundColor: GOLD,
  },
  unlockButtonText: { color: NIGHT_BG, fontWeight: '700', fontSize: 14, letterSpacing: 0.3 },

  // Lecteur actif
  player: {
    borderRadius: 24, padding: 24, marginBottom: 24,
    backgroundColor: GLASS_BG, borderWidth: 0.5, borderColor: GLASS_BORDER,
  },
  waveform: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 3, height: 44, marginBottom: 20,
  },
  waveBar: { width: 3, borderRadius: 2 },
  progressContainer: { marginBottom: 24 },
  progressTrack: {
    height: 3, borderRadius: 2,
    backgroundColor: LAVENDER_DIM,
    position: 'relative',
  },
  progressFill: {
    height: 3, borderRadius: 2,
    backgroundColor: GOLD,
    position: 'absolute', top: 0, left: 0,
  },
  progressThumb: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: GOLD,
    position: 'absolute', top: -4.5,
    shadowColor: GOLD, shadowRadius: 6, shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
  },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  timeText: { fontSize: 11, color: LAVENDER, letterSpacing: 0.3 },

  // Contrôles
  controls: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 36, marginBottom: 16,
  },
  seekBtn: { alignItems: 'center', gap: 3 },
  seekLabel: { fontSize: 9, color: LAVENDER, letterSpacing: 0.3 },
  playBtnWrapper: {
    width: 80, height: 80,
    alignItems: 'center', justifyContent: 'center',
  },
  playHalo: {
    position: 'absolute',
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: GOLD_GLOW,
  },
  playButton: {
    width: 76, height: 76, borderRadius: 38,
    overflow: 'hidden',
    shadowColor: GOLD, shadowRadius: 16, shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  playButtonGradient: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  playButtonDisabled: { opacity: 0.4 },
  playerHint: {
    textAlign: 'center', fontSize: 11,
    color: LAVENDER, letterSpacing: 0.8,
  },

  // Script
  scriptContainer: {
    borderRadius: 20, padding: 20, marginTop: 8, marginBottom: 24,
    backgroundColor: GLASS_BG, borderWidth: 0.5, borderColor: GLASS_BORDER,
  },
  scriptHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  scriptTitleIcon: { fontSize: 16 },
  scriptTitle: {
    fontFamily: 'CormorantGaramond-Medium',
    fontSize: 18, color: WHITE_SOFT,
  },
  scriptText: {
    fontSize: 14, color: LAVENDER,
    lineHeight: 24, letterSpacing: 0.2,
  },

  // Similaires
  similarSection: { marginTop: 8, marginBottom: 8 },
  similarTitle: {
    fontFamily: 'CormorantGaramond-Medium',
    fontSize: 18, color: WHITE_SOFT,
    marginBottom: 14,
  },
  simCard: {
    borderRadius: 16, overflow: 'hidden', width: 152,
    backgroundColor: GLASS_BG, borderWidth: 0.5, borderColor: GLASS_BORDER,
  },
  simCover: { height: 84, justifyContent: 'center', alignItems: 'center' },
  simEmoji: { fontSize: 30 },
  simInfo: { padding: 10 },
  simCatLabel: {
    fontSize: 9, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 0.8, color: GOLD, marginBottom: 3,
  },
  simCardTitle: {
    fontSize: 12, fontWeight: '500', color: WHITE_SOFT,
    lineHeight: 16, marginBottom: 4,
  },
  simDuration: { fontSize: 10, color: LAVENDER },
});
