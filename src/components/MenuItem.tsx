import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  color?: string;
  accessibilityLabel?: string;
}

export const MenuItem: React.FC<MenuItemProps> = memo(({
  icon,
  label,
  value,
  onPress,
  showArrow = true,
  color,
  accessibilityLabel,
}) => (
  <TouchableOpacity
    style={styles.container}
    onPress={onPress}
    disabled={!onPress}
    accessibilityLabel={accessibilityLabel || label}
    accessibilityRole="button"
  >
    <View
      style={[
        styles.iconContainer,
        { backgroundColor: (color || colors.accent.green) + '20' },
      ]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={color || colors.accent.green}
      />
    </View>
    <View style={styles.content}>
      <Text style={[styles.label, color ? { color } : undefined]}>{label}</Text>
      {value && <Text style={styles.value}>{value}</Text>}
    </View>
    {showArrow && onPress && (
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.text.tertiary}
      />
    )}
  </TouchableOpacity>
));

MenuItem.displayName = 'MenuItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  label: {
    ...typography.body,
    color: colors.text.primary,
  },
  value: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});

export default MenuItem;
