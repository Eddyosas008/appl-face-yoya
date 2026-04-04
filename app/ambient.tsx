import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, PanResponder } from 'react-native';
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
  category: string;
  description?: string | null;
  isPremium?: boolean;
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

const CATEGORIES = [
  { id: 'all',       label: 'Tous',       emoji: '🎵' },
  { id: 'nature',    label: 'Nature',     emoji: '🌿' },
  { id: 'meditation',label: 'Méditation', emoji: '🧘' },
  { id: 'cosmos',    label: 'Cosmos',     emoji: '🌌' },
  { id: 'water',     label: 'Eau',        emoji: '💧' },
  { id: 'fire',      label: 'Feu',        emoji: '🔥' },
];

const SOUND_GRADIENTS: Record<string, string[]> = {
  rain:        ['#1E3A5F', '#2563EB'],
  forest:      ['#14532D', '#16A34A'],
  ocean:       ['#0C4A6E', '#0EA5E9'],
  fire:        ['#7C2D12', '#EA580C'],
  wind:        ['#374151', '#6B7280'],
  birds:       ['#3B0764', '#7C3AED'],
  river:       ['#164E63', '#0891B2'],
  thunder:     ['#1E1B4B', '#4338CA'],
  whale:       ['#0C4A6E', '#1D4ED8'],
  tibetan_bowl:['#78350F', '#D97706'],
  default:     ['#374151', '#6B7280'],
};

// ── Slider de volume simple ────────────────────────────────────────────────────
function VolumeSlider({
  value,
  onChange,
  color,
}: {
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  const trackRef = useRef<View>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (trackWidth > 0) {
          const x = evt.nativeEvent.locationX;
          const newVal = Math.max(0, Math.min(1, x / trackWidth));
          onChange(Math.round(newVal * 10) / 10);
        }
      },
      onPanResponderMove: (evt) => {
        if (trackWidth > 0) {
          const x = evt.nativeEvent.locationX;
          const newVal = Math.max(0, Math.min(1, x / trackWidth));
          onChange(Math.round(newVal * 10) / 10);
        }
      },
    })
  ).current;

  return (
    <View
      ref={trackRef}
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      style={sliderStyles.track}
      {...panResponder.panHandlers}
    >
      <View style={[sliderStyles.fill, { width: `${value * 100}%` as any, backgroundColor: color }]} />
      <View style={[sliderStyles.thumb, { left: `${value * 100}%` as any, backgroundColor: color }]} />
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  track: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    position: 'relative',
    marginTop: 8,
    marginBottom: 4,
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 4,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    top: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: -7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default function AmbientScreen() {
  const colors = useColors();
  const { isDark } = useThemeContext();
  const styles = useMemo(() => makeStyles(isDark), [isDark]);

  // Palette dynamique
  const AM_GOLD    = isDark ? '#C8A96E' : '#8B6914';
  const AM_WHITE   = isDark ? '#EDE8DC' : '#1C1410';
  const AM_LAV     = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(80,60,20,0.65)';
  const AM_BORDER  = isDark ? 'rgba(200,169,110,0.40)' : 'rgba(139,105,20,0.25)';
  const AM_GLASS   = isDark ? '#2A2540' : 'rgba(255,255,255,0.95)';
  const AM_CARD    = isDark ? '#201C38' : '#FFFFFF';

  // Charger les sons depuis la DB, avec fallback sur les données locales
  const { data: dbSounds } = trpc.ambient.list.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  // Fusionner DB + fallback local
  const soundDefs = useMemo<AmbientSoundDef[]>(() => {
    if (dbSounds && dbSounds.length > 0) {
      return dbSounds.map((s) => ({
        id: s.slug,
        label: s.name,
        emoji: s.emoji,
        url: s.audioUrl ?? null,
        category: s.category ?? 'nature',
        description: s.description,
        isPremium: s.isPremium,
      }));
    }
    return AMBIENT_SOUNDS.map((s) => ({
      id: s.id,
      label: s.label,
      emoji: s.emoji,
      url: s.url,
      category: 'nature',
    }));
  }, [dbSounds]);

  const [sounds, setSounds] = useState<SoundState[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedSound, setExpandedSound] = useState<string | null>(null);

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
  const playingCount = sounds.filter((s) => s.isPlaying).length;

  // Sons filtrés par catégorie
  const filteredSounds = useMemo(() => {
    if (selectedCategory === 'all') return soundDefs;
    return soundDefs.filter((s) => s.category === selectedCategory);
  }, [soundDefs, selectedCategory]);

  // Pulse animation for playing indicator
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    if (hasAnyPlaying) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
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
          if (s.player) {
            try { s.player.pause(); } catch (_) {}
          }
          return { ...s, isPlaying: false };
        } else {
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

  function changeVolume(soundId: string, newVolume: number) {
    setSounds((prev) =>
      prev.map((s) => {
        if (s.id !== soundId) return s;
        if (s.player) {
          try { s.player.volume = newVolume; } catch (_) {}
        }
        return { ...s, volume: newVolume };
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
    setExpandedSound(null);
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

  // Catégories disponibles (filtrées sur celles qui ont des sons)
  const availableCategories = useMemo(() => {
    const cats = new Set(soundDefs.map((s) => s.category));
    return CATEGORIES.filter((c) => c.id === 'all' || cats.has(c.id));
  }, [soundDefs]);

  return (
    <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
      <StarField />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
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
              style={({ pressed }) => [styles.stopAllBtn, { opacity: pressed ? 0.7 : 1 }]}
              onPress={stopAll}
            >
              <Text style={styles.stopAllText}>Tout arrêter</Text>
            </Pressable>
          )}
        </View>

        {/* ── Bannière lecture ───────────────────────────────────────────────── */}
        {hasAnyPlaying && (
          <Animated.View style={[styles.playingBanner, { backgroundColor: `${AM_GOLD}15`, borderColor: `${AM_GOLD}30` }, pulseStyle]}>
            <View style={[styles.playingDot, { backgroundColor: AM_GOLD }]} />
            <Text style={[styles.playingText, { color: AM_GOLD }]}>
              {playingCount} son{playingCount > 1 ? 's' : ''} en lecture · Mix actif
            </Text>
            <View style={{ flex: 1 }} />
            <Text style={[styles.playingHint, { color: AM_LAV }]}>Appuyez pour régler le volume</Text>
          </Animated.View>
        )}

        {/* ── Filtres catégories ─────────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          {availableCategories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                style={({ pressed }) => [
                  styles.catChip,
                  {
                    backgroundColor: active ? AM_GOLD : AM_CARD,
                    borderColor: active ? AM_GOLD : AM_BORDER,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={() => {
                  setSelectedCategory(cat.id);
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <Text style={[styles.catLabel, { color: active ? (isDark ? '#0D0B1A' : '#FFFFFF') : AM_WHITE }]}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Grille des sons ────────────────────────────────────────────────── */}
        <View style={styles.grid}>
          {filteredSounds.map((sound) => {
            const state = sounds.find((s) => s.id === sound.id);
            const isPlaying = state?.isPlaying || false;
            const volume = state?.volume ?? 0.7;
            const gradient = SOUND_GRADIENTS[sound.id] || SOUND_GRADIENTS.default;
            const hasUrl = !!sound.url;
            const isExpanded = expandedSound === sound.id;

            return (
              <View key={sound.id} style={styles.soundCardWrapper}>
                <Pressable
                  style={({ pressed }) => [
                    styles.soundCard,
                    { opacity: pressed ? (hasUrl ? 0.88 : 0.5) : (hasUrl ? 1 : 0.65) },
                  ]}
                  onPress={() => {
                    if (!hasUrl) return;
                    toggleSound(sound.id);
                    // Ouvrir le panneau volume si on démarre la lecture
                    if (!isPlaying) setExpandedSound(sound.id);
                  }}
                  onLongPress={() => {
                    if (hasUrl && isPlaying) {
                      setExpandedSound(isExpanded ? null : sound.id);
                      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }
                  }}
                >
                  <LinearGradient
                    colors={gradient as [string, string]}
                    style={[
                      styles.soundCardInner,
                      { borderColor: isPlaying ? `${AM_GOLD}60` : AM_BORDER },
                      isPlaying && styles.soundCardActive,
                    ]}
                  >
                    {/* Indicateur ondes en lecture */}
                    {isPlaying && (
                      <View style={styles.playingOverlay}>
                        <View style={styles.waveContainer}>
                          {[1, 2, 3, 4].map((i) => (
                            <View
                              key={i}
                              style={[styles.waveLine, { height: 6 + i * 3, backgroundColor: 'rgba(255,255,255,0.7)' }]}
                            />
                          ))}
                        </View>
                      </View>
                    )}

                    <Text style={styles.soundEmoji}>{sound.emoji}</Text>
                    <Text style={styles.soundLabel}>{sound.label}</Text>

                    {/* Badge statut */}
                    {!hasUrl && (
                      <View style={styles.badgeSoon}>
                        <Text style={styles.badgeSoonText}>Bientôt</Text>
                      </View>
                    )}
                    {isPlaying && (
                      <View style={styles.badgePlaying}>
                        <Text style={styles.badgePlayingText}>▶ En lecture</Text>
                      </View>
                    )}
                    {sound.isPremium && !isPlaying && hasUrl && (
                      <View style={styles.badgePremium}>
                        <Text style={styles.badgePremiumText}>✦ Premium</Text>
                      </View>
                    )}
                  </LinearGradient>
                </Pressable>

                {/* Panneau volume (visible si en lecture et expanded) */}
                {isPlaying && isExpanded && (
                  <View style={[styles.volumePanel, { backgroundColor: AM_CARD, borderColor: AM_BORDER }]}>
                    <View style={styles.volumeRow}>
                      <Text style={[styles.volumeIcon, { color: AM_LAV }]}>🔈</Text>
                      <View style={{ flex: 1 }}>
                        <VolumeSlider
                          value={volume}
                          onChange={(v) => changeVolume(sound.id, v)}
                          color={AM_GOLD}
                        />
                      </View>
                      <Text style={[styles.volumeIcon, { color: AM_LAV }]}>🔊</Text>
                    </View>
                    <Text style={[styles.volumeValue, { color: AM_GOLD }]}>
                      Volume : {Math.round(volume * 100)}%
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* ── Minuteur ───────────────────────────────────────────────────────── */}
        <View style={[styles.timerCard, { backgroundColor: AM_GLASS, borderColor: AM_BORDER }]}>
          <Text style={[styles.timerTitle, { color: AM_WHITE }]}>⏱️ Minuteur de sommeil</Text>
          <Text style={[styles.timerSubtitle, { color: AM_LAV }]}>
            Les sons s'arrêteront automatiquement
          </Text>

          {timerRunning ? (
            <View style={styles.timerRunning}>
              <Text style={[styles.timerCountdown, { color: AM_GOLD }]}>{formatTimer(timeLeft)}</Text>
              <Text style={[styles.timerHint, { color: AM_LAV }]}>restant</Text>
              <Pressable
                style={({ pressed }) => [styles.timerStopBtn, { backgroundColor: AM_GLASS, borderColor: AM_BORDER, opacity: pressed ? 0.7 : 1 }]}
                onPress={stopTimer}
              >
                <Text style={[styles.timerStopText, { color: AM_LAV }]}>Annuler le minuteur</Text>
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
                        backgroundColor: selectedTimer === opt.value ? AM_GOLD : AM_CARD,
                        borderColor: selectedTimer === opt.value ? AM_GOLD : AM_BORDER,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                    onPress={() => setSelectedTimer(opt.value)}
                  >
                    <Text style={[styles.timerOptionText, { color: selectedTimer === opt.value ? (isDark ? '#0D0B1A' : '#FFFFFF') : AM_LAV }]}>
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
                  <Text style={[styles.startTimerText, { color: isDark ? '#0D0B1A' : '#FFFFFF' }]}>
                    Démarrer — {selectedTimer} min
                  </Text>
                </Pressable>
              )}
            </>
          )}
        </View>

        {/* ── Conseils mixage ────────────────────────────────────────────────── */}
        <View style={[styles.tipsCard, { backgroundColor: `${AM_GOLD}08`, borderColor: `${AM_GOLD}20` }]}>
          <Text style={[styles.tipsTitle, { color: AM_GOLD }]}>💡 Conseils de mixage</Text>
          <Text style={[styles.tipText, { color: AM_LAV }]}>
            Combinez plusieurs sons pour créer votre atmosphère unique. Maintenez un son actif pour régler son volume individuellement.
          </Text>
          <View style={styles.tipCombos}>
            {[
              { combo: '🌧 + 🌿', label: 'Forêt pluvieuse' },
              { combo: '🌊 + 🔥', label: 'Plage au crépuscule' },
              { combo: '🎵 + 🌬', label: 'Méditation profonde' },
            ].map((c, i) => (
              <View key={i} style={[styles.tipCombo, { borderColor: `${AM_GOLD}25` }]}>
                <Text style={styles.tipComboEmoji}>{c.combo}</Text>
                <Text style={[styles.tipComboLabel, { color: AM_LAV }]}>{c.label}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </ScreenContainer>
  );
}

function makeStyles(isDark: boolean) {
  const CARD   = isDark ? '#2A2540' : '#FFFFFF';
  const TEXT1  = isDark ? '#F0EBE0' : '#1C1410';
  const TEXT2  = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(60,40,20,0.65)';
  const GOLD_C = isDark ? '#C8A96E' : '#8B6914';
  const BORD   = isDark ? 'rgba(200,169,110,0.40)' : 'rgba(139,105,20,0.30)';
  return StyleSheet.create({
    scroll: { paddingHorizontal: 20, paddingBottom: 120 },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, marginBottom: 16 },
    title: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 22 },
    subtitle: { fontSize: 13, marginTop: 2 },
    stopAllBtn: {
      borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
      backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
    },
    stopAllText: { fontSize: 12, fontWeight: '600', color: '#F87171' },

    // Bannière lecture
    playingBanner: {
      borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center',
      gap: 8, marginBottom: 14, borderWidth: 1,
    },
    playingDot: { width: 8, height: 8, borderRadius: 4 },
    playingText: { fontSize: 13, fontWeight: '600' },
    playingHint: { fontSize: 10, letterSpacing: 0.3 },

    // Catégories
    catRow: { gap: 8, paddingBottom: 16, paddingRight: 4 },
    catChip: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7,
      borderWidth: 1,
    },
    catEmoji: { fontSize: 14 },
    catLabel: { fontSize: 12, fontWeight: '600' },

    // Grille sons
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
    soundCardWrapper: { width: '47%' },
    soundCard: {},
    soundCardInner: {
      borderRadius: 18, padding: 14, minHeight: 115,
      justifyContent: 'flex-end', overflow: 'hidden', borderWidth: 1,
    },
    soundCardActive: { borderWidth: 1.5 },
    playingOverlay: { position: 'absolute', top: 10, right: 10 },
    waveContainer: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    waveLine: { width: 3, borderRadius: 2 },
    soundEmoji: { fontSize: 30, marginBottom: 5 },
    soundLabel: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', lineHeight: 17 },

    // Badges
    badgeSoon: {
      marginTop: 5, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2,
      alignSelf: 'flex-start', backgroundColor: 'rgba(80,80,80,0.35)',
      borderWidth: 1, borderColor: 'rgba(150,150,150,0.3)',
    },
    badgeSoonText: { fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
    badgePlaying: {
      marginTop: 5, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2,
      alignSelf: 'flex-start', backgroundColor: 'rgba(200,169,110,0.15)',
      borderWidth: 1, borderColor: 'rgba(200,169,110,0.30)',
    },
    badgePlayingText: { fontSize: 9, fontWeight: '600', color: '#C8A96E' },
    badgePremium: {
      marginTop: 5, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2,
      alignSelf: 'flex-start', backgroundColor: 'rgba(200,169,110,0.20)',
      borderWidth: 1, borderColor: 'rgba(200,169,110,0.35)',
    },
    badgePremiumText: { fontSize: 9, fontWeight: '700', color: '#C8A96E' },

    // Panneau volume
    volumePanel: {
      borderRadius: 12, padding: 10, marginTop: 6,
      borderWidth: 1,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.25 : 0.08, shadowRadius: 6, elevation: 3,
    },
    volumeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    volumeIcon: { fontSize: 14 },
    volumeValue: { fontSize: 10, fontWeight: '600', marginTop: 4, textAlign: 'center' },

    // Minuteur
    timerCard: {
      borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1,
      shadowColor: isDark ? '#000' : '#5C3D0A',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0.25 : 0.12,
      shadowRadius: isDark ? 10 : 8,
      elevation: isDark ? 6 : 4,
    },
    timerTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 16, marginBottom: 4 },
    timerSubtitle: { fontSize: 12, marginBottom: 16 },
    timerOptions: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
    timerOption: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1 },
    timerOptionText: { fontSize: 13, fontWeight: '600' },
    startTimerBtn: { borderRadius: 999, paddingVertical: 13, alignItems: 'center' },
    startTimerText: { fontSize: 14, fontWeight: '800' },
    timerRunning: { alignItems: 'center', gap: 8 },
    timerCountdown: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 52 },
    timerHint: { fontSize: 12, marginBottom: 8 },
    timerStopBtn: { borderRadius: 999, paddingHorizontal: 20, paddingVertical: 9, borderWidth: 1, marginTop: 4 },
    timerStopText: { fontSize: 13, fontWeight: '600' },

    // Conseils
    tipsCard: {
      borderRadius: 16, padding: 16, borderWidth: 1,
      shadowColor: isDark ? '#000' : '#5C3D0A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.18 : 0.08,
      shadowRadius: isDark ? 6 : 5,
      elevation: isDark ? 3 : 2,
    },
    tipsTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 14, marginBottom: 8 },
    tipText: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
    tipCombos: { flexDirection: 'row', gap: 8 },
    tipCombo: {
      flex: 1, borderRadius: 10, padding: 8, alignItems: 'center', gap: 3,
      borderWidth: 1, backgroundColor: 'rgba(200,169,110,0.05)',
    },
    tipComboEmoji: { fontSize: 13 },
    tipComboLabel: { fontSize: 9, textAlign: 'center', letterSpacing: 0.2 },
  });
}
