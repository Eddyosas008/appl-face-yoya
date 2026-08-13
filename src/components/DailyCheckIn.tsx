import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { colors, borderRadius, spacing, typography } from '../theme';
import { FaceFeelRating } from '../types';

interface DailyCheckInProps {
  value?: FaceFeelRating;
  onChange: (value: FaceFeelRating) => void;
}

const feelings: Array<{
  id: FaceFeelRating;
  label: string;
  emoji: string;
  accessibilityLabel: string;
}> = [
  { id: 'tendu', label: 'Tendu', emoji: '😣', accessibilityLabel: 'Mon visage est tendu' },
  { id: 'normal', label: 'Neutre', emoji: '😐', accessibilityLabel: 'Mon visage se sent neutre' },
  { id: 'detendu', label: 'Détendu', emoji: '😌', accessibilityLabel: 'Mon visage est détendu' },
  { id: 'revitalise', label: 'En forme', emoji: '✨', accessibilityLabel: 'Mon visage se sent en forme' },
];

export const DailyCheckIn: React.FC<DailyCheckInProps> = ({ value, onChange }) => {
  return (
    <Card variant="outlined" padding="medium" style={styles.card}>
      <View style={styles.heading}>
        <View style={styles.iconWrap}>
          <Ionicons name="heart" size={18} color={colors.accent.coral} />
        </View>
        <View style={styles.headingText}>
          <Text style={styles.title}>Votre ressenti du jour</Text>
          <Text style={styles.subtitle}>Une réponse suffit pour ajuster votre pratique.</Text>
        </View>
      </View>

      <View style={styles.options} accessibilityRole="radiogroup">
        {feelings.map((feeling) => {
          const isSelected = value === feeling.id;
          return (
            <TouchableOpacity
              key={feeling.id}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => onChange(feeling.id)}
              accessibilityRole="radio"
              accessibilityLabel={feeling.accessibilityLabel}
              accessibilityState={{ selected: isSelected }}
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
