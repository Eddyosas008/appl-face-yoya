import React, { useState, useEffect, useRef, useMemo} from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { ScreenContainer } from '@/components/screen-container';
import { StarField } from '@/components/star-field';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AMBIENT_SOUNDS } from '@/lib/mock-data';
import { trpc } from '@/lib/trpc';
import { useThemeContext } from '@/lib/theme-provider';

// Type unifié pour un son ambiant (DB ou local)
type AmbientSoundDef = {
  id: string;
  label: string;
  emoji: string;
  url: string | null;
};

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
  const { isDark } = useThemeContext();
  const styles = useMemo(() => makeStyles(isDark), [isDark]);

  // Palette dynamique
  const AM_GOLD    = isDark ? '#C8A96E' : '#8B6914';
  const AM_WHITE   = isDark ? '#EDE8DC' : '#1C1410';
  const AM_LAV     = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(80,60,140,0.70)';
  const AM_BORDER  = isDark ? 'rgba(200,169,110,0.40)' : 'rgba(120,100,180,0.18)';
  const AM_GLASS   = isDark ? '#2A2540' : 'rgba(255,255,255,0.72)';
  // Charger les sons depuis la DB, avec fallback sur les données locales
  const { data: dbSounds } = trpc.ambient.list.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  // Fusionner DB + fallback local : DB en priorité, local si pas de DB
  const soundDefs = useMemo<AmbientSoundDef[]>(() => {
    if (dbSounds && dbSounds.length > 0) {
      return dbSounds.map((s) => ({
        id: s.slug,
        label: s.name,
        emoji: s.emoji,
        url: s.audioUrl ?? null,
      }));
    }
    return AMBIENT_SOUNDS.map((s) => ({ id: s.id, label: s.label, emoji: s.emoji, url: s.url }));
  }, [dbSounds]);

  const [sounds, setSounds] = useState<SoundState[]>([]);

  // Synchroniser l'état des sons quand soundDefs change
  useEffect(() => {
    setSounds((prev) =>
      soundDefs.map((s) => {
        const existing = prev.find((p) => p.id === s.id);
        return existing ?? { id: s.id, player: null, volume: 0.7, isPlaying: false };
      })
    );
  }, [soundDefs]);
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

    const soundDef = soundDefs.find((s) => s.id === soundId);
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
              if (!soundDef.url) {
                console.warn('Pas d\'URL audio pour ce son:', soundId);
                return s;
              }
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
    <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
      <StarField />
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
            <Text style={[styles.title, { color: AM_WHITE }]}>Sons d'ambiance</Text>
            <Text style={[styles.subtitle, { color: AM_LAV }]}>Créez votre atmosphère idéale</Text>
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
          <Animated.View style={[styles.playingBanner, { backgroundColor: `${AM_GOLD}15`, borderColor: `${AM_GOLD}25` }, pulseStyle]}>
            <View style={[styles.playingDot, { backgroundColor: AM_GOLD }]} />
            <Text style={[styles.playingText, { color: AM_GOLD }]}>
              {sounds.filter((s) => s.isPlaying).length} son{sounds.filter((s) => s.isPlaying).length > 1 ? 's' : ''} en lecture
            </Text>
          </Animated.View>
        )}

        {/* Sound grid */}
        <View style={styles.grid}>
          {soundDefs.map((sound) => {
            const state = sounds.find((s) => s.id === sound.id);
            const isPlaying = state?.isPlaying || false;
            const gradient = SOUND_GRADIENTS[sound.id] || ['#374151', '#6B7280'];
            const hasUrl = !!sound.url;

            return (
              <Pressable
                key={sound.id}
                style={({ pressed }) => [styles.soundCard, { opacity: pressed ? (hasUrl ? 0.85 : 0.5) : (hasUrl ? 1 : 0.6) }]}
                onPress={() => hasUrl ? toggleSound(sound.id) : undefined}
              >
                <LinearGradient
                  colors={gradient as [string, string]}
                  style={[styles.soundCardInner, { borderColor: AM_BORDER }, isPlaying && [styles.soundCardActive, { borderColor: `${AM_GOLD}50` }]]}
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
                  <Text style={[styles.soundLabel, { color: '#FFFFFF' }]}>{sound.label}</Text>
                  {!hasUrl && !isPlaying && (
                    <View style={[styles.activeIndicator, { backgroundColor: 'rgba(80,80,80,0.3)', borderColor: 'rgba(150,150,150,0.3)' }]}>
                      <Text style={[styles.activeText, { color: 'rgba(255,255,255,0.5)' }]}>Bientôt</Text>
                    </View>
                  )}
                  {isPlaying && (
                    <View style={[styles.activeIndicator, { backgroundColor: 'rgba(201,168,76,0.12)', borderColor: 'rgba(201,168,76,0.2)' }]}>
                      <Text style={[styles.activeText, { color: AM_GOLD }]}>▶ En lecture</Text>
                    </View>
                  )}
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>

        {/* Timer section */}
        <View style={[styles.timerCard, { backgroundColor: AM_GLASS, borderColor: AM_BORDER }]}>
          <Text style={[styles.timerTitle, { color: AM_WHITE }]}>⏱️ Minuteur de sommeil</Text>
          <Text style={[styles.timerSubtitle, { color: AM_LAV }]}>
            Les sons s'arrêteront automatiquement
          </Text>

          {timerRunning ? (
            <View style={styles.timerRunning}>
              <Text style={[styles.timerCountdown, { color: AM_GOLD }]}>{formatTimer(timeLeft)}</Text>
              <Pressable
                style={({ pressed }) => [styles.timerStopBtn, { backgroundColor: AM_GLASS, borderColor: AM_BORDER, opacity: pressed ? 0.7 : 1 }]}
                onPress={stopTimer}
              >
                <Text style={[styles.timerStopText, { color: AM_LAV }]}>Annuler</Text>
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
                        backgroundColor: selectedTimer === opt.value ? AM_GOLD : AM_GLASS,
                    borderColor: selectedTimer === opt.value ? AM_GOLD : AM_BORDER,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                    onPress={() => setSelectedTimer(opt.value)}
                  >
                    <Text style={[styles.timerOptionText, { color: selectedTimer === opt.value ? '#FFFFFF' : AM_LAV }]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {selectedTimer > 0 && (
                <Pressable
                  style={({ pressed }) => [styles.startTimerBtn, { backgroundColor: AM_GOLD, opacity: pressed ? 0.85 : 1 }]}
                  onPress={startTimer}
                >
                  <Text style={styles.startTimerText}>Démarrer le minuteur</Text>
                </Pressable>
              )}
            </>
          )}
        </View>

        {/* Tips */}
        <View style={[styles.tipsCard, { backgroundColor: `${AM_GOLD}08`, borderColor: `${AM_GOLD}20` }]}>
          <Text style={[styles.tipsTitle, { color: AM_GOLD }]}>💡 Conseils</Text>
          <Text style={[styles.tipText, { color: AM_LAV }]}>
            Combinez plusieurs sons pour créer votre atmosphère unique. La pluie + forêt crée un environnement particulièrement apaisant.
          </Text>
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
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, marginBottom: 20 },
  title: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 22 },
  subtitle: { fontSize: 14, marginTop: 2 },
  stopAllBtn: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  stopAllText: { fontSize: 12, fontWeight: '600', color: '#F87171' },
  playingBanner: { borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, borderWidth: 1 },
  playingDot: { width: 8, height: 8, borderRadius: 4 },
  playingText: { fontSize: 13, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  soundCard: { width: '47%' },
  soundCardInner: { borderRadius: 18, padding: 16, minHeight: 110, justifyContent: 'flex-end', overflow: 'hidden', borderWidth: 1 },
  soundCardActive: { borderWidth: 1.5 },
  playingOverlay: { position: 'absolute', top: 10, right: 10 },
  waveContainer: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  waveLine: { width: 3, borderRadius: 2 },
  soundEmoji: { fontSize: 32, marginBottom: 6 },
  soundLabel: { fontSize: 14, fontWeight: '700' },
  activeIndicator: { marginTop: 6, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', borderWidth: 1 },
  activeText: { fontSize: 10, fontWeight: '600' },
  timerCard: { borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1 , shadowColor: isDark ? '#000' : '#1C1410', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.25 : 0.10, shadowRadius: isDark ? 10 : 8, elevation: isDark ? 6 : 4 },
  timerTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 16, marginBottom: 4 },
  timerSubtitle: { fontSize: 12, marginBottom: 14 },
  timerOptions: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  timerOption: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1 },
  timerOptionText: { fontSize: 13, fontWeight: '600' },
  startTimerBtn: { borderRadius: 999, paddingVertical: 12, alignItems: 'center' },
  startTimerText: { color: '#0D0B1A', fontSize: 14, fontWeight: '800' },
  timerRunning: { alignItems: 'center', gap: 12 },
  timerCountdown: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 48 },
  timerStopBtn: { borderRadius: 999, paddingHorizontal: 20, paddingVertical: 8, borderWidth: 1 },
  timerStopText: { fontSize: 14, fontWeight: '600' },
  tipsCard: { borderRadius: 14, padding: 14, borderWidth: 1 , shadowColor: isDark ? '#000' : '#1C1410', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.25 : 0.10, shadowRadius: isDark ? 10 : 8, elevation: isDark ? 6 : 4 },
  tipsTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 14, marginBottom: 6 },
  tipText: { fontSize: 13, lineHeight: 19 },
  });
}
