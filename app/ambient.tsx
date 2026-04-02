import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AMBIENT_SOUNDS } from '@/lib/mock-data';

type SoundState = {
  id: string;
  player: AudioPlayer | null;
  volume: number;
  isPlaying: boolean;
};

const TIMER_OPTIONS = [
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '20 min', value: 20 },
  { label: '30 min', value: 30 },
  { label: '∞', value: 0 },
];

const SOUND_GRADIENTS: Record<string, string[]> = {
  rain: ['#1E3A5F', '#2563EB'],
  forest: ['#14532D', '#16A34A'],
  ocean: ['#0C4A6E', '#0EA5E9'],
  fire: ['#7C2D12', '#EA580C'],
  wind: ['#374151', '#6B7280'],
  birds: ['#3B0764', '#7C3AED'],
};

export default function AmbientScreen() {
  const colors = useColors();
  const [sounds, setSounds] = useState<SoundState[]>(
    AMBIENT_SOUNDS.map((s) => ({ id: s.id, player: null, volume: 0.7, isPlaying: false }))
  );
  const [selectedTimer, setSelectedTimer] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useKeepAwake();

  const hasAnyPlaying = sounds.some((s) => s.isPlaying);

  // Pulse animation for playing indicator
  const pulseAnim = useSharedValue(1);
  useEffect(() => {
    if (hasAnyPlaying) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      pulseAnim.value = withTiming(1, { duration: 400 });
    }
  }, [hasAnyPlaying]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    }
    return () => {
      // Cleanup all players on unmount
      sounds.forEach((s) => {
        if (s.player) {
          try { s.player.pause(); s.player.remove(); } catch (_) {}
        }
      });
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            setTimerRunning(false);
            stopAll();
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  async function toggleSound(soundId: string) {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const soundDef = AMBIENT_SOUNDS.find((s) => s.id === soundId);
    if (!soundDef) return;

    setSounds((prev) =>
      prev.map((s) => {
        if (s.id !== soundId) return s;

        if (s.isPlaying) {
          // Stop
          if (s.player) {
            try { s.player.pause(); } catch (_) {}
          }
          return { ...s, isPlaying: false };
        } else {
          // Start
          try {
            let player = s.player;
            if (!player) {
              player = createAudioPlayer({ uri: soundDef.url });
              player.loop = true;
              player.volume = s.volume;
            }
            player.play();
            return { ...s, player, isPlaying: true };
          } catch (e) {
            console.warn('Audio error:', e);
            return s;
          }
        }
      })
    );
  }

  function stopAll() {
    setSounds((prev) =>
      prev.map((s) => {
        if (s.player && s.isPlaying) {
          try { s.player.pause(); } catch (_) {}
        }
        return { ...s, isPlaying: false };
      })
    );
  }

  function startTimer() {
    if (selectedTimer === 0) return;
    setTimeLeft(selectedTimer * 60);
    setTimerRunning(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  function stopTimer() {
    setTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function formatTimer(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={22} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.title, { color: colors.foreground }]}>Sons d'ambiance</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Créez votre atmosphère idéale</Text>
          </View>
          {hasAnyPlaying && (
            <Pressable
              style={({ pressed }) => [styles.stopAllBtn, { backgroundColor: `${colors.error}15`, opacity: pressed ? 0.7 : 1 }]}
              onPress={stopAll}
            >
              <Text style={[styles.stopAllText, { color: colors.error }]}>Tout arrêter</Text>
            </Pressable>
          )}
        </View>

        {/* Now playing indicator */}
        {hasAnyPlaying && (
          <Animated.View style={[styles.playingBanner, { backgroundColor: `${colors.primary}15` }, pulseStyle]}>
            <View style={[styles.playingDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.playingText, { color: colors.primary }]}>
              {sounds.filter((s) => s.isPlaying).length} son{sounds.filter((s) => s.isPlaying).length > 1 ? 's' : ''} en lecture
            </Text>
          </Animated.View>
        )}

        {/* Sound grid */}
        <View style={styles.grid}>
          {AMBIENT_SOUNDS.map((sound) => {
            const state = sounds.find((s) => s.id === sound.id);
            const isPlaying = state?.isPlaying || false;
            const gradient = SOUND_GRADIENTS[sound.id] || ['#374151', '#6B7280'];

            return (
              <Pressable
                key={sound.id}
                style={({ pressed }) => [styles.soundCard, { opacity: pressed ? 0.85 : 1 }]}
                onPress={() => toggleSound(sound.id)}
              >
                <LinearGradient
                  colors={gradient as [string, string]}
                  style={[styles.soundCardInner, isPlaying && styles.soundCardActive]}
                >
                  {isPlaying && (
                    <View style={styles.playingOverlay}>
                      <View style={styles.waveContainer}>
                        {[1, 2, 3, 4].map((i) => (
                          <Animated.View
                            key={i}
                            style={[styles.waveLine, { height: 8 + i * 4, backgroundColor: 'rgba(255,255,255,0.6)' }]}
                          />
                        ))}
                      </View>
                    </View>
                  )}
                  <Text style={styles.soundEmoji}>{sound.emoji}</Text>
                  <Text style={styles.soundLabel}>{sound.label}</Text>
                  {isPlaying && (
                    <View style={styles.activeIndicator}>
                      <Text style={styles.activeText}>▶ En lecture</Text>
                    </View>
                  )}
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>

        {/* Timer section */}
        <View style={[styles.timerCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.timerTitle, { color: colors.foreground }]}>⏱️ Minuteur de sommeil</Text>
          <Text style={[styles.timerSubtitle, { color: colors.muted }]}>
            Les sons s'arrêteront automatiquement
          </Text>

          {timerRunning ? (
            <View style={styles.timerRunning}>
              <Text style={[styles.timerCountdown, { color: colors.primary }]}>{formatTimer(timeLeft)}</Text>
              <Pressable
                style={({ pressed }) => [styles.timerStopBtn, { backgroundColor: `${colors.error}20`, opacity: pressed ? 0.7 : 1 }]}
                onPress={stopTimer}
              >
                <Text style={[styles.timerStopText, { color: colors.error }]}>Annuler</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.timerOptions}>
                {TIMER_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={({ pressed }) => [
                      styles.timerOption,
                      {
                        backgroundColor: selectedTimer === opt.value ? colors.primary : colors.border,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                    onPress={() => setSelectedTimer(opt.value)}
                  >
                    <Text style={[styles.timerOptionText, { color: selectedTimer === opt.value ? '#FFFFFF' : colors.muted }]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {selectedTimer > 0 && (
                <Pressable
                  style={({ pressed }) => [styles.startTimerBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
                  onPress={startTimer}
                >
                  <Text style={styles.startTimerText}>Démarrer le minuteur</Text>
                </Pressable>
              )}
            </>
          )}
        </View>

        {/* Tips */}
        <View style={[styles.tipsCard, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}20` }]}>
          <Text style={[styles.tipsTitle, { color: colors.foreground }]}>💡 Conseils</Text>
          <Text style={[styles.tipText, { color: colors.muted }]}>
            Combinez plusieurs sons pour créer votre atmosphère unique. La pluie + forêt crée un environnement particulièrement apaisant.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Palette SomnioPax v3 ────────────────────────────────────────────────
const AM_GOLD    = '#C9A84C';
const AM_WHITE   = '#EDE9FF';
const AM_LAV     = 'rgba(184,174,255,0.55)';
const AM_LAV_DIM = 'rgba(184,174,255,0.35)';
const AM_BORDER  = 'rgba(180,160,255,0.12)';
const AM_GLASS   = 'rgba(255,255,255,0.04)';

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, marginBottom: 20 },
  title: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 22, color: AM_WHITE },
  subtitle: { fontSize: 14, marginTop: 2, color: AM_LAV },
  stopAllBtn: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  stopAllText: { fontSize: 12, fontWeight: '600', color: '#F87171' },
  playingBanner: { borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, backgroundColor: 'rgba(201,168,76,0.08)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.18)' },
  playingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: AM_GOLD },
  playingText: { fontSize: 13, fontWeight: '600', color: AM_GOLD },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  soundCard: { width: '47%' },
  soundCardInner: { borderRadius: 18, padding: 16, minHeight: 110, justifyContent: 'flex-end', overflow: 'hidden', backgroundColor: AM_GLASS, borderWidth: 1, borderColor: AM_BORDER },
  soundCardActive: { borderWidth: 1.5, borderColor: 'rgba(201,168,76,0.4)' },
  playingOverlay: { position: 'absolute', top: 10, right: 10 },
  waveContainer: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  waveLine: { width: 3, borderRadius: 2, backgroundColor: AM_GOLD },
  soundEmoji: { fontSize: 32, marginBottom: 6 },
  soundLabel: { color: AM_WHITE, fontSize: 14, fontWeight: '700' },
  activeIndicator: { marginTop: 6, backgroundColor: 'rgba(201,168,76,0.12)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)' },
  activeText: { color: AM_GOLD, fontSize: 10, fontWeight: '600' },
  timerCard: { borderRadius: 18, padding: 16, marginBottom: 14, backgroundColor: AM_GLASS, borderWidth: 1, borderColor: AM_BORDER },
  timerTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 16, color: AM_WHITE, marginBottom: 4 },
  timerSubtitle: { fontSize: 12, marginBottom: 14, color: AM_LAV },
  timerOptions: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  timerOption: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: AM_GLASS, borderWidth: 1, borderColor: AM_BORDER },
  timerOptionText: { fontSize: 13, fontWeight: '600', color: AM_LAV },
  startTimerBtn: { borderRadius: 999, paddingVertical: 12, alignItems: 'center', backgroundColor: AM_GOLD },
  startTimerText: { color: '#03020F', fontSize: 14, fontWeight: '800' },
  timerRunning: { alignItems: 'center', gap: 12 },
  timerCountdown: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 48, color: AM_WHITE },
  timerStopBtn: { borderRadius: 999, paddingHorizontal: 20, paddingVertical: 8, backgroundColor: AM_GLASS, borderWidth: 1, borderColor: AM_BORDER },
  timerStopText: { fontSize: 14, fontWeight: '600', color: AM_LAV },
  tipsCard: { borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)', backgroundColor: 'rgba(201,168,76,0.04)' },
  tipsTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 14, color: AM_GOLD, marginBottom: 6 },
  tipText: { fontSize: 13, lineHeight: 19, color: AM_LAV },
});
