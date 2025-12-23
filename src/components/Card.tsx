import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  variant = 'default',
  padding = 'medium',
  style,
}) => {
  const getCardStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
    };

    // Padding
    switch (padding) {
      case 'none':
        break;
      case 'small':
        base.padding = spacing.sm;
        break;
      case 'large':
        base.padding = spacing.xl;
        break;
      default:
        base.padding = spacing.lg;
    }

    // Variant
    switch (variant) {
      case 'elevated':
        base.backgroundColor = colors.background.elevated;
        Object.assign(base, shadows.md);
        break;
      case 'outlined':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1;
        base.borderColor = colors.border.light;
        break;
      default:
        base.backgroundColor = colors.background.tertiary;
    }

    return base;
  };

  const cardStyle = getCardStyle();

  if (onPress) {
    return (
      <TouchableOpacity
        style={[cardStyle, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};

export default Card;
