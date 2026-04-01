import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing,
} from 'react-native-reanimated';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useUser } from '@/lib/user-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PremiumBadge } from '@/components/ui/premium-badge';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';

// Couleurs de fallback par catégorie
const CATEGORY_COLORS: Record<string, string> = {
  stress: '#7C3AED',
  sleep: '#1E1B4B',
  focus: '#D97706',
  'self-love': '#BE185D',
  morning: '#F59E0B',
  breathing: '#0EA5E9',
  gratitude: '#EC4899',
  'body-scan': '#6D28D9',
};

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MeditationPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { profile } = useUser();
  const { isAuthenticated } = useAuth();

  // Charger la méditation depuis la DB via son slug
  const { data: meditation, isLoading: loadingMed } = trpc.catalog.get.useQuery(
    { slug: id ?? '' },
    { enabled: !!id }
  );

  // Charger les catégories pour afficher le nom
  const { data: categories = [] } = trpc.catalog.categories.useQuery();

  // Backend mutations
  const completeSessionMutation = trpc.sessions.complete.useMutation();
  const toggleFavMutation = trpc.favorites.toggle.useMutation();
  const playedMutation = trpc.catalog.played.useMutation();
  const { data: favList = [], refetch: refetchFavs } = trpc.favorites.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const isLocked = meditation?.isPremium && !profile?.isPremium;
  const isFav = meditation ? favList.includes(String(meditation.id)) : false;
  const [hasCompleted, setHasCompleted] = useState(false);
  const completedRef = useRef(false);
  const playCountedRef = useRef(false);

  useKeepAwake();

  // Vérifier si un audio réel est disponible
  const hasAudio = !!(meditation?.audioUrl && meditation.audioUrl.trim() !== '');
  const audioSource = hasAudio ? { uri: meditation!.audioUrl! } : null;

  const player = useAudioPlayer(audioSource ?? { uri: '' });
  const status = useAudioPlayerStatus(player);

  // Animation pulsante
  const pulseScale = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  useEffect(() => {
    if (status.playing) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1, false
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
    }
  }, [status.playing]);

  // Configurer l'audio mode
  useEffect(() => {
    if (Platform.OS !== 'web') {
      setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    }
    return () => { player.remove(); };
  }, []);

  // Incrémenter le compteur de lectures au démarrage
  useEffect(() => {
    if (status.playing && !playCountedRef.current && meditation && isAuthenticated) {
      playCountedRef.current = true;
      playedMutation.mutate({ meditationDbId: meditation.id });
    }
  }, [status.playing, meditation, isAuthenticated]);

  // Détecter la complétion
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
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (status.playing) {
      player.pause();
    } else {
      if (status.currentTime >= status.duration - 1 && status.duration > 0) {
        player.seekTo(0);
      }
      player.play();
    }
  }

  function seekBackward() {
    player.seekTo(Math.max(0, status.currentTime - 15));
  }

  function seekForward() {
    player.seekTo(Math.min(status.duration, status.currentTime + 15));
  }

  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;
  const categoryInfo = categories.find(c => c.slug === meditation?.categorySlug);
  const coverColor = meditation?.coverColor ?? CATEGORY_COLORS[meditation?.categorySlug ?? ''] ?? '#7C3AED';
  const tags: string[] = meditation?.tags ? JSON.parse(meditation.tags) : [];

  // État de chargement
  if (loadingMed) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.muted }}>Chargement de la méditation...</Text>
        </View>
      </ScreenContainer>
    );
  }

  // Méditation introuvable
  if (!meditation) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Text style={{ fontSize: 40 }}>🔍</Text>
          <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: '700' }}>Méditation introuvable</Text>
          <Text style={{ color: colors.muted, textAlign: 'center' }}>
            Cette méditation n'est pas disponible.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.backBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
            onPress={() => router.back()}
          >
            <Text style={{ color: '#FFF', fontWeight: '700' }}>Retour</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover colorée */}
        <View style={[styles.coverContainer, { backgroundColor: coverColor }]}>
          <View style={styles.coverContent}>
            <Text style={styles.coverEmoji}>{categoryInfo?.emoji ?? '🧘'}</Text>
          </View>
          <LinearGradient
            colors={['transparent', colors.background]}
            style={styles.coverGradient}
          />
          <Pressable
            style={({ pressed }) => [styles.closeButton, { backgroundColor: `${colors.background}CC`, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.back()}
          >
            <IconSymbol name="xmark" size={18} color={colors.foreground} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.favButton, { backgroundColor: `${colors.background}CC`, opacity: pressed ? 0.7 : 1 }]}
            onPress={async () => {
              if (isAuthenticated) {
                await toggleFavMutation.mutateAsync({ meditationId: String(meditation.id) });
                refetchFavs();
              }
            }}
          >
            <IconSymbol name={isFav ? 'heart.fill' : 'heart'} size={20} color={isFav ? '#F43F5E' : colors.foreground} />
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* Meta */}
          <View style={styles.metaRow}>
            <Text style={[styles.category, { color: colors.primary }]}>
              {categoryInfo?.name ?? meditation.categorySlug}
            </Text>
            <Text style={[styles.dot, { color: colors.muted }]}>·</Text>
            <Text style={[styles.duration, { color: colors.muted }]}>
              {Math.round(meditation.audioDurationSeconds / 60)} min
            </Text>
            <Text style={[styles.dot, { color: colors.muted }]}>·</Text>
            <Text style={[styles.duration, { color: colors.muted }]}>{meditation.instructor}</Text>
            {meditation.isPremium && <PremiumBadge small />}
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>{meditation.title}</Text>
          {meditation.subtitle && (
            <Text style={[styles.subtitle, { color: colors.primary }]}>{meditation.subtitle}</Text>
          )}
          <Text style={[styles.description, { color: colors.muted }]}>
            {meditation.description ?? ''}
          </Text>

          {/* Tags */}
          {tags.length > 0 && (
            <View style={styles.tags}>
              {tags.map((tag) => (
                <View key={tag} style={[styles.tag, { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}30` }]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Bannière de complétion */}
          {hasCompleted && (
            <View style={[styles.completionBanner, { backgroundColor: `${colors.success}15`, borderColor: `${colors.success}30` }]}>
              <Text style={styles.completionEmoji}>🎉</Text>
              <Text style={[styles.completionText, { color: colors.success }]}>
                Félicitations ! Vous avez terminé cette méditation.
              </Text>
            </View>
          )}

          {/* Lecteur */}
          {isLocked ? (
            <View style={[styles.lockedPlayer, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}20` }]}>
              <Text style={{ fontSize: 32 }}>🔒</Text>
              <Text style={[styles.lockedTitle, { color: colors.foreground }]}>Contenu Premium</Text>
              <Text style={[styles.lockedSub, { color: colors.muted }]}>
                Débloquez toutes les méditations avec un abonnement Premium.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.unlockButton, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
                onPress={() => router.back()}
              >
                <Text style={styles.unlockButtonText}>Découvrir Premium</Text>
              </Pressable>
            </View>
          ) : (
            <View style={[styles.player, { backgroundColor: colors.surface }]}>
              {/* Visualisation waveform */}
              <View style={styles.waveform}>
                {Array.from({ length: 28 }).map((_, i) => {
                  const height = status.playing
                    ? 8 + Math.abs(Math.sin((i + Date.now() / 300) * 0.8)) * 24
                    : 4 + (i % 3) * 6;
                  return (
                    <View
                      key={i}
                      style={[
                        styles.waveBar,
                        {
                          height,
                          backgroundColor: i / 28 <= progress ? colors.primary : colors.border,
                          opacity: status.playing ? 1 : 0.5,
                        },
                      ]}
                    />
                  );
                })}
              </View>

              {/* Barre de progression */}
              <View style={styles.progressContainer}>
                <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                  <View
                    style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress * 100}%` }]}
                  />
                  <View
                    style={[
                      styles.progressThumb,
                      { backgroundColor: colors.primary, left: `${Math.max(0, Math.min(100, progress * 100 - 1))}%` },
                    ]}
                  />
                </View>
                <View style={styles.timeRow}>
                  <Text style={[styles.timeText, { color: colors.muted }]}>
                    {status.duration > 0 ? formatTime(status.currentTime) : '0:00'}
                  </Text>
                  <Text style={[styles.timeText, { color: colors.muted }]}>
                    {status.duration > 0
                      ? formatTime(status.duration)
                      : formatTime(meditation.audioDurationSeconds)}
                  </Text>
                </View>
              </View>

              {/* Contrôles */}
              <View style={styles.controls}>
                <Pressable
                  style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                  onPress={seekBackward}
                >
                  <IconSymbol name="backward.fill" size={28} color={colors.foreground} />
                </Pressable>

                <Animated.View style={pulseStyle}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.playButton,
                      { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                    ]}
                    onPress={togglePlay}
                  >
                    <IconSymbol
                      name={status.playing ? 'pause.fill' : 'play.fill'}
                      size={30}
                      color="#FFFFFF"
                    />
                  </Pressable>
                </Animated.View>

                <Pressable
                  style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                  onPress={seekForward}
                >
                  <IconSymbol name="forward.fill" size={28} color={colors.foreground} />
                </Pressable>
              </View>

              <Text style={[styles.playerHint, { color: colors.muted }]}>
                {status.playing
                  ? '✨ Méditation en cours...'
                  : hasAudio
                  ? 'Appuyez pour commencer'
                  : '🎵 Audio bientôt disponible'}
              </Text>
            </View>
          )}

          {/* Message si aucun audio assigné */}
          {!hasAudio && (
            <View style={[styles.scriptContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.scriptTitle, { color: colors.foreground }]}>🎵 Audio en cours de préparation</Text>
              <Text style={[styles.scriptText, { color: colors.muted }]}>Ce contenu audio sera bientôt disponible. Revenez prochainement pour écouter cette méditation guidée.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999 },
  coverContainer: { position: 'relative', height: 280, justifyContent: 'center', alignItems: 'center' },
  coverContent: { alignItems: 'center', justifyContent: 'center' },
  coverEmoji: { fontSize: 72 },
  coverGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 },
  closeButton: {
    position: 'absolute', top: 52, left: 20,
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  favButton: {
    position: 'absolute', top: 52, right: 20,
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 8 },
  category: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  dot: { fontSize: 12 },
  duration: { fontSize: 12 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  description: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  tag: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1 },
  tagText: { fontSize: 12 },
  completionBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 20,
  },
  completionEmoji: { fontSize: 24 },
  completionText: { flex: 1, fontSize: 14, fontWeight: '600' },
  lockedPlayer: {
    borderRadius: 20, padding: 28, borderWidth: 1,
    alignItems: 'center', gap: 12, marginBottom: 20,
  },
  lockedTitle: { fontSize: 20, fontWeight: '800' },
  lockedSub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  unlockButton: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 999, marginTop: 8 },
  unlockButtonText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  player: { borderRadius: 20, padding: 20, marginBottom: 20 },
  waveform: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, height: 40, marginBottom: 16 },
  waveBar: { width: 3, borderRadius: 2 },
  progressContainer: { marginBottom: 20 },
  progressTrack: { height: 4, borderRadius: 2, position: 'relative' },
  progressFill: { height: 4, borderRadius: 2, position: 'absolute', top: 0, left: 0 },
  progressThumb: {
    width: 14, height: 14, borderRadius: 7,
    position: 'absolute', top: -5,
  },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  timeText: { fontSize: 12 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32, marginBottom: 16 },
  playButton: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  playerHint: { textAlign: 'center', fontSize: 13 },
  scriptContainer: {
    borderRadius: 16, padding: 20, borderWidth: 1, marginTop: 8,
  },
  scriptTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  scriptText: { fontSize: 14, lineHeight: 22 },
});
