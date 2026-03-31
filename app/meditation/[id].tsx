import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ScrollView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useUser } from '@/lib/user-context';
import { MEDITATIONS, CATEGORY_LABELS } from '@/lib/mock-data';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PremiumBadge } from '@/components/ui/premium-badge';

export default function MeditationPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { favorites, toggleFavorite, profile, addSessionHistory } = useUser();

  const meditation = MEDITATIONS.find((m) => m.id === id);
  const isLocked = meditation?.isPremium && !profile?.isPremium;
  const isFav = meditation ? favorites.includes(meditation.id) : false;
  const [hasCompleted, setHasCompleted] = useState(false);
  const completedRef = useRef(false);

  // Keep screen awake during playback
  useKeepAwake();

  // Audio player — use a fallback ambient URL if no specific audio
  const audioSource = meditation?.audioUrl
    ? { uri: meditation.audioUrl }
    : null;

  const player = useAudioPlayer(audioSource ?? { uri: '' });
  const status = useAudioPlayerStatus(player);

  // Pulsing animation for the play button
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
        -1,
        false
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
    }
  }, [status.playing]);

  // Set audio mode on mount
  useEffect(() => {
    if (Platform.OS !== 'web') {
      setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    }
    return () => {
      player.remove();
    };
  }, []);

  // Detect completion
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
    await addSessionHistory({ meditationId: meditation.id, duration: minutes || 1 });
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

  function formatTime(seconds: number) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;
  const totalSeconds = meditation ? meditation.duration * 60 : 0;

  if (!meditation) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.muted }}>Méditation introuvable</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: meditation.coverImage }} style={styles.coverImage} />
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
            onPress={() => toggleFavorite(meditation.id)}
          >
            <IconSymbol name={isFav ? 'heart.fill' : 'heart'} size={20} color={isFav ? '#F43F5E' : colors.foreground} />
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* Meta */}
          <View style={styles.metaRow}>
            <Text style={[styles.category, { color: colors.primary }]}>
              {CATEGORY_LABELS[meditation.category]}
            </Text>
            <Text style={[styles.dot, { color: colors.muted }]}>·</Text>
            <Text style={[styles.duration, { color: colors.muted }]}>{meditation.duration} min</Text>
            {meditation.isPremium && <PremiumBadge small />}
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>{meditation.title}</Text>
          <Text style={[styles.description, { color: colors.muted }]}>{meditation.description}</Text>

          {/* Tags */}
          <View style={styles.tags}>
            {meditation.tags.map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}30` }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Completion banner */}
          {hasCompleted && (
            <View style={[styles.completionBanner, { backgroundColor: `${colors.success}15`, borderColor: `${colors.success}30` }]}>
              <Text style={styles.completionEmoji}>🎉</Text>
              <Text style={[styles.completionText, { color: colors.success }]}>
                Félicitations ! Vous avez terminé cette méditation.
              </Text>
            </View>
          )}

          {/* Player */}
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
              {/* Waveform visual */}
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
                          height: height,
                          backgroundColor: i / 28 <= progress ? colors.primary : colors.border,
                          opacity: status.playing ? 1 : 0.5,
                        },
                      ]}
                    />
                  );
                })}
              </View>

              {/* Progress bar */}
              <View style={styles.progressContainer}>
                <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                  <View
                    style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress * 100}%` }]}
                  />
                  {/* Thumb */}
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
                    {status.duration > 0 ? formatTime(status.duration) : formatTime(totalSeconds)}
                  </Text>
                </View>
              </View>

              {/* Controls */}
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
                  : audioSource
                  ? 'Appuyez pour commencer'
                  : 'Audio disponible sur appareil mobile'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  coverContainer: { position: 'relative', height: 280 },
  coverImage: { width: '100%', height: '100%' },
  coverGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 },
  closeButton: { position: 'absolute', top: 52, left: 20, width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  favButton: { position: 'absolute', top: 52, right: 20, width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 8 },
  category: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  dot: { fontSize: 12 },
  duration: { fontSize: 12 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 10 },
  description: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  tag: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1 },
  tagText: { fontSize: 12 },
  completionBanner: { borderRadius: 14, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  completionEmoji: { fontSize: 24 },
  completionText: { flex: 1, fontSize: 14, fontWeight: '600' },
  player: { borderRadius: 20, padding: 20 },
  waveform: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, height: 40, marginBottom: 16 },
  waveBar: { width: 3, borderRadius: 2, minHeight: 4 },
  progressContainer: { marginBottom: 24 },
  progressTrack: { height: 4, borderRadius: 2, marginBottom: 8, overflow: 'visible', position: 'relative' },
  progressFill: { height: '100%', borderRadius: 2 },
  progressThumb: { position: 'absolute', top: -5, width: 14, height: 14, borderRadius: 7, marginLeft: -7 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timeText: { fontSize: 12 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32, marginBottom: 16 },
  playButton: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', shadowColor: '#C084FC', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  playerHint: { fontSize: 12, textAlign: 'center' },
  lockedPlayer: { borderRadius: 20, padding: 24, borderWidth: 1, alignItems: 'center', gap: 10 },
  lockedTitle: { fontSize: 18, fontWeight: '700' },
  lockedSub: { fontSize: 13, lineHeight: 18, textAlign: 'center' },
  unlockButton: { borderRadius: 999, paddingVertical: 13, paddingHorizontal: 28, marginTop: 8 },
  unlockButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
