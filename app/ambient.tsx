import React, {
  useState, useEffect, useRef, useMemo, useCallback,
} from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Platform,
  Dimensions, PanResponder,
} from 'react-native';
import { router } from 'expo-router';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withSequence, Easing,
  FadeIn, FadeOut, SlideInDown, SlideOutDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { ScreenContainer } from '@/components/screen-container';
import { StarField } from '@/components/star-field';
import { useColors } from '@/hooks/use-colors';
import { AMBIENT_SOUNDS } from '@/lib/mock-data';
import { trpc } from '@/lib/trpc';
import { useThemeContext } from '@/lib/theme-provider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Constantes visuelles ─────────────────────────────────────────────────────
const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = (SCREEN_W - 48 - 12) / 2;

const CATEGORIES = [
  { id: 'all',        label: 'Tous',        emoji: '✨' },
  { id: 'nature',     label: 'Nature',      emoji: '🌿' },
  { id: 'water',      label: 'Eau',         emoji: '💧' },
  { id: 'fire',       label: 'Feu',         emoji: '🔥' },
  { id: 'meditation', label: 'Méditation',  emoji: '🧘' },
  { id: 'cosmos',     label: 'Cosmos',      emoji: '🌌' },
];

const SOUND_GRADIENTS: Record<string, readonly [string, string, ...string[]]> = {
  rain:          ['#1A3A5C', '#2563EB', '#1E40AF'],
  forest:        ['#0D3320', '#16A34A', '#15803D'],
  ocean:         ['#0A3347', '#0EA5E9', '#0284C7'],
  fire:          ['#5C1A0A', '#EA580C', '#DC2626'],
  wind:          ['#1F2937', '#4B5563', '#6B7280'],
  birds:         ['#2E0B5E', '#7C3AED', '#6D28D9'],
  river:         ['#0A2E3A', '#0891B2', '#0E7490'],
  thunder:       ['#0F0B2E', '#4338CA', '#3730A3'],
  whale:         ['#0A1E3D', '#1D4ED8', '#1E40AF'],
  tibetan_bowl:  ['#3D1A05', '#D97706', '#B45309'],
  white_noise:   ['#1A1A2E', '#374151', '#4B5563'],
  brown_noise:   ['#2D1A0A', '#92400E', '#78350F'],
  night_insects: ['#0D2010', '#166534', '#14532D'],
  cave:          ['#111827', '#1F2937', '#374151'],
  default:       ['#1A1A2E', '#374151', '#4B5563'],
};

const SOUND_BIG_EMOJI: Record<string, string> = {
  rain:          '🌧️',
  forest:        '🌲',
  ocean:         '🌊',
  fire:          '🔥',
  wind:          '💨',
  birds:         '🐦',
  river:         '🏞️',
  thunder:       '⛈️',
  whale:         '🐋',
  tibetan_bowl:  '🪘',
  white_noise:   '🌫️',
  brown_noise:   '📻',
  night_insects: '🦗',
  cave:          '🕳️',
};

const TIMER_OPTIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
  { label: '∞',      value: 0  },
];

// ─── Slider de volume ─────────────────────────────────────────────────────────
function VolumeSlider({
  value, onChange, color,
}: { value: number; onChange: (v: number) => void; color: string }) {
  const [trackWidth, setTrackWidth] = useState(0);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (trackWidth > 0) {
          const x = Math.max(0, Math.min(trackWidth, evt.nativeEvent.locationX));
          onChange(Math.round((x / trackWidth) * 10) / 10);
        }
      },
      onPanResponderMove: (evt) => {
        if (trackWidth > 0) {
          const x = Math.max(0, Math.min(trackWidth, evt.nativeEvent.locationX));
          onChange(Math.round((x / trackWidth) * 10) / 10);
        }
      },
    })
  ).current;

  return (
    <View
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      style={sliderSt.track}
      {...panResponder.panHandlers}
    >
      <View style={[sliderSt.fill, { width: `${value * 100}%` as `${number}%`, backgroundColor: color }]} />
      <View style={[sliderSt.thumb, { left: `${value * 100}%` as `${number}%`, backgroundColor: color }]} />
    </View>
  );
}
const sliderSt = StyleSheet.create({
  track: {
    height: 4, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 2,
    position: 'relative', marginVertical: 4,
  },
  fill: { position: 'absolute', top: 0, left: 0, height: 4, borderRadius: 2 },
  thumb: {
    position: 'absolute', top: -6, width: 16, height: 16, borderRadius: 8,
    marginLeft: -8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35, shadowRadius: 3, elevation: 3,
  },
});

// ─── Barre d'onde animée ──────────────────────────────────────────────────────
function WaveBar({ height, color, delay }: { height: number; color: string; delay: number }) {
  const anim = useSharedValue(height * 0.4);
  useEffect(() => {
    anim.value = withRepeat(
      withSequence(
        withTiming(height, { duration: 500 + delay, easing: Easing.inOut(Easing.ease) }),
        withTiming(height * 0.3, { duration: 500 + delay, easing: Easing.inOut(Easing.ease) }),
      ), -1, false,
    );
  }, []);
  const style = useAnimatedStyle(() => ({ height: anim.value * 18 }));
  return <Animated.View style={[waveSt.bar, { backgroundColor: color }, style]} />;
}
const waveSt = StyleSheet.create({
  bar: { width: 3, borderRadius: 2, minHeight: 4 },
});

// ─── Carte son ────────────────────────────────────────────────────────────────
function SoundCard({
  sound, state, onToggle, isDark, AM_GOLD,
}: {
  sound: AmbientSoundDef;
  state: SoundState | undefined;
  onToggle: (id: string) => void;
  isDark: boolean;
  AM_GOLD: string;
}) {
  const isPlaying = state?.isPlaying ?? false;
  const hasUrl = !!sound.url;
  const gradient = SOUND_GRADIENTS[sound.id] ?? SOUND_GRADIENTS.default;
  const bigEmoji = SOUND_BIG_EMOJI[sound.id] ?? sound.emoji;

  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  useEffect(() => {
    if (isPlaying) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        ), -1, false,
      );
      glowOpacity.value = withTiming(1, { duration: 400 });
    } else {
      scale.value = withTiming(1, { duration: 300 });
      glowOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isPlaying]);

  const cardAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));

  return (
    <Animated.View style={[{ width: CARD_W }, cardAnimStyle]}>
      <Pressable
        style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}
        onPress={() => { if (hasUrl) onToggle(sound.id); }}
        disabled={!hasUrl}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            cardSt.card,
            isPlaying && { borderColor: AM_GOLD, borderWidth: 1.5 },
            !hasUrl && { opacity: 0.55 },
          ]}
        >
          <Animated.View style={[cardSt.glowOverlay, glowStyle, { backgroundColor: `${AM_GOLD}18` }]} />

          <View style={cardSt.topRow}>
            <Text style={cardSt.bigEmoji}>{bigEmoji}</Text>
            {isPlaying && (
              <View style={[cardSt.activeBadge, { backgroundColor: AM_GOLD }]}>
                <Text style={cardSt.activeBadgeText}>▶</Text>
              </View>
            )}
            {sound.isPremium && !isPlaying && (
              <View style={cardSt.premiumBadge}>
                <Text style={cardSt.premiumText}>✦</Text>
              </View>
            )}
          </View>

          <Text style={cardSt.label} numberOfLines={2}>{sound.label}</Text>

          <View style={cardSt.catBadge}>
            <Text style={cardSt.catBadgeText}>
              {CATEGORIES.find(c => c.id === sound.category)?.emoji ?? '🎵'} {sound.category}
            </Text>
          </View>

          {!hasUrl && (
            <View style={cardSt.soonBadge}>
              <Text style={cardSt.soonText}>Bientôt</Text>
            </View>
          )}

          {isPlaying && (
            <View style={cardSt.waveRow}>
              {[0.6, 1, 0.7, 0.9, 0.5].map((h, i) => (
                <WaveBar key={i} height={h} color={AM_GOLD} delay={i * 120} />
              ))}
            </View>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const cardSt = StyleSheet.create({
  card: {
    borderRadius: 20, padding: 14, minHeight: 145,
    justifyContent: 'flex-end', overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  glowOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  bigEmoji: { fontSize: 38 },
  activeBadge: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  activeBadgeText: { fontSize: 8, color: '#0D0B1A', fontWeight: '800' },
  premiumBadge: {
    width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(200,169,110,0.25)', borderWidth: 1, borderColor: 'rgba(200,169,110,0.5)',
  },
  premiumText: { fontSize: 10, color: '#C8A96E' },
  label: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', lineHeight: 18, marginBottom: 6 },
  catBadge: {
    alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.12)', marginBottom: 6,
  },
  catBadgeText: { fontSize: 9, color: 'rgba(255,255,255,0.75)', fontWeight: '600', textTransform: 'capitalize' },
  soonBadge: {
    alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2,
    backgroundColor: 'rgba(100,100,100,0.3)', borderWidth: 1, borderColor: 'rgba(150,150,150,0.25)',
  },
  soonText: { fontSize: 9, color: 'rgba(255,255,255,0.45)', fontWeight: '600' },
  waveRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginTop: 4, height: 18 },
});

// ─── Lecteur flottant persistant ──────────────────────────────────────────────
function FloatingPlayer({
  playingSounds, soundDefs, onVolumeChange, onToggle, onStopAll, isDark, AM_GOLD,
}: {
  playingSounds: SoundState[];
  soundDefs: AmbientSoundDef[];
  onVolumeChange: (id: string, v: number) => void;
  onToggle: (id: string) => void;
  onStopAll: () => void;
  isDark: boolean;
  AM_GOLD: string;
}) {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);
  const bgColor = isDark ? 'rgba(20,17,42,0.97)' : 'rgba(255,252,245,0.97)';
  const textColor = isDark ? '#F0EBE0' : '#1C1410';
  const mutedColor = isDark ? 'rgba(240,235,224,0.55)' : 'rgba(60,40,20,0.55)';
  const borderColor = isDark ? 'rgba(200,169,110,0.35)' : 'rgba(139,105,20,0.25)';

  return (
    <Animated.View
      entering={SlideInDown.duration(350).springify()}
      exiting={SlideOutDown.duration(250)}
      style={[
        floatSt.container,
        { backgroundColor: bgColor, borderTopColor: borderColor, paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      {/* Barre compacte */}
      <Pressable style={floatSt.collapsedRow} onPress={() => setExpanded(e => !e)}>
        <View style={floatSt.miniIcons}>
          {playingSounds.slice(0, 3).map((s) => {
            const bigEmoji = SOUND_BIG_EMOJI[s.id] ?? soundDefs.find(d => d.id === s.id)?.emoji ?? '🎵';
            return (
              <View key={s.id} style={[floatSt.miniIcon, { backgroundColor: `${AM_GOLD}22`, borderColor: `${AM_GOLD}55` }]}>
                <Text style={{ fontSize: 16 }}>{bigEmoji}</Text>
              </View>
            );
          })}
          {playingSounds.length > 3 && (
            <View style={[floatSt.miniIcon, { backgroundColor: `${AM_GOLD}22`, borderColor: `${AM_GOLD}55` }]}>
              <Text style={{ fontSize: 11, color: AM_GOLD, fontWeight: '700' }}>+{playingSounds.length - 3}</Text>
            </View>
          )}
        </View>

        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[floatSt.playerTitle, { color: textColor }]}>
            {playingSounds.length} son{playingSounds.length > 1 ? 's' : ''} actif{playingSounds.length > 1 ? 's' : ''}
          </Text>
          <Text style={[floatSt.playerSub, { color: mutedColor }]} numberOfLines={1}>
            {playingSounds.map(s => soundDefs.find(d => d.id === s.id)?.label ?? s.id).join(' · ')}
          </Text>
        </View>

        <View style={floatSt.controls}>
          <Pressable
            style={({ pressed }) => [floatSt.stopBtn, { borderColor: 'rgba(248,113,113,0.4)', opacity: pressed ? 0.7 : 1 }]}
            onPress={onStopAll}
          >
            <Text style={{ fontSize: 11, color: '#F87171', fontWeight: '700' }}>■ Stop</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [{ padding: 6, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => setExpanded(e => !e)}
          >
            <Text style={{ fontSize: 16, color: AM_GOLD }}>{expanded ? '▼' : '▲'}</Text>
          </Pressable>
        </View>
      </Pressable>

      {/* Panneau volumes étendu */}
      {expanded && (
        <Animated.View entering={FadeIn.duration(200)} style={floatSt.expandedPanel}>
          {playingSounds.map((s, idx) => {
            const def = soundDefs.find(d => d.id === s.id);
            const bigEmoji = SOUND_BIG_EMOJI[s.id] ?? def?.emoji ?? '🎵';
            const gradient = SOUND_GRADIENTS[s.id] ?? SOUND_GRADIENTS.default;
            const isLast = idx === playingSounds.length - 1;
            return (
              <View key={s.id} style={[floatSt.volumeRow, !isLast && { borderBottomColor: borderColor, borderBottomWidth: 0.5 }]}>
                <LinearGradient colors={gradient} style={floatSt.soundDot}>
                  <Text style={{ fontSize: 18 }}>{bigEmoji}</Text>
                </LinearGradient>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[floatSt.volLabel, { color: textColor }]}>{def?.label ?? s.id}</Text>
                    <Text style={[floatSt.volValue, { color: AM_GOLD }]}>{Math.round(s.volume * 100)}%</Text>
                  </View>
                  <VolumeSlider value={s.volume} onChange={(v) => onVolumeChange(s.id, v)} color={AM_GOLD} />
                </View>
                <Pressable
                  style={({ pressed }) => [{ padding: 8, marginLeft: 6, opacity: pressed ? 0.6 : 1 }]}
                  onPress={() => onToggle(s.id)}
                >
                  <Text style={{ fontSize: 14, color: 'rgba(248,113,113,0.8)' }}>✕</Text>
                </Pressable>
              </View>
            );
          })}
        </Animated.View>
      )}
    </Animated.View>
  );
}

const floatSt = StyleSheet.create({
  container: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 10,
  },
  collapsedRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4,
  },
  miniIcons: { flexDirection: 'row', gap: 6 },
  miniIcon: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1,
  },
  playerTitle: { fontSize: 13, fontWeight: '700' },
  playerSub: { fontSize: 11, marginTop: 1 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stopBtn: {
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, backgroundColor: 'rgba(239,68,68,0.08)',
  },
  expandedPanel: { paddingHorizontal: 16, paddingBottom: 8, paddingTop: 4 },
  volumeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  soundDot: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  volLabel: { fontSize: 13, fontWeight: '600' },
  volValue: { fontSize: 12, fontWeight: '700' },
});

// ─── Minuteur de sommeil ──────────────────────────────────────────────────────
function SleepTimer({
  isDark, AM_GOLD, AM_WHITE, AM_LAV, AM_CARD, AM_BORDER, onTimerEnd,
}: {
  isDark: boolean; AM_GOLD: string; AM_WHITE: string;
  AM_LAV: string; AM_CARD: string; AM_BORDER: string;
  onTimerEnd: () => void;
}) {
  const [selected, setSelected] = useState(30);
  const [timeLeft, setTimeLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function start() {
    if (selected === 0) return;
    setTimeLeft(selected * 60);
    setRunning(true);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
  function stop() {
    setRunning(false);
    setTimeLeft(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }
  function fmt(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  useEffect(() => {
    if (running && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            setRunning(false);
            onTimerEnd();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  return (
    <View style={[timerSt.card, { backgroundColor: AM_CARD, borderColor: AM_BORDER }]}>
      <View style={timerSt.titleRow}>
        <Text style={{ fontSize: 20 }}>⏱️</Text>
        <View style={{ marginLeft: 10 }}>
          <Text style={[timerSt.title, { color: AM_WHITE }]}>Minuteur de sommeil</Text>
          <Text style={[timerSt.sub, { color: AM_LAV }]}>Les sons s'arrêtent automatiquement</Text>
        </View>
      </View>

      {!running ? (
        <>
          <View style={timerSt.optionsRow}>
            {TIMER_OPTIONS.map(opt => (
              <Pressable
                key={opt.value}
                style={({ pressed }) => [
                  timerSt.option,
                  {
                    backgroundColor: selected === opt.value ? AM_GOLD : 'transparent',
                    borderColor: selected === opt.value ? AM_GOLD : AM_BORDER,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={() => setSelected(opt.value)}
              >
                <Text style={[
                  timerSt.optionText,
                  { color: selected === opt.value ? (isDark ? '#0D0B1A' : '#FFFFFF') : AM_WHITE },
                ]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {selected > 0 && (
            <Pressable
              style={({ pressed }) => [timerSt.startBtn, { backgroundColor: AM_GOLD, opacity: pressed ? 0.85 : 1 }]}
              onPress={start}
            >
              <Text style={[timerSt.startText, { color: isDark ? '#0D0B1A' : '#FFFFFF' }]}>
                Démarrer · {selected} min
              </Text>
            </Pressable>
          )}
        </>
      ) : (
        <View style={timerSt.runningView}>
          <View style={[timerSt.circleOuter, { borderColor: AM_BORDER }]}>
            <Text style={[timerSt.countdown, { color: AM_GOLD }]}>{fmt(timeLeft)}</Text>
          </View>
          <Text style={[timerSt.runningHint, { color: AM_LAV }]}>
            Sons actifs encore {fmt(timeLeft)}
          </Text>
          <Pressable
            style={({ pressed }) => [timerSt.stopBtn, { borderColor: AM_BORDER, opacity: pressed ? 0.7 : 1 }]}
            onPress={stop}
          >
            <Text style={[timerSt.stopText, { color: AM_WHITE }]}>Annuler le minuteur</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const timerSt = StyleSheet.create({
  card: {
    borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  title: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 15 },
  sub: { fontSize: 11, marginTop: 2 },
  optionsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 14 },
  option: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  optionText: { fontSize: 13, fontWeight: '600' },
  startBtn: { borderRadius: 999, paddingVertical: 13, alignItems: 'center' },
  startText: { fontSize: 14, fontWeight: '800' },
  runningView: { alignItems: 'center', gap: 12 },
  circleOuter: {
    width: 110, height: 110, borderRadius: 55, borderWidth: 3,
    justifyContent: 'center', alignItems: 'center',
  },
  countdown: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 28 },
  runningHint: { fontSize: 12, textAlign: 'center' },
  stopBtn: { borderRadius: 999, paddingHorizontal: 20, paddingVertical: 9, borderWidth: 1 },
  stopText: { fontSize: 13, fontWeight: '600' },
});

// ─── Écran principal ──────────────────────────────────────────────────────────
export default function AmbientScreen() {
  const { isDark } = useThemeContext();
  const styles = useMemo(() => makeStyles(isDark), [isDark]);
  const insets = useSafeAreaInsets();

  const AM_GOLD   = isDark ? '#C8A96E' : '#8B6914';
  const AM_WHITE  = isDark ? '#EDE8DC' : '#1C1410';
  const AM_LAV    = isDark ? 'rgba(240,235,224,0.60)' : 'rgba(60,40,20,0.60)';
  const AM_BORDER = isDark ? 'rgba(200,169,110,0.38)' : 'rgba(139,105,20,0.22)';
  const AM_CARD   = isDark ? '#201C38' : '#FFFFFF';

  const { data: dbSounds } = trpc.ambient.list.useQuery(undefined, { staleTime: 5 * 60 * 1000 });

  const soundDefs = useMemo<AmbientSoundDef[]>(() => {
    if (dbSounds && dbSounds.length > 0) {
      return dbSounds.map((s) => ({
        id: s.slug, label: s.name, emoji: s.emoji,
        url: s.audioUrl ?? null, category: s.category ?? 'nature',
        description: s.description, isPremium: s.isPremium,
      }));
    }
    return AMBIENT_SOUNDS.map((s) => ({
      id: s.id, label: s.label, emoji: s.emoji, url: s.url, category: 'nature',
    }));
  }, [dbSounds]);

  const [sounds, setSounds] = useState<SoundState[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    setSounds((prev) =>
      soundDefs.map((s) => {
        const existing = prev.find((p) => p.id === s.id);
        return existing ?? { id: s.id, player: null, volume: 0.7, isPlaying: false };
      })
    );
  }, [soundDefs]);

  useKeepAwake();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    }
    return () => {
      sounds.forEach((s) => {
        if (s.player) { try { s.player.pause(); s.player.remove(); } catch (_) {} }
      });
    };
  }, []);

  const toggleSound = useCallback((id: string) => {
    const def = soundDefs.find((s) => s.id === id);
    if (!def?.url) return;
    setSounds((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      if (s.isPlaying) {
        try { s.player?.pause(); } catch (_) {}
        return { ...s, isPlaying: false };
      } else {
        let player = s.player;
        if (!player) {
          player = createAudioPlayer({ uri: def.url! });
          player.loop = true;
          player.volume = s.volume;
        }
        try { player.play(); } catch (_) {}
        return { ...s, player, isPlaying: true };
      }
    }));
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [soundDefs]);

  const updateVolume = useCallback((id: string, volume: number) => {
    setSounds((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      if (s.player) { try { s.player.volume = volume; } catch (_) {} }
      return { ...s, volume };
    }));
  }, []);

  const stopAll = useCallback(() => {
    setSounds((prev) => prev.map((s) => {
      if (s.player && s.isPlaying) { try { s.player.pause(); } catch (_) {} }
      return { ...s, isPlaying: false };
    }));
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleTimerEnd = useCallback(() => {
    stopAll();
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [stopAll]);

  const playingSounds = useMemo(() => sounds.filter((s) => s.isPlaying), [sounds]);
  const hasAnyPlaying = playingSounds.length > 0;

  const filteredSounds = useMemo(() => {
    if (selectedCategory === 'all') return soundDefs;
    return soundDefs.filter((s) => s.category === selectedCategory);
  }, [soundDefs, selectedCategory]);

  const availableCategories = useMemo(() => {
    const cats = new Set(soundDefs.map((s) => s.category));
    return CATEGORIES.filter((c) => c.id === 'all' || cats.has(c.id));
  }, [soundDefs]);

  const headerPulse = useSharedValue(1);
  useEffect(() => {
    if (hasAnyPlaying) {
      headerPulse.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        ), -1, false,
      );
    } else {
      headerPulse.value = withTiming(1, { duration: 300 });
    }
  }, [hasAnyPlaying]);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: headerPulse.value }] }));

  return (
    <ScreenContainer
      containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}
      edges={['top', 'left', 'right']}
    >
      <StarField />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: hasAnyPlaying ? 120 + Math.max(insets.bottom, 8) : 40 },
        ]}
      >
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: isDark ? '#2A2540' : '#F0EBE0', borderColor: AM_BORDER, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backArrow, { color: AM_GOLD }]}>←</Text>
          </Pressable>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.title, { color: AM_WHITE }]}>Sons d'ambiance</Text>
            <Text style={[styles.subtitle, { color: AM_LAV }]}>
              {hasAnyPlaying
                ? `${playingSounds.length} son${playingSounds.length > 1 ? 's' : ''} en lecture`
                : 'Créez votre atmosphère idéale'}
            </Text>
          </View>

          {hasAnyPlaying && (
            <Animated.View style={[styles.playingDot, { backgroundColor: AM_GOLD }, pulseStyle]} />
          )}
        </View>

        {/* ── Bannière mix actif ─────────────────────────────────────────────── */}
        {hasAnyPlaying && (
          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            style={[styles.mixBanner, { backgroundColor: `${AM_GOLD}12`, borderColor: `${AM_GOLD}35` }]}
          >
            <Text style={{ fontSize: 16 }}>🎵</Text>
            <Text style={[styles.mixBannerText, { color: AM_GOLD }]}>
              Mix actif · {playingSounds.length} son{playingSounds.length > 1 ? 's' : ''} simultané{playingSounds.length > 1 ? 's' : ''}
            </Text>
            <View style={{ flex: 1 }} />
            <Pressable
              style={({ pressed }) => [styles.stopAllBtn, { borderColor: 'rgba(248,113,113,0.4)', opacity: pressed ? 0.7 : 1 }]}
              onPress={stopAll}
            >
              <Text style={{ fontSize: 11, color: '#F87171', fontWeight: '700' }}>■ Tout arrêter</Text>
            </Pressable>
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

        {/* ── Grille premium 2 colonnes ──────────────────────────────────────── */}
        <View style={styles.grid}>
          {filteredSounds.map((sound) => (
            <SoundCard
              key={sound.id}
              sound={sound}
              state={sounds.find((s) => s.id === sound.id)}
              onToggle={toggleSound}
              isDark={isDark}
              AM_GOLD={AM_GOLD}
            />
          ))}
        </View>

        {/* ── Minuteur de sommeil ────────────────────────────────────────────── */}
        <SleepTimer
          isDark={isDark}
          AM_GOLD={AM_GOLD}
          AM_WHITE={AM_WHITE}
          AM_LAV={AM_LAV}
          AM_CARD={AM_CARD}
          AM_BORDER={AM_BORDER}
          onTimerEnd={handleTimerEnd}
        />

        {/* ── Conseils de mixage ─────────────────────────────────────────────── */}
        <View style={[styles.tipsCard, { backgroundColor: AM_CARD, borderColor: AM_BORDER }]}>
          <Text style={[styles.tipsTitle, { color: AM_WHITE }]}>✨ Combinaisons recommandées</Text>
          <Text style={[styles.tipText, { color: AM_LAV }]}>
            Associez plusieurs sons pour créer votre ambiance parfaite. Appuyez sur plusieurs cartes pour les mixer simultanément.
          </Text>
          <View style={styles.combosRow}>
            {[
              { emoji: '🌧️+🔥', label: 'Pluie\n& Feu' },
              { emoji: '🌊+🐦', label: 'Océan\n& Oiseaux' },
              { emoji: '🪘+🌲', label: 'Bol\n& Forêt' },
            ].map((combo) => (
              <View key={combo.label} style={[styles.comboCard, { backgroundColor: `${AM_GOLD}08`, borderColor: AM_BORDER }]}>
                <Text style={{ fontSize: 18, textAlign: 'center' }}>{combo.emoji}</Text>
                <Text style={[styles.comboLabel, { color: AM_LAV }]}>{combo.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ── Lecteur flottant ───────────────────────────────────────────────── */}
      {hasAnyPlaying && (
        <FloatingPlayer
          playingSounds={playingSounds}
          soundDefs={soundDefs}
          onVolumeChange={updateVolume}
          onToggle={toggleSound}
          onStopAll={stopAll}
          isDark={isDark}
          AM_GOLD={AM_GOLD}
        />
      )}
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
function makeStyles(isDark: boolean) {
  const AM_CARD = isDark ? '#201C38' : '#FFFFFF';
  const AM_BORD = isDark ? 'rgba(200,169,110,0.38)' : 'rgba(139,105,20,0.22)';
  return StyleSheet.create({
    scroll: { paddingHorizontal: 20, paddingTop: 8 },
    header: { flexDirection: 'row', alignItems: 'center', paddingBottom: 16, paddingTop: 4 },
    backBtn: {
      width: 40, height: 40, borderRadius: 12,
      justifyContent: 'center', alignItems: 'center', borderWidth: 1,
    },
    backArrow: { fontSize: 20, fontWeight: '600' },
    title: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 20 },
    subtitle: { fontSize: 12, marginTop: 2 },
    playingDot: { width: 10, height: 10, borderRadius: 5 },
    mixBanner: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      borderRadius: 14, padding: 12, marginBottom: 14, borderWidth: 1,
    },
    mixBannerText: { fontSize: 13, fontWeight: '700' },
    stopAllBtn: {
      borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
      borderWidth: 1, backgroundColor: 'rgba(239,68,68,0.08)',
    },
    catRow: { gap: 8, paddingBottom: 16, paddingRight: 4 },
    catChip: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1,
    },
    catEmoji: { fontSize: 14 },
    catLabel: { fontSize: 12, fontWeight: '600' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
    tipsCard: {
      borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.18 : 0.07, shadowRadius: 6, elevation: 3,
    },
    tipsTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 14, marginBottom: 8 },
    tipText: { fontSize: 13, lineHeight: 20, marginBottom: 12 },
    combosRow: { flexDirection: 'row', gap: 8 },
    comboCard: { flex: 1, borderRadius: 12, padding: 10, alignItems: 'center', gap: 4, borderWidth: 1 },
    comboLabel: { fontSize: 10, textAlign: 'center', lineHeight: 14 },
  });
}
