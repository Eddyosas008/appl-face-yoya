import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius } from '../theme';

interface SkeletonLoaderProps {
  width: number | string;
  height: number;
  borderRadiusValue?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width,
  height,
  borderRadiusValue = borderRadius.md,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: borderRadiusValue,
          opacity,
        },
        style,
      ]}
    />
  );
};

/**
 * Preset skeleton layouts for common patterns
 */
export const CardSkeleton: React.FC = () => (
  <View style={styles.cardSkeleton}>
    <SkeletonLoader width="60%" height={16} />
    <SkeletonLoader width="40%" height={12} style={styles.spacer} />
    <SkeletonLoader width="100%" height={40} style={styles.spacerLarge} />
  </View>
);

export const ListItemSkeleton: React.FC = () => (
  <View style={styles.listItemSkeleton}>
    <SkeletonLoader width={48} height={48} borderRadiusValue={24} />
    <View style={styles.listItemContent}>
      <SkeletonLoader width="70%" height={14} />
      <SkeletonLoader width="50%" height={10} style={styles.spacer} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.background.elevated,
  },
  spacer: {
    marginTop: 8,
  },
  spacerLarge: {
    marginTop: 16,
  },
  cardSkeleton: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    padding: 20,
    marginBottom: 12,
  },
  listItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
});

export default SkeletonLoader;
