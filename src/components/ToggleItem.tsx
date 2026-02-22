import React, { memo } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';

interface ToggleItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  color?: string;
  accessibilityLabel?: string;
}

export const ToggleItem: React.FC<ToggleItemProps> = memo(({
  icon,
  label,
  value,
  onValueChange,
  color,
  accessibilityLabel,
}) => (
  <View style={styles.container} accessibilityRole="switch" accessibilityState={{ checked: value }}>
    <View
      style={[
        styles.iconContainer,
        { backgroundColor: (color || colors.accent.green) + '20' },
      ]}
    >
      <Ionicons name={icon} size={20} color={color || colors.accent.green} />
    </View>
    <View style={styles.content}>
      <Text style={styles.label}>{label}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{
        false: colors.background.elevated,
        true: colors.accent.green + '50',
      }}
      thumbColor={value ? colors.accent.green : colors.text.muted}
      accessibilityLabel={accessibilityLabel || label}
    />
  </View>
));

ToggleItem.displayName = 'ToggleItem';

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
});

export default ToggleItem;
