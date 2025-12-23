import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Card, ProgramCard, Button, ProgressCircle } from '../components';
import { useStore } from '../store/useStore';
import { programs } from '../data/programs';

interface ProgramsScreenProps {
  navigation: any;
}

type FilterType = 'all' | 'debutant' | 'intermediaire' | 'short';

export const ProgramsScreen: React.FC<ProgramsScreenProps> = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const { user, startProgram } = useStore();
  const { progress } = user;

  // Get current program
  const currentProgram = progress.currentProgramId
    ? programs.find((p) => p.id === progress.currentProgramId)
    : null;

  // Filter programs
  const getFilteredPrograms = () => {
    switch (activeFilter) {
      case 'debutant':
        return programs.filter((p) => p.difficulty === 'debutant');
      case 'intermediaire':
        return programs.filter((p) => p.difficulty === 'intermediaire');
      case 'short':
        return programs.filter((p) => p.duration <= 14);
      default:
        return programs;
    }
  };

  const filteredPrograms = getFilteredPrograms();

  // Calculate program progress
  const getProgramProgress = (programId: string): number => {
    if (progress.completedPrograms.includes(programId)) {
      return 1;
    }
    if (
      progress.currentProgramId === programId &&
      progress.currentProgramProgress
    ) {
      const program = programs.find((p) => p.id === programId);
      if (program) {
        return progress.currentProgramProgress.completedDays.length / program.duration;
      }
    }
    return 0;
  };

  const handleProgramPress = (programId: string) => {
    navigation.navigate('ProgramDetail', { programId });
  };

  const handleStartProgram = (programId: string) => {
    startProgram(programId);
    navigation.navigate('ProgramDetail', { programId });
  };

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'Tous' },
    { id: 'debutant', label: 'Débutant' },
    { id: 'intermediaire', label: 'Intermédiaire' },
    { id: 'short', label: 'Courts' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Programmes</Text>
          <Text style={styles.headerSubtitle}>
            Des routines guidées pour atteindre vos objectifs
          </Text>
        </View>

        {/* Current Program Card */}
        {currentProgram && (
          <View style={styles.currentProgramSection}>
            <Text style={styles.sectionTitle}>Programme en cours</Text>
            <Card variant="elevated" padding="large" style={styles.currentProgramCard}>
              <View style={styles.currentProgramHeader}>
                <View style={styles.currentProgramInfo}>
                  <Text style={styles.currentProgramName}>
                    {currentProgram.name}
                  </Text>
                  <Text style={styles.currentProgramMeta}>
                    Jour {progress.currentProgramProgress?.currentDay || 1} sur{' '}
                    {currentProgram.duration}
                  </Text>
                </View>
                <ProgressCircle
                  progress={getProgramProgress(currentProgram.id)}
                  size={64}
                  strokeWidth={6}
                />
              </View>

              <View style={styles.currentProgramProgress}>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${
                          ((progress.currentProgramProgress?.completedDays.length || 0) /
                            currentProgram.duration) *
                          100
                        }%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {progress.currentProgramProgress?.completedDays.length || 0} jours
                  complétés
                </Text>
              </View>

              <Button
                title="Continuer"
                onPress={() => handleProgramPress(currentProgram.id)}
                fullWidth
                icon={
                  <Ionicons
                    name="play"
                    size={18}
                    color={colors.background.primary}
                    style={{ marginRight: spacing.sm }}
                  />
                }
              />
            </Card>
          </View>
        )}

        {/* Filters */}
        <View style={styles.filtersSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  activeFilter === filter.id && styles.filterChipActive,
                ]}
                onPress={() => setActiveFilter(filter.id)}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    activeFilter === filter.id && styles.filterLabelActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Programs List */}
        <View style={styles.programsList}>
          {filteredPrograms.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              onPress={() => handleProgramPress(program.id)}
              progress={getProgramProgress(program.id)}
              isActive={progress.currentProgramId === program.id}
              showProgress
            />
          ))}
        </View>

        {/* Empty State */}
        {filteredPrograms.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="search-outline"
              size={48}
              color={colors.text.muted}
            />
            <Text style={styles.emptyStateText}>
              Aucun programme ne correspond à ce filtre
            </Text>
          </View>
        )}

        {/* Info Card */}
        <Card variant="outlined" padding="large" style={styles.infoCard}>
          <View style={styles.infoContent}>
            <Ionicons
              name="information-circle"
              size={24}
              color={colors.accent.teal}
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Comment choisir ?</Text>
              <Text style={styles.infoText}>
                Commencez par le programme "Découverte" si vous débutez. Vous
                pourrez ensuite explorer les programmes plus spécifiques selon
                vos objectifs.
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.huge,
  },
  // Header
  header: {
    marginBottom: spacing.xl,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.text.primary,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  // Current Program
  currentProgramSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  currentProgramCard: {
    borderWidth: 1,
    borderColor: colors.accent.green,
  },
  currentProgramHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  currentProgramInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  currentProgramName: {
    ...typography.h3,
    color: colors.text.primary,
  },
  currentProgramMeta: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  currentProgramProgress: {
    marginBottom: spacing.lg,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.background.elevated,
    borderRadius: 3,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent.green,
    borderRadius: 3,
  },
  progressText: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  // Filters
  filtersSection: {
    marginBottom: spacing.lg,
  },
  filtersContainer: {
    paddingRight: spacing.lg,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.accent.green,
  },
  filterLabel: {
    ...typography.label,
    color: colors.text.secondary,
  },
  filterLabelActive: {
    color: colors.background.primary,
  },
  // Programs List
  programsList: {
    marginBottom: spacing.xl,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.text.muted,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  // Info Card
  infoCard: {
    backgroundColor: colors.accent.teal + '05',
    borderColor: colors.accent.teal + '30',
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  infoTitle: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
});

export default ProgramsScreen;
