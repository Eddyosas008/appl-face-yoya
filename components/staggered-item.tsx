import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface StaggeredItemProps {
  /** Index de l'élément dans la liste — détermine le délai d'animation */
  index: number;
  /** Délai de base entre chaque élément en ms (défaut : 60ms) */
  staggerDelay?: number;
  /** Délai initial avant le début des animations (défaut : 80ms) */
  initialDelay?: number;
  /** Durée de l'animation en ms (défaut : 350ms) */
  duration?: number;
  /** Distance de translation verticale initiale en px (défaut : 20) */
  translateY?: number;
  children: React.ReactNode;
  style?: object;
}

/**
 * Composant qui anime son contenu avec un fade-in + slide-up décalé selon l'index.
 *
 * Usage :
 * ```tsx
 * {meditations.map((item, index) => (
 *   <StaggeredItem key={item.id} index={index}>
 *     <MeditationCard item={item} />
 *   </StaggeredItem>
 * ))}
 * ```
 */
export function StaggeredItem({
  index,
  staggerDelay = 60,
  initialDelay = 80,
  duration = 350,
  translateY: translateYAmount = 20,
  children,
  style,
}: StaggeredItemProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(translateYAmount);

  useEffect(() => {
    const delay = initialDelay + index * staggerDelay;
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Pas de flex par défaut — le parent contrôle la mise en page
  },
});
