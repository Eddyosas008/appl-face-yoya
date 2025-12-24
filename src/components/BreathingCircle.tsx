import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, typography, spacing } from '../theme';

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

interface BreathingCircleProps {
  phase: BreathingPhase;
  size?: number;
  isActive?: boolean;
  showLabel?: boolean;
  color?: string;
}

const phaseLabels: Record<BreathingPhase, string> = {
  inhale: 'Inspirez',
  hold: 'Maintenez',
  exhale: 'Expirez',
  rest: 'Repos',
};

const phaseDurations: Record<BreathingPhase, number> = {
  inhale: 4000,
  hold: 4000,
  exhale: 4000,
  rest: 2000,
};

export const BreathingCircle: React.FC<BreathingCircleProps> = ({
  phase,
  size = 120,
  isActive = true,
  showLabel = true,
  color = colors.accent.teal,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isActive) {
      scaleAnim.setValue(0.6);
      opacityAnim.setValue(0.3);
      return;
    }

    const duration = phaseDurations[phase];

    switch (phase) {
      case 'inhale':
        // Expand the circle
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.8,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
        break;

      case 'hold':
        // Gentle pulse while holding
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;

      case 'exhale':
        // Contract the circle
        pulseAnim.setValue(1);
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.6,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
        break;

      case 'rest':
        // Stay small and calm
        pulseAnim.setValue(1);
        scaleAnim.setValue(0.6);
        opacityAnim.setValue(0.3);
        break;
    }

    return () => {
      pulseAnim.setValue(1);
    };
  }, [phase, isActive]);

  const innerSize = size * 0.7;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.outerRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            opacity: opacityAnim.interpolate({
              inputRange: [0.3, 0.8],
              outputRange: [0.1, 0.3],
            }),
            transform: [
              { scale: scaleAnim },
              { scale: pulseAnim },
            ],
          },
        ]}
      />

      {/* Main circle */}
      <Animated.View
        style={[
          styles.mainCircle,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: color,
            opacity: opacityAnim,
            transform: [
              { scale: scaleAnim },
              { scale: pulseAnim },
            ],
          },
        ]}
      />

      {/* Center content */}
      <View style={[styles.centerContent, { width: innerSize * 0.7, height: innerSize * 0.7 }]}>
        {showLabel && (
          <Text style={[styles.phaseLabel, { color }]}>
            {phaseLabels[phase]}
          </Text>
        )}
      </View>
    </View>
  );
};

// Guided breathing component that cycles through phases automatically
interface GuidedBreathingProps {
  size?: number;
  cycles?: number;
  onCycleComplete?: () => void;
  onComplete?: () => void;
  inhaleSeconds?: number;
  holdSeconds?: number;
  exhaleSeconds?: number;
  restSeconds?: number;
}

export const GuidedBreathing: React.FC<GuidedBreathingProps> = ({
  size = 150,
  cycles = 3,
  onCycleComplete,
  onComplete,
  inhaleSeconds = 4,
  holdSeconds = 4,
  exhaleSeconds = 4,
  restSeconds = 2,
}) => {
  const [currentPhase, setCurrentPhase] = React.useState<BreathingPhase>('rest');
  const [currentCycle, setCurrentCycle] = React.useState(0);
  const [countdown, setCountdown] = React.useState(0);
  const [isActive, setIsActive] = React.useState(true);

  const phaseTimes: Record<BreathingPhase, number> = {
    inhale: inhaleSeconds,
    hold: holdSeconds,
    exhale: exhaleSeconds,
    rest: restSeconds,
  };

  useEffect(() => {
    if (!isActive) return;

    // Start with first phase
    setCurrentPhase('inhale');
    setCountdown(inhaleSeconds);
  }, [isActive]);

  useEffect(() => {
    if (!isActive || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Move to next phase
          const phases: BreathingPhase[] = ['inhale', 'hold', 'exhale', 'rest'];
          const currentIndex = phases.indexOf(currentPhase);
          const nextIndex = (currentIndex + 1) % phases.length;
          const nextPhase = phases[nextIndex];

          if (nextPhase === 'inhale') {
            // Completed a cycle
            const newCycle = currentCycle + 1;
            setCurrentCycle(newCycle);
            onCycleComplete?.();

            if (newCycle >= cycles) {
              setIsActive(false);
              onComplete?.();
              return 0;
            }
          }

          setCurrentPhase(nextPhase);
          return phaseTimes[nextPhase];
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPhase, currentCycle, countdown, isActive]);

  return (
    <View style={styles.guidedContainer}>
      <BreathingCircle phase={currentPhase} size={size} isActive={isActive} />

      <View style={styles.guidedInfo}>
        <Text style={styles.countdownText}>{countdown}</Text>
        <Text style={styles.cycleText}>
          Cycle {currentCycle + 1}/{cycles}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    position: 'absolute',
  },
  mainCircle: {
    position: 'absolute',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseLabel: {
    ...typography.label,
    fontWeight: '600',
    textAlign: 'center',
  },
  guidedContainer: {
    alignItems: 'center',
  },
  guidedInfo: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  countdownText: {
    ...typography.h1,
    color: colors.text.primary,
    fontSize: 36,
  },
  cycleText: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});

export default BreathingCircle;
