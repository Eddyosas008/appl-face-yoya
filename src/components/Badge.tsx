import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Badge as BadgeType } from '../types';

interface BadgeComponentProps {
  badge: BadgeType;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  earned?: boolean;
}

const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
  leaf: 'leaf',
  calendar: 'calendar',
  star: 'star',
  award: 'ribbon',
  trophy: 'trophy',
  play: 'play-circle',
  heart: 'heart',
  smile: 'happy',
  sun: 'sunny',
  crown: 'diamond',
  compass: 'compass',
  search: 'search',
  map: 'map',
  flag: 'flag',
  target: 'analytics',
  clock: 'time',
  hourglass: 'hourglass',
  zap: 'flash',
  sunrise: 'sunny',
  feather: 'leaf',
};

export const BadgeComponent: React.FC<BadgeComponentProps> = ({
  badge,
  size = 'medium',
  showName = true,
  earned = true,
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { container: 48, icon: 20 };
      case 'large':
        return { container: 80, icon: 36 };
      default:
        return { container: 64, icon: 28 };
    }
  };

  const sizeStyles = getSizeStyles();
  const iconName = iconMap[badge.iconName] || 'ribbon';

  const getCategoryColor = () => {
    switch (badge.category) {
      case 'streak':
        return colors.accent.gold;
      case 'completion':
        return colors.accent.green;
      case 'exploration':
        return colors.accent.teal;
      case 'milestone':
        return colors.primary[400];
      default:
        return colors.accent.green;
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badgeContainer,
          {
            width: sizeStyles.container,
            height: sizeStyles.container,
            borderRadius: sizeStyles.container / 2,
            backgroundColor: earned
              ? getCategoryColor() + '20'
              : colors.background.elevated,
            borderColor: earned ? getCategoryColor() : colors.border.light,
          },
        ]}
      >
        <Ionicons
          name={iconName}
          size={sizeStyles.icon}
          color={earned ? getCategoryColor() : colors.text.muted}
        />
      </View>
      {showName && (
        <Text
          style={[
            styles.badgeName,
            !earned && styles.badgeNameUnearned,
            size === 'small' && styles.badgeNameSmall,
          ]}
          numberOfLines={2}
        >
          {badge.name}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    maxWidth: 80,
  },
  badgeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  badgeName: {
    ...typography.labelSmall,
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  badgeNameUnearned: {
    color: colors.text.muted,
  },
  badgeNameSmall: {
    fontSize: 10,
  },
});

export default BadgeComponent;
