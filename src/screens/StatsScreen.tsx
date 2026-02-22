import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Card, ProgressCircle } from '../components';
import { useStore } from '../store/useStore';
import { exercises } from '../data/exercises';
import { FaceZone, RootStackNavigationProp } from '../types';

const { width } = Dimensions.get('window');

interface StatsScreenProps {
  navigation: RootStackNavigationProp;
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

const zoneColors: { [key: string]: string } = {
  front: colors.accent.green,
  yeux: colors.accent.teal,
  joues: colors.accent.coral,
  bouche: colors.accent.gold,
  ovale: colors.accent.green,
  cou: colors.accent.teal,
  global: colors.text.secondary,
};

export const StatsScreen: React.FC<StatsScreenProps> = ({ navigation }) => {
  const { user, sessionHistory, favoriteExercises } = useStore();
  const { progress } = user;

  // Calculate zone statistics
  const zoneStats = useMemo(() => {
    const zones: { [key: string]: number } = {};

    sessionHistory.forEach((session) => {
      session.exercises.forEach((ex) => {
        const exercise = exercises.find((e) => e.id === ex.exerciseId);
        if (exercise && !ex.skipped) {
          zones[exercise.zone] = (zones[exercise.zone] || 0) + 1;
        }
      });
    });

    return Object.entries(zones)
      .map(([zone, count]) => ({ zone, count }))
      .sort((a, b) => b.count - a.count);
  }, [sessionHistory]);

  // Calculate weekly activity
  const weeklyActivity = useMemo(() => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const activity = new Array(7).fill(0);

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    sessionHistory.forEach((session) => {
      const sessionDate = new Date(session.date);
      if (sessionDate >= weekStart) {
        const dayIndex = sessionDate.getDay();
        activity[dayIndex] += session.totalDuration;
      }
    });

    return days.map((day, index) => ({
      day,
      minutes: activity[index],
      isToday: index === now.getDay(),
    }));
  }, [sessionHistory]);

  // Calculate insights
  const insights = useMemo(() => {
    const result: { icon: keyof typeof Ionicons.glyphMap; text: string; color: string }[] = [];

    // Streak insight
    if (progress.currentStreak >= 7) {
      result.push({
        icon: 'flame',
        text: `Incroyable ! ${progress.currentStreak} jours consécutifs de pratique !`,
        color: colors.accent.gold,
      });
    } else if (progress.currentStreak >= 3) {
      result.push({
        icon: 'flame',
        text: `Belle régularité ! ${progress.currentStreak} jours d'affilée.`,
        color: colors.accent.gold,
      });
    }

    // Total time insight
    const totalHours = Math.floor(progress.totalMinutes / 60);
    if (totalHours >= 1) {
      result.push({
        icon: 'time',
        text: `Vous avez pratiqué ${totalHours}h${progress.totalMinutes % 60}min au total !`,
        color: colors.accent.teal,
      });
    }

    // Favorite zone insight
    if (zoneStats.length > 0) {
      result.push({
        icon: 'heart',
        text: `Zone la plus travaillée : ${zoneLabels[zoneStats[0].zone]}`,
        color: colors.accent.coral,
      });
    }

    // Exercises explored
    const completedPercent = Math.round((progress.completedExercises.length / exercises.length) * 100);
    if (completedPercent >= 50) {
      result.push({
        icon: 'trophy',
        text: `Vous avez exploré ${completedPercent}% des exercices !`,
        color: colors.accent.green,
      });
    }

    // Badges earned
    if (progress.badges.length > 0) {
      result.push({
        icon: 'ribbon',
        text: `${progress.badges.length} badge(s) obtenu(s). Continuez !`,
        color: colors.accent.gold,
      });
    }

    return result;
  }, [progress, zoneStats]);

  // Max minutes for chart scaling
  const maxMinutes = Math.max(...weeklyActivity.map((d) => d.minutes), 1);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statistiques</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview Cards */}
        <View style={styles.overviewGrid}>
          <Card variant="elevated" padding="medium" style={styles.overviewCard}>
            <Ionicons name="flame" size={28} color={colors.accent.gold} />
            <Text style={styles.overviewValue}>{progress.currentStreak}</Text>
            <Text style={styles.overviewLabel}>Streak actuel</Text>
          </Card>

          <Card variant="elevated" padding="medium" style={styles.overviewCard}>
            <Ionicons name="trophy" size={28} color={colors.accent.teal} />
            <Text style={styles.overviewValue}>{progress.longestStreak}</Text>
            <Text style={styles.overviewLabel}>Meilleur streak</Text>
          </Card>

          <Card variant="elevated" padding="medium" style={styles.overviewCard}>
            <Ionicons name="fitness" size={28} color={colors.accent.green} />
            <Text style={styles.overviewValue}>{progress.totalSessions}</Text>
            <Text style={styles.overviewLabel}>Séances totales</Text>
          </Card>

          <Card variant="elevated" padding="medium" style={styles.overviewCard}>
            <Ionicons name="time" size={28} color={colors.accent.coral} />
            <Text style={styles.overviewValue}>{progress.totalMinutes}</Text>
            <Text style={styles.overviewLabel}>Minutes totales</Text>
          </Card>
        </View>

        {/* Weekly Activity */}
        <Text style={styles.sectionTitle}>Activité de la semaine</Text>
        <Card variant="default" padding="large" style={styles.chartCard}>
          <View style={styles.chartContainer}>
            {weeklyActivity.map((day, index) => (
              <View key={index} style={styles.chartBar}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: day.minutes > 0 ? (day.minutes / maxMinutes) * 100 : 4,
                        backgroundColor: day.isToday ? colors.accent.green : colors.accent.teal,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.chartLabel,
                    day.isToday && styles.chartLabelActive,
                  ]}
                >
                  {day.day}
                </Text>
                {day.minutes > 0 && (
                  <Text style={styles.chartValue}>{day.minutes}m</Text>
                )}
              </View>
            ))}
          </View>
        </Card>

        {/* Zone Distribution */}
        {zoneStats.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Zones travaillées</Text>
            <Card variant="default" padding="large" style={styles.zonesCard}>
              {zoneStats.slice(0, 5).map((stat, index) => {
                const total = zoneStats.reduce((sum, s) => sum + s.count, 0);
                const percentage = Math.round((stat.count / total) * 100);
                return (
                  <View key={stat.zone} style={styles.zoneRow}>
                    <View style={styles.zoneInfo}>
                      <View
                        style={[
                          styles.zoneDot,
                          { backgroundColor: zoneColors[stat.zone] },
                        ]}
                      />
                      <Text style={styles.zoneName}>{zoneLabels[stat.zone]}</Text>
                    </View>
                    <View style={styles.zoneBarContainer}>
                      <View
                        style={[
                          styles.zoneBar,
                          {
                            width: `${percentage}%`,
                            backgroundColor: zoneColors[stat.zone],
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.zonePercentage}>{percentage}%</Text>
                  </View>
                );
              })}
            </Card>
          </>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Insights</Text>
            {insights.map((insight, index) => (
              <Card
                key={index}
                variant="outlined"
                padding="medium"
                style={[styles.insightCard, { borderColor: insight.color + '30' }]}
              >
                <View style={styles.insightContent}>
                  <View
                    style={[
                      styles.insightIcon,
                      { backgroundColor: insight.color + '20' },
                    ]}
                  >
                    <Ionicons name={insight.icon} size={20} color={insight.color} />
                  </View>
                  <Text style={styles.insightText}>{insight.text}</Text>
                </View>
              </Card>
            ))}
          </>
        )}

        {/* Exploration Progress */}
        <Text style={styles.sectionTitle}>Exploration</Text>
        <Card variant="default" padding="large" style={styles.explorationCard}>
          <View style={styles.explorationRow}>
            <View style={styles.explorationItem}>
              <ProgressCircle
                progress={progress.completedExercises.length / exercises.length}
                size={80}
                strokeWidth={8}
                showPercentage
              />
              <Text style={styles.explorationLabel}>Exercices</Text>
              <Text style={styles.explorationValue}>
                {progress.completedExercises.length}/{exercises.length}
              </Text>
            </View>

            <View style={styles.explorationItem}>
              <ProgressCircle
                progress={progress.badges.length / 10}
                size={80}
                strokeWidth={8}
                showPercentage
              />
              <Text style={styles.explorationLabel}>Badges</Text>
              <Text style={styles.explorationValue}>
                {progress.badges.length}/10
              </Text>
            </View>

            <View style={styles.explorationItem}>
              <View style={styles.favoritesCircle}>
                <Ionicons name="heart" size={32} color={colors.accent.coral} />
              </View>
              <Text style={styles.explorationLabel}>Favoris</Text>
              <Text style={styles.explorationValue}>
                {favoriteExercises.length}
              </Text>
            </View>
          </View>
        </Card>

        {/* Empty state if no data */}
        {sessionHistory.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="bar-chart-outline" size={64} color={colors.text.muted} />
            <Text style={styles.emptyStateTitle}>Pas encore de données</Text>
            <Text style={styles.emptyStateText}>
              Complétez quelques séances pour voir vos statistiques ici !
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  // Overview Grid
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  overviewCard: {
    width: (width - spacing.lg * 2 - spacing.xs * 4) / 2,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  overviewValue: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  overviewLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  // Chart
  chartCard: {
    marginBottom: spacing.md,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  barContainer: {
    height: 100,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '80%',
    borderRadius: borderRadius.sm,
    minHeight: 4,
  },
  chartLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  chartLabelActive: {
    color: colors.accent.green,
    fontWeight: '600',
  },
  chartValue: {
    ...typography.labelSmall,
    color: colors.text.secondary,
    marginTop: 2,
  },
  // Zones
  zonesCard: {
    marginBottom: spacing.md,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  zoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  zoneDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  zoneName: {
    ...typography.label,
    color: colors.text.primary,
  },
  zoneBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.sm,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
  },
  zoneBar: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  zonePercentage: {
    ...typography.label,
    color: colors.text.secondary,
    width: 40,
    textAlign: 'right',
  },
  // Insights
  insightCard: {
    marginBottom: spacing.sm,
  },
  insightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  insightText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  // Exploration
  explorationCard: {
    marginBottom: spacing.xl,
  },
  explorationRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  explorationItem: {
    alignItems: 'center',
  },
  explorationLabel: {
    ...typography.label,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  explorationValue: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  favoritesCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent.coral + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
  },
  emptyStateTitle: {
    ...typography.h4,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.text.muted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

export default StatsScreen;
