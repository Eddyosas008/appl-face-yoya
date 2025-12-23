import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.lg,
    };

    // Size styles
    switch (size) {
      case 'small':
        base.paddingHorizontal = spacing.md;
        base.paddingVertical = spacing.sm;
        break;
      case 'large':
        base.paddingHorizontal = spacing.xxl;
        base.paddingVertical = spacing.lg;
        break;
      default:
        base.paddingHorizontal = spacing.xl;
        base.paddingVertical = spacing.md;
    }

    // Variant styles
    switch (variant) {
      case 'secondary':
        base.backgroundColor = colors.background.elevated;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1;
        base.borderColor = colors.accent.green;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        break;
      default:
        base.backgroundColor = colors.accent.green;
    }

    if (disabled) {
      base.opacity = 0.5;
    }

    if (fullWidth) {
      base.width = '100%';
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      ...typography.button,
    };

    switch (size) {
      case 'small':
        base.fontSize = typography.buttonSmall.fontSize;
        break;
      case 'large':
        base.fontSize = 18;
        break;
    }

    switch (variant) {
      case 'primary':
        base.color = colors.background.primary;
        break;
      case 'secondary':
        base.color = colors.text.primary;
        break;
      case 'outline':
      case 'ghost':
        base.color = colors.accent.green;
        break;
    }

    return base;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.background.primary : colors.accent.green}
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[getTextStyle(), icon && { marginLeft: spacing.sm }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
