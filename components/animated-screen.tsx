import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, ViewProps } from "react-native";

export interface AnimatedScreenProps extends ViewProps {
  /** Animation preset. Defaults to "fadeSlideUp" */
  preset?: "fadeSlideUp" | "fadeIn" | "slideFromRight" | "slideFromBottom" | "scaleIn";
  /** Delay before animation starts (ms). Defaults to 0 */
  delay?: number;
  /** Duration of the animation (ms). Defaults to 320 */
  duration?: number;
  /** Vertical offset for slideUp (px). Defaults to 24 */
  slideOffset?: number;
  children?: React.ReactNode;
}

/**
 * AnimatedScreen — wraps screen content with a smooth entrance animation.
 *
 * Usage:
 * ```tsx
 * <AnimatedScreen preset="fadeSlideUp">
 *   <YourContent />
 * </AnimatedScreen>
 * ```
 */
export function AnimatedScreen({
  preset = "fadeSlideUp",
  delay = 0,
  duration = 320,
  slideOffset = 24,
  children,
  style,
  ...props
}: AnimatedScreenProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(
    new Animated.Value(
      preset === "fadeSlideUp" || preset === "slideFromBottom" ? slideOffset : 0
    )
  ).current;
  const translateX = useRef(
    new Animated.Value(preset === "slideFromRight" ? 40 : 0)
  ).current;
  const scale = useRef(
    new Animated.Value(preset === "scaleIn" ? 0.94 : 1)
  ).current;

  useEffect(() => {
    const animations: Animated.CompositeAnimation[] = [
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ];

    if (preset === "fadeSlideUp" || preset === "slideFromBottom") {
      animations.push(
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          delay,
          useNativeDriver: true,
        })
      );
    }

    if (preset === "slideFromRight") {
      animations.push(
        Animated.timing(translateX, {
          toValue: 0,
          duration,
          delay,
          useNativeDriver: true,
        })
      );
    }

    if (preset === "scaleIn") {
      animations.push(
        Animated.timing(scale, {
          toValue: 1,
          duration,
          delay,
          useNativeDriver: true,
        })
      );
    }

    Animated.parallel(animations).start();
  }, []);

  const transform: any[] = [];
  if (preset === "fadeSlideUp" || preset === "slideFromBottom") {
    transform.push({ translateY });
  }
  if (preset === "slideFromRight") {
    transform.push({ translateX });
  }
  if (preset === "scaleIn") {
    transform.push({ scale });
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity, transform },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

/**
 * AnimatedItem — animates a single item with a staggered delay.
 * Useful for lists or cards that should appear one after another.
 *
 * Usage:
 * ```tsx
 * {items.map((item, i) => (
 *   <AnimatedItem key={item.id} index={i}>
 *     <Card item={item} />
 *   </AnimatedItem>
 * ))}
 * ```
 */
export function AnimatedItem({
  index = 0,
  duration = 280,
  stagger = 60,
  children,
  style,
  ...props
}: {
  index?: number;
  duration?: number;
  stagger?: number;
  children?: React.ReactNode;
} & ViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    const delay = index * stagger;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  return (
    <Animated.View
      style={[{ opacity, transform: [{ translateY }] }, style]}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
