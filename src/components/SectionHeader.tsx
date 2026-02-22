import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: object;
}

export const SectionHeader: React.FC<SectionHeaderProps> = memo(({
  title,
  actionLabel,
  onAction,
  style,
}) => (
  <View style={[styles.container, style]}>
    <Text style={styles.title}>{title}</Text>
    {actionLabel && onAction && (
      <TouchableOpacity
        onPress={onAction}
        style={styles.actionButton}
        accessibilityLabel={actionLabel}
        accessibilityRole="button"
      >
        <Text style={styles.actionLabel}>{actionLabel}</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.accent.green} />
      </TouchableOpacity>
    )}
  </View>
));

SectionHeader.displayName = 'SectionHeader';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  title: {
    ...typography.label,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionLabel: {
    ...typography.label,
    color: colors.accent.green,
    marginRight: spacing.xs,
  },
});

export default SectionHeader;
