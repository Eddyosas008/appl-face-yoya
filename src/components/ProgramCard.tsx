import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Program } from '../types';
import Card from './Card';
import ProgressCircle from './ProgressCircle';

interface ProgramCardProps {
  program: Program;
  onPress?: () => void;
  progress?: number; // 0 to 1
  isActive?: boolean;
  showProgress?: boolean;
}

const difficultyLabels: { [key: string]: string } = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
};

const difficultyColors: { [key: string]: string } = {
  debutant: colors.accent.green,
  intermediaire: colors.accent.gold,
  avance: colors.accent.coral,
};

export const ProgramCard: React.FC<ProgramCardProps> = ({
  program,
  onPress,
  progress = 0,
  isActive = false,
  showProgress = true,
}) => {
  return (
    <Card
      onPress={onPress}
      variant={isActive ? 'elevated' : 'default'}
      padding="medium"
      style={[styles.card, isActive && styles.activeCard]}
    >
      <View style={styles.content}>
        {/* Left side - Info */}
        <View style={styles.infoContainer}>
          {/* Header with badges */}
          <View style={styles.headerRow}>
            {program.isRecommended && (
              <View style={styles.recommendedBadge}>
                <Ionicons name="star" size={12} color={colors.accent.gold} />
                <Text style={styles.recommendedText}>Recommandé</Text>
              </View>
            )}
            {isActive && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeText}>En cours</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {program.name}
          </Text>

          {/* Meta info */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={colors.text.secondary}
              />
              <Text style={styles.metaText}>{program.duration} jours</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons
                name="time-outline"
                size={14}
                color={colors.text.secondary}
              />
              <Text style={styles.metaText}>{program.dailyDuration} min/jour</Text>
            </View>
          </View>

          {/* Difficulty badge */}
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: difficultyColors[program.difficulty] + '20' },
            ]}
          >
            <Text
              style={[
                styles.difficultyText,
                { color: difficultyColors[program.difficulty] },
              ]}
            >
              {difficultyLabels[program.difficulty]}
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
            {program.description}
          </Text>
        </View>

        {/* Right side - Progress */}
        {showProgress && (
          <View style={styles.progressContainer}>
            <ProgressCircle
              progress={progress}
              size={60}
              strokeWidth={6}
              color={isActive ? colors.accent.green : colors.text.muted}
              backgroundColor={colors.background.elevated}
            />
          </View>
        )}
      </View>

      {/* Arrow indicator */}
      <View style={styles.arrowContainer}>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.text.tertiary}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  activeCard: {
    borderWidth: 1,
    borderColor: colors.accent.green,
  },
  content: {
    flexDirection: 'row',
  },
  infoContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.gold + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  recommendedText: {
    ...typography.caption,
    color: colors.accent.gold,
    marginLeft: spacing.xs,
  },
  activeBadge: {
    backgroundColor: colors.accent.green + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  activeText: {
    ...typography.caption,
    color: colors.accent.green,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  metaText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  difficultyText: {
    ...typography.caption,
    fontWeight: '500',
  },
  description: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
  },
  progressContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowContainer: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
});

export default ProgramCard;
