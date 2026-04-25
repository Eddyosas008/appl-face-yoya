/**
 * StreakBadge
 * ───────────
 * Affiche le streak quotidien de l'utilisateur avec :
 * - Un badge animé (scale + glow) quand le streak est actif
 * - Une animation de confettis dorés lors de la première vue d'un nouveau record
 * - Un indicateur "Aujourd'hui complété" ou "À compléter"
 *
 * Usage : <StreakBadge streak={5} completedToday={true} />
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const GOLD       = '#C8A96E';
const GOLD_DARK  = '#8B6028';
const GOLD_GLOW  = 'rgba(200,169,110,0.30)';

// ─── Particule confetti ───────────────────────────────────────────────────────
interface ConfettiParticle {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  rotation: Animated.Value;
  emoji: string;
  startX: number;
}

const CONFETTI_EMOJIS = ['✨', '⭐', '🌟', '💫', '🔥'];

function useConfetti(trigger: boolean) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const newParticles: ConfettiParticle[] = Array.from({ length: 12 }, (_, i) => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(0),
      rotation: new Animated.Value(0),
      emoji: CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length],
      startX: (Math.random() - 0.5) * 120,
    }));

    setParticles(newParticles);

    const animations = newParticles.map((p) => {
      const delay = Math.random() * 200;
      return Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(p.scale, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(p.y, { toValue: -(60 + Math.random() * 60), duration: 600, useNativeDriver: true }),
          Animated.timing(p.x, { toValue: p.startX, duration: 600, useNativeDriver: true }),
          Animated.timing(p.rotation, { toValue: Math.random() * 4 - 2, duration: 600, useNativeDriver: true }),
          Animated.sequence([
            Animated.delay(300),
            Animated.timing(p.opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]),
        ]),
      ]);
    });

    Animated.parallel(animations).start(() => setParticles([]));

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [trigger]);

  return particles;
}

// ─── Composant principal ──────────────────────────────────────────────────────
interface StreakBadgeProps {
  streak: number;
  completedToday: boolean;
  showCelebration?: boolean;
}

export function StreakBadge({ streak, completedToday, showCelebration = false }: StreakBadgeProps) {
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const glowAnim   = useRef(new Animated.Value(0)).current;
  const particles  = useConfetti(showCelebration && streak > 0);

  // Animation de pulsation du badge quand streak actif
  useEffect(() => {
    if (!completedToday || streak === 0) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.04, duration: 1200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.00, duration: 1200, useNativeDriver: true }),
      ])
    );
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    );
    pulse.start();
    glow.start();
    return () => { pulse.stop(); glow.stop(); };
  }, [completedToday, streak]);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.45] });

  const streakLabel =
    streak === 0 ? 'Commencez votre série !' :
    streak === 1 ? '1 jour de suite 🌱' :
    streak < 7   ? `${streak} jours de suite 🔥` :
    streak < 30  ? `${streak} jours 🌟 Incroyable !` :
                   `${streak} jours 🏆 Légendaire !`;

  return (
    <View style={styles.container}>
      {/* Confettis */}
      {particles.map((p, i) => (
        <Animated.Text
          key={i}
          style={[
            styles.confettiParticle,
            {
              opacity: p.opacity,
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                { scale: p.scale },
                { rotate: p.rotation.interpolate({ inputRange: [-2, 2], outputRange: ['-45deg', '45deg'] }) },
              ],
            },
          ]}
        >
          {p.emoji}
        </Animated.Text>
      ))}

      {/* Badge principal */}
      <Animated.View style={[styles.badgeWrapper, { transform: [{ scale: scaleAnim }] }]}>
        {/* Halo de glow */}
        {completedToday && streak > 0 && (
          <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />
        )}
        <LinearGradient
          colors={completedToday && streak > 0
            ? [GOLD, GOLD_DARK]
            : ['rgba(200,169,110,0.20)', 'rgba(200,169,110,0.10)']}
          style={styles.badge}
        >
          <Text style={styles.flameEmoji}>{streak === 0 ? '🌙' : streak >= 7 ? '🏆' : '🔥'}</Text>
          <View style={styles.badgeTextCol}>
            <Text style={[styles.streakNum, { color: completedToday && streak > 0 ? '#0D0B1A' : GOLD }]}>
              {streak}
            </Text>
            <Text style={[styles.streakUnit, { color: completedToday && streak > 0 ? 'rgba(13,11,26,0.7)' : 'rgba(200,169,110,0.7)' }]}>
              {streak === 1 ? 'jour' : 'jours'}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Label descriptif */}
      <Text style={[styles.streakLabel, { color: completedToday && streak > 0 ? GOLD : 'rgba(200,169,110,0.55)' }]}>
        {streakLabel}
      </Text>

      {/* Indicateur "aujourd'hui" */}
      <View style={[
        styles.todayIndicator,
        { backgroundColor: completedToday ? 'rgba(34,197,94,0.15)' : 'rgba(200,169,110,0.10)' },
      ]}>
        <View style={[styles.todayDot, { backgroundColor: completedToday ? '#22C55E' : 'rgba(200,169,110,0.4)' }]} />
        <Text style={[styles.todayText, { color: completedToday ? '#22C55E' : 'rgba(200,169,110,0.55)' }]}>
          {completedToday ? 'Complété aujourd\'hui ✓' : 'À compléter aujourd\'hui'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  badgeWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: GOLD_GLOW,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    minWidth: 100,
    justifyContent: 'center',
  },
  flameEmoji: {
    fontSize: 24,
  },
  badgeTextCol: {
    alignItems: 'center',
  },
  streakNum: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 30,
  },
  streakUnit: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  streakLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  todayIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  todayText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  confettiParticle: {
    position: 'absolute',
    fontSize: 18,
    zIndex: 10,
  },
});
