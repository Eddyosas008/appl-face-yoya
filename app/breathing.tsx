import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { ScreenContainer } from '@/components/screen-container';
import { StarField } from '@/components/star-field';
import { useColors } from '@/hooks/use-colors';
import { useThemeContext } from '@/lib/theme-provider';
import { IconSymbol } from '@/components/ui/icon-symbol';

type BreathingTechnique = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  gradient: string[];
  phases: { label: string; duration: number; instruction: string }[];
  cycles: number;
  benefit: string;
};

const TECHNIQUES: BreathingTechnique[] = [
  {
    id: 'box',
    name: 'Respiration carrée',
    description: 'Technique militaire pour calmer le système nerveux rapidement.',
    emoji: '⬛',
    gradient: ['#7C3AED', '#4F46E5'],
    benefit: 'Calme & Focus',
    cycles: 4,
    phases: [
      { label: 'Inspirez', duration: 4, instruction: 'Remplissez vos poumons lentement' },
      { label: 'Retenez', duration: 4, instruction: 'Gardez l\'air, restez immobile' },
      { label: 'Expirez', duration: 4, instruction: 'Videz complètement vos poumons' },
      { label: 'Retenez', duration: 4, instruction: 'Poumons vides, restez calme' },
    ],
  },
  {
    id: '478',
    name: 'Respiration 4-7-8',
    description: 'Technique du Dr Weil pour réduire l\'anxiété et favoriser le sommeil.',
    emoji: '🌙',
    gradient: ['#1A0A2E', '#4A1A6E'],
    benefit: 'Sommeil & Anxiété',
    cycles: 4,
    phases: [
      { label: 'Inspirez', duration: 4, instruction: 'Inspirez par le nez en silence' },
      { label: 'Retenez', duration: 7, instruction: 'Retenez votre souffle' },
      { label: 'Expirez', duration: 8, instruction: 'Expirez par la bouche avec un son' },
    ],
  },
  {
    id: 'coherent',
    name: 'Cohérence cardiaque',
    description: 'Synchronisez votre cœur et votre respiration pour un équilibre profond.',
    emoji: '💚',
    gradient: ['#065F46', '#059669'],
    benefit: 'Équilibre & Bien-être',
    cycles: 5,
    phases: [
      { label: 'Inspirez', duration: 5, instruction: 'Inspirez doucement et régulièrement' },
      { label: 'Expirez', duration: 5, instruction: 'Expirez doucement et régulièrement' },
    ],
  },
  {
    id: 'energizing',
    name: 'Respiration énergisante',
    description: 'Activez votre énergie et votre vitalité en quelques respirations.',
    emoji: '⚡',
    gradient: ['#B45309', '#F59E0B'],
    benefit: 'Énergie & Vitalité',
    cycles: 6,
    phases: [
      { label: 'Inspirez', duration: 2, instruction: 'Inspiration rapide et profonde' },
      { label: 'Expirez', duration: 2, instruction: 'Expiration forte et complète' },
    ],
  },
  {
    id: 'stress',
    name: 'Libération du stress',
    description: 'Expirez plus longtemps pour activer le système parasympathique.',
    emoji: '🕊️',
    gradient: ['#BE185D', '#EC4899'],
    benefit: 'Anti-stress',
    cycles: 5,
    phases: [
      { label: 'Inspirez', duration: 4, instruction: 'Inspirez par le nez' },
      { label: 'Expirez', duration: 8, instruction: 'Expirez lentement par la bouche' },
    ],
  },
];

export default function BreathingScreen() {
  const colors = useColors();
  const { isDark } = useThemeContext();

  // Palette dynamique
  const B_GOLD    = isDark ? '#C8A96E' : '#8B6914';
  const B_WHITE   = isDark ? '#EDE8DC' : '#1C1410';
  const B_LAV     = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(80,60,140,0.70)';
  const B_LAV_DIM = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(80,60,140,0.45)';
  const B_BORDER  = isDark ? 'rgba(200,169,110,0.40)' : 'rgba(120,100,180,0.18)';
  const B_GLASS   = isDark ? '#2A2540' : 'rgba(255,255,255,0.72)';
  const [selected, setSelected] = useState<BreathingTechnique | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useKeepAwake();

  const circleScale = useSharedValue(1);
  const circleOpacity = useSharedValue(0.6);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    opacity: circleOpacity.value,
  }));

  const animatePhase = useCallback((phase: { label: string; duration: number }) => {
    const dur = phase.duration * 1000;
    if (phase.label === 'Inspirez') {
      circleScale.value = withTiming(1.5, { duration: dur, easing: Easing.inOut(Easing.ease) });
      circleOpacity.value = withTiming(1, { duration: dur });
    } else if (phase.label === 'Expirez') {
      circleScale.value = withTiming(1, { duration: dur, easing: Easing.inOut(Easing.ease) });
      circleOpacity.value = withTiming(0.6, { duration: dur });
    } else {
      // Hold — subtle pulse
      circleScale.value = withSequence(
        withTiming(circleScale.value + 0.02, { duration: dur / 2 }),
        withTiming(circleScale.value, { duration: dur / 2 })
      );
    }
  }, []);

  useEffect(() => {
    if (!isRunning || !selected) return;

    const phase = selected.phases[phaseIndex];
    setTimeLeft(phase.duration);
    animatePhase(phase);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          // Move to next phase
          const nextPhaseIndex = (phaseIndex + 1) % selected.phases.length;
          const isNewCycle = nextPhaseIndex === 0;
          const newCycleCount = isNewCycle ? cycleCount + 1 : cycleCount;

          if (isNewCycle && newCycleCount >= selected.cycles) {
            setIsRunning(false);
            setIsComplete(true);
            cancelAnimation(circleScale);
            circleScale.value = withTiming(1.2, { duration: 600 });
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } else {
            if (isNewCycle) setCycleCount(newCycleCount);
            setPhaseIndex(nextPhaseIndex);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, phaseIndex, selected]);

  function startExercise(technique: BreathingTechnique) {
    setSelected(technique);
    setIsRunning(false);
    setPhaseIndex(0);
    setCycleCount(0);
    setTimeLeft(technique.phases[0].duration);
    setIsComplete(false);
    circleScale.value = 1;
    circleOpacity.value = 0.6;
  }

  function handleStart() {
    if (!selected) return;
    setIsRunning(true);
    setPhaseIndex(0);
    setCycleCount(0);
    setIsComplete(false);
    circleScale.value = 1;
  }

  function handleStop() {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    cancelAnimation(circleScale);
    circleScale.value = withTiming(1, { duration: 400 });
    circleOpacity.value = withTiming(0.6, { duration: 400 });
  }

  function handleReset() {
    handleStop();
    setPhaseIndex(0);
    setCycleCount(0);
    setIsComplete(false);
    if (selected) setTimeLeft(selected.phases[0].duration);
  }

  const currentPhase = selected ? selected.phases[phaseIndex] : null;
  const totalPhaseDuration = selected ? selected.phases.reduce((s, p) => s + p.duration, 0) : 0;
  const totalDurationMin = selected ? Math.ceil((totalPhaseDuration * selected.cycles) / 60) : 0;

  if (selected) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header gradient */}
        <LinearGradient
          colors={[selected.gradient[0], selected.gradient[1], colors.background] as any}
          style={styles.headerGradient}
        />

        <ScreenContainer edges={['top', 'left', 'right']} containerClassName="bg-transparent">
          {/* Top bar */}
          <View style={styles.topBar}>
            <Pressable
              style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
              onPress={() => { handleStop(); setSelected(null); }}
            >
              <IconSymbol name="chevron.left" size={20} color="#FFFFFF" />
            </Pressable>
            <Text style={[styles.topTitle, { color: '#FFFFFF' }]}>{selected.name}</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.exerciseContent} showsVerticalScrollIndicator={false}>
            {/* Cycle counter */}
            <Text style={[styles.cycleText, { color: 'rgba(255,255,255,0.8)' }]}>
              {isComplete ? '✨ Terminé !' : `Cycle ${Math.min(cycleCount + 1, selected.cycles)} / ${selected.cycles}`}
            </Text>

            {/* Animated circle */}
            <View style={styles.circleWrapper}>
              <Animated.View style={[styles.circleOuter, { borderColor: 'rgba(255,255,255,0.25)' }, circleStyle]}>
                <View style={[styles.circleInner, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                  <View style={[styles.circleCore, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                    {isComplete ? (
                      <Text style={styles.circleEmoji}>🎉</Text>
                    ) : isRunning && currentPhase ? (
                      <>
                        <Text style={[styles.circlePhaseLabel, { color: '#FFD580' }]}>{currentPhase.label}</Text>
                        <Text style={[styles.circleTimer, { color: '#FFFFFF' }]}>{timeLeft}</Text>
                      </>
                    ) : (
                      <Text style={styles.circleEmoji}>{selected.emoji}</Text>
                    )}
                  </View>
                </View>
              </Animated.View>
            </View>

            {/* Instruction */}
            {isRunning && currentPhase && (
              <Text style={[styles.instruction, { color: 'rgba(255,255,255,0.8)' }]}>{currentPhase.instruction}</Text>
            )}
            {isComplete && (
              <Text style={[styles.instruction, { color: 'rgba(255,255,255,0.8)' }]}>
                Bravo ! Vous avez complété {selected.cycles} cycles de {selected.name}.
              </Text>
            )}
            {!isRunning && !isComplete && (
              <Text style={[styles.instruction, { color: 'rgba(255,255,255,0.75)' }]}>{selected.description}</Text>
            )}

            {/* Phase indicators */}
            {!isComplete && (
              <View style={styles.phaseIndicators}>
                {selected.phases.map((p, i) => (
                  <View key={i} style={styles.phaseItem}>
                    <View style={[
                      styles.phaseDot,
                      {
                        backgroundColor: i === phaseIndex && isRunning ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                        width: i === phaseIndex && isRunning ? 24 : 8,
                      }
                    ]} />
                    <Text style={[styles.phaseLabel, { opacity: i === phaseIndex && isRunning ? 1 : 0.5 }]}>
                      {p.label} {p.duration}s
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Controls */}
            <View style={styles.exerciseControls}>
              {!isRunning && !isComplete && (
                <Pressable
                  style={({ pressed }) => [styles.mainBtn, { backgroundColor: '#C8A96E', opacity: pressed ? 0.85 : 1 }]}
                  onPress={handleStart}
                >
                  <Text style={styles.mainBtnText}>Commencer</Text>
                </Pressable>
              )}
              {isRunning && (
                <Pressable
                  style={({ pressed }) => [styles.mainBtn, styles.stopBtn, { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.25)', opacity: pressed ? 0.85 : 1 }]}
                  onPress={handleStop}
                >
                  <Text style={styles.mainBtnText}>Pause</Text>
                </Pressable>
              )}
              {!isRunning && (cycleCount > 0 || isComplete) && (
                <Pressable
                  style={({ pressed }) => [styles.secondaryBtn, { opacity: pressed ? 0.7 : 1 }]}
                  onPress={isComplete ? handleReset : handleStart}
                >
                  <Text style={[styles.secondaryBtnText, { color: 'rgba(255,255,255,0.6)' }]}>{isComplete ? 'Recommencer' : 'Reprendre'}</Text>
                </Pressable>
              )}
            </View>

            <Text style={[styles.durationHint, { color: 'rgba(255,255,255,0.45)' }]}>Durée estimée : {totalDurationMin} min</Text>
          </ScrollView>
        </ScreenContainer>
      </View>
    );
  }

  // Technique selection screen
  return (
    <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
      <StarField />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {/* Header */}
        <View style={styles.listHeader}>
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={22} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.listTitle, { color: B_WHITE }]}>Exercices de respiration</Text>
            <Text style={[styles.listSubtitle, { color: B_LAV }]}>Choisissez votre technique</Text>
          </View>
        </View>

        {/* Technique cards */}
        {TECHNIQUES.map((technique) => (
          <Pressable
            key={technique.id}
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, marginBottom: 14 }]}
            onPress={() => startExercise(technique)}
          >
            <LinearGradient
              colors={technique.gradient as any}
              style={[styles.techniqueCard, { borderColor: B_BORDER }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.techniqueLeft}>
                <Text style={styles.techniqueEmoji}>{technique.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.techniqueName, { color: '#FFFFFF' }]}>{technique.name}</Text>
                  <Text style={[styles.techniqueDesc, { color: 'rgba(255,255,255,0.75)' }]} numberOfLines={2}>{technique.description}</Text>
                  <View style={styles.techniqueMeta}>
                    <View style={[styles.benefitBadge, { backgroundColor: 'rgba(201,168,76,0.15)', borderColor: 'rgba(201,168,76,0.25)' }]}>
                      <Text style={[styles.benefitText, { color: '#C8A96E' }]}>{technique.benefit}</Text>
                    </View>
                    <Text style={[styles.cyclesText, { color: 'rgba(255,255,255,0.5)' }]}>{technique.cycles} cycles</Text>
                  </View>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={18} color="rgba(255,255,255,0.7)" />
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 420 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 17 },
  exerciseContent: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 60 },
  cycleText: { fontSize: 14, fontWeight: '600', marginBottom: 32, letterSpacing: 0.5 },
  circleWrapper: { width: 260, height: 260, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  circleOuter: { width: 240, height: 240, borderRadius: 120, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  circleInner: { width: 200, height: 200, borderRadius: 100, alignItems: 'center', justifyContent: 'center' },
  circleCore: { width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center' },
  circleEmoji: { fontSize: 48 },
  circlePhaseLabel: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  circleTimer: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 42 },
  instruction: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 28, paddingHorizontal: 16 },
  phaseIndicators: { flexDirection: 'row', gap: 16, marginBottom: 36, flexWrap: 'wrap', justifyContent: 'center' },
  phaseItem: { alignItems: 'center', gap: 6 },
  phaseDot: { height: 8, borderRadius: 4 },
  phaseLabel: { fontSize: 11 },
  exerciseControls: { gap: 12, width: '100%', alignItems: 'center' },
  mainBtn: { borderRadius: 999, paddingVertical: 16, paddingHorizontal: 48 },
  stopBtn: { borderWidth: 1 },
  mainBtnText: { color: '#0D0B1A', fontSize: 16, fontWeight: '800' },
  secondaryBtn: { paddingVertical: 10 },
  secondaryBtnText: { fontSize: 14 },
  durationHint: { fontSize: 12, marginTop: 20 },
  // List styles
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  listHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, marginBottom: 24 },
  listTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 22 },
  listSubtitle: { fontSize: 14, marginTop: 2 },
  techniqueCard: { borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  techniqueLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  techniqueEmoji: { fontSize: 32, marginTop: 2 },
  techniqueName: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  techniqueDesc: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  techniqueMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  benefitBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1 },
  benefitText: { fontSize: 11, fontWeight: '600' },
  cyclesText: { fontSize: 11 },
});
