import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Exercise } from '../types';
import Card from './Card';

interface ExerciseCardProps {
  exercise: Exercise;
  onPress?: () => void;
  showDuration?: boolean;
  showZone?: boolean;
  completed?: boolean;
  compact?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (exerciseId: string) => void;
}

const zoneLabels: { [key: string]: string } = {
  front: 'Front',
  yeux: 'Yeux',
  joues: 'Joues',
  bouche: 'Bouche',
  ovale: 'Ovale',
  cou: 'Cou',
  global: 'Global',
};

const zoneIcons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
  front: 'ellipse-outline',
  yeux: 'eye-outline',
  joues: 'happy-outline',
  bouche: 'chatbubble-outline',
  ovale: 'scan-outline',
  cou: 'body-outline',
  global: 'body-outline',
};

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

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onPress,
  showDuration = true,
  showZone = true,
  completed = false,
  compact = false,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  if (compact) {
    return (
      <Card
        onPress={onPress}
        variant="default"
        padding="small"
        style={styles.compactCard}
      >
        <View style={styles.compactContent}>
          <View style={styles.compactIconContainer}>
            <Ionicons
              name={zoneIcons[exercise.zone]}
              size={20}
              color={colors.accent.green}
            />
          </View>
          <View style={styles.compactTextContainer}>
            <Text style={styles.compactTitle} numberOfLines={1}>
              {exercise.name}
            </Text>
            <Text style={styles.compactDuration}>
              {formatDuration(exercise.duration)}
            </Text>
          </View>
          {completed && (
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.accent.green}
            />
          )}
        </View>
      </Card>
    );
  }

  const diffColor = difficultyColors[exercise.difficulty] || colors.text.secondary;

  return (
    <Card
      onPress={onPress}
      variant="default"
      padding="medium"
      style={styles.card}
      accessibilityLabel={`${exercise.name}, ${zoneLabels[exercise.zone]}, ${difficultyLabels[exercise.difficulty]}, ${formatDuration(exercise.duration)}`}
    >
      <View style={styles.content}>
        {/* Image placeholder */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Ionicons
              name={zoneIcons[exercise.zone]}
              size={32}
              color={colors.accent.green}
            />
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {exercise.name}
          </Text>

          <View style={styles.metaContainer}>
            {showZone && (
              <View style={styles.zoneBadge}>
                <Text style={styles.zoneText}>{zoneLabels[exercise.zone]}</Text>
              </View>
            )}

            <View style={[styles.difficultyBadge, { backgroundColor: diffColor + '20' }]}>
              <Text style={[styles.difficultyText, { color: diffColor }]}>
                {difficultyLabels[exercise.difficulty]}
              </Text>
            </View>

            {showDuration && (
              <View style={styles.durationContainer}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={colors.text.secondary}
                />
                <Text style={styles.durationText}>
                  {formatDuration(exercise.duration)}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {exercise.description}
          </Text>
        </View>

        {/* Status indicators */}
        <View style={styles.statusContainer}>
          {onToggleFavorite && (
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={(e) => {
                e.stopPropagation?.();
                onToggleFavorite(exercise.id);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite ? colors.accent.coral : colors.text.muted}
              />
            </TouchableOpacity>
          )}
          {completed && (
            <View style={styles.completedIndicator} accessibilityLabel="Exercice complété">
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={colors.accent.green}
              />
            </View>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  content: {
    flexDirection: 'row',
  },
  imageContainer: {
    marginRight: spacing.md,
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  zoneBadge: {
    backgroundColor: colors.accent.green + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  zoneText: {
    ...typography.labelSmall,
    color: colors.accent.green,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  difficultyText: {
    ...typography.labelSmall,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  description: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
  },
  statusContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: spacing.sm,
  },
  favoriteButton: {
    padding: spacing.xs,
  },
  completedIndicator: {
    marginTop: spacing.xs,
  },
  // Compact styles
  compactCard: {
    marginBottom: spacing.sm,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  compactTextContainer: {
    flex: 1,
  },
  compactTitle: {
    ...typography.label,
    color: colors.text.primary,
  },
  compactDuration: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
});

export default ExerciseCard;
