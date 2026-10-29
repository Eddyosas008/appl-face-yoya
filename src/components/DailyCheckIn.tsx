import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { colors, borderRadius, spacing, typography } from '../theme';
import { FaceFeelRating } from '../types';
import { FACE_FEEL_OPTIONS } from '../data/labels';

interface DailyCheckInProps {
  value?: FaceFeelRating;
  onChange: (value: FaceFeelRating) => void;
  title?: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
}

export const DailyCheckIn: React.FC<DailyCheckInProps> = ({
  value,
  onChange,
  title = 'Votre ressenti du jour',
  subtitle = 'Une réponse suffit pour ajuster votre pratique.',
  style,
}) => {
  return (
    <Card variant="outlined" padding="medium" style={[styles.card, style]}>
      <View style={styles.heading}>
        <View style={styles.iconWrap}>
          <Ionicons name="heart" size={18} color={colors.accent.coral} />
        </View>
        <View style={styles.headingText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <View style={styles.options} accessibilityRole="radiogroup">
        {FACE_FEEL_OPTIONS.map((feeling) => {
          const isSelected = value === feeling.id;
          return (
            <TouchableOpacity
              key={feeling.id}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => onChange(feeling.id)}
              accessibilityRole="radio"
              accessibilityLabel={feeling.description ?? feeling.label}
              accessibilityState={{ checked: isSelected, selected: isSelected }}
              activeOpacity={0.8}
            >
              <Text style={styles.emoji}>{feeling.emoji}</Text>
              <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                {feeling.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderColor: colors.accent.coral + '45',
    backgroundColor: colors.accent.coral + '0A',
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent.coral + '1F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headingText: {
    flex: 1,
  },
  title: {
    ...typography.label,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 1,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    alignItems: 'center',
    flex: 1,
    minWidth: 58,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: colors.background.elevated,
    borderColor: colors.accent.coral,
  },
  emoji: {
    fontSize: 23,
    marginBottom: 3,
  },
  optionLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: colors.text.primary,
    fontWeight: '600',
  },
});

export default DailyCheckIn;
