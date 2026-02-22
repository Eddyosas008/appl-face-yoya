import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '../theme';
import { ExerciseCard, EmptyState } from '../components';
import { useStore } from '../store/useStore';
import { exercises, getExercisesByZone, getSafeExercises } from '../data/exercises';
import { FaceZone, DifficultyLevel, MainTabScreenNavigationProp } from '../types';

interface LibraryScreenProps {
  navigation: MainTabScreenNavigationProp;
}

type ZoneFilter = 'all' | FaceZone;
type DifficultyFilter = 'all' | DifficultyLevel;
type SpecialFilter = 'favorites' | 'completed' | null;

const zoneOptions: { id: ZoneFilter; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'all', label: 'Tous', icon: 'grid-outline' },
  { id: 'front', label: 'Front', icon: 'ellipse-outline' },
  { id: 'yeux', label: 'Yeux', icon: 'eye-outline' },
  { id: 'joues', label: 'Joues', icon: 'happy-outline' },
  { id: 'bouche', label: 'Bouche', icon: 'chatbubble-outline' },
  { id: 'ovale', label: 'Ovale', icon: 'scan-outline' },
  { id: 'cou', label: 'Cou', icon: 'body-outline' },
];

const difficultyOptions: { id: DifficultyFilter; label: string; color: string }[] = [
  { id: 'all', label: 'Tous niveaux', color: colors.text.secondary },
  { id: 'debutant', label: 'Débutant', color: colors.accent.green },
  { id: 'intermediaire', label: 'Intermédiaire', color: colors.accent.gold },
  { id: 'avance', label: 'Avancé', color: colors.accent.coral },
];

export const LibraryScreen: React.FC<LibraryScreenProps> = ({ navigation }) => {
  const [selectedZone, setSelectedZone] = useState<ZoneFilter>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>('all');
  const [specialFilter, setSpecialFilter] = useState<SpecialFilter>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const { user, favoriteExercises, toggleFavoriteExercise } = useStore();

  // Debounce search to avoid filtering on every keystroke
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get safe exercises based on user's contraindications
  const safeExercises = useMemo(() => {
    return getSafeExercises(user.healthInfo.contraindications);
  }, [user.healthInfo.contraindications]);

  // Filter exercises (uses debounced search for performance)
  const filteredExercises = useMemo(() => {
    let result = safeExercises;

    // Filter by zone
    if (selectedZone !== 'all') {
      result = result.filter((ex) => ex.zone === selectedZone);
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      result = result.filter((ex) => ex.difficulty === selectedDifficulty);
    }

    // Filter by special (favorites/completed)
    if (specialFilter === 'favorites') {
      result = result.filter((ex) => favoriteExercises.includes(ex.id));
    } else if (specialFilter === 'completed') {
      result = result.filter((ex) => user.progress.completedExercises.includes(ex.id));
    }

    // Filter by search query (debounced)
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (ex) =>
          ex.name.toLowerCase().includes(query) ||
          ex.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [safeExercises, selectedZone, selectedDifficulty, specialFilter, debouncedSearch, favoriteExercises, user.progress.completedExercises]);

  // Check if exercise is completed
  const isExerciseCompleted = (exerciseId: string): boolean => {
    return user.progress.completedExercises.includes(exerciseId);
  };

  const handleExercisePress = useCallback((exerciseId: string) => {
    navigation.navigate('ExerciseDetail', { exerciseId });
  }, [navigation]);

  const handleToggleFavorite = useCallback((exerciseId: string) => {
    if (user.settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleFavoriteExercise(exerciseId);
  }, [user.settings.hapticEnabled, toggleFavoriteExercise]);

  const isFavorite = useCallback((exerciseId: string): boolean => {
    return favoriteExercises.includes(exerciseId);
  }, [favoriteExercises]);

  // Selection mode handlers
  const toggleSelectionMode = useCallback(() => {
    if (user.settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsSelectionMode((prev) => {
      if (prev) setSelectedExercises([]);
      return !prev;
    });
  }, [user.settings.hapticEnabled]);

  const toggleExerciseSelection = useCallback((exerciseId: string) => {
    if (user.settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedExercises((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    );
  }, [user.settings.hapticEnabled]);

  const isSelected = useCallback((exerciseId: string): boolean => {
    return selectedExercises.includes(exerciseId);
  }, [selectedExercises]);

  const handleStartCustomSession = useCallback(() => {
    if (selectedExercises.length === 0) return;
    if (user.settings.hapticEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    navigation.navigate('SessionPlayer', {
      exerciseIds: selectedExercises,
    });
    setIsSelectionMode(false);
    setSelectedExercises([]);
  }, [selectedExercises, user.settings.hapticEnabled, navigation]);

  // Calculate total duration of selected exercises
  const selectedTotalDuration = useMemo(() => {
    return selectedExercises.reduce((sum, id) => {
      const exercise = exercises.find((ex) => ex.id === id);
      return sum + (exercise?.duration || 0);
    }, 0);
  }, [selectedExercises]);

  // Group exercises by zone for display
  const groupedExercises = useMemo(() => {
    if (selectedZone !== 'all') return null;

    const groups: { [key: string]: typeof exercises } = {};
    filteredExercises.forEach((ex) => {
      if (!groups[ex.zone]) {
        groups[ex.zone] = [];
      }
      groups[ex.zone].push(ex);
    });
    return groups;
  }, [filteredExercises, selectedZone]);

  const getZoneLabel = (zone: string): string => {
    const option = zoneOptions.find((o) => o.id === zone);
    return option?.label || zone;
  };

  // Memoized exercise item renderer for FlatList
  const renderExerciseItem = useCallback(({ item: exercise }: { item: typeof exercises[0] }) => (
    <View style={styles.exerciseCardWrapper}>
      {isSelectionMode && (
        <TouchableOpacity
          style={styles.selectionCheckbox}
          onPress={() => toggleExerciseSelection(exercise.id)}
          accessibilityRole="checkbox"
          accessibilityLabel={exercise.name}
          accessibilityState={{ checked: isSelected(exercise.id) }}
        >
          <Ionicons
            name={isSelected(exercise.id) ? 'checkbox' : 'square-outline'}
            size={24}
            color={isSelected(exercise.id) ? colors.accent.green : colors.text.tertiary}
          />
        </TouchableOpacity>
      )}
      <View style={styles.exerciseCardContent}>
        <ExerciseCard
          exercise={exercise}
          onPress={() => isSelectionMode ? toggleExerciseSelection(exercise.id) : handleExercisePress(exercise.id)}
          completed={isExerciseCompleted(exercise.id)}
          isFavorite={isFavorite(exercise.id)}
          onToggleFavorite={isSelectionMode ? undefined : handleToggleFavorite}
        />
      </View>
    </View>
  ), [isSelectionMode, isSelected, isFavorite, handleExercisePress, handleToggleFavorite, toggleExerciseSelection, isExerciseCompleted]);

  const keyExtractor = useCallback((item: typeof exercises[0]) => item.id, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Bibliothèque</Text>
            <Text style={styles.headerSubtitle}>
              {safeExercises.length} exercices disponibles
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.selectionModeButton,
              isSelectionMode && styles.selectionModeButtonActive,
            ]}
            onPress={toggleSelectionMode}
          >
            <Ionicons
              name={isSelectionMode ? 'close' : 'checkbox-outline'}
              size={20}
              color={isSelectionMode ? colors.background.primary : colors.text.secondary}
            />
            <Text
              style={[
                styles.selectionModeText,
                isSelectionMode && styles.selectionModeTextActive,
              ]}
            >
              {isSelectionMode ? 'Annuler' : 'Créer séance'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.text.tertiary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un exercice..."
            placeholderTextColor={colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Rechercher un exercice"
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Effacer la recherche"
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.text.tertiary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Special Filters (Favorites/Completed) */}
      <View style={styles.specialFiltersContainer} accessibilityRole="toolbar">
        <TouchableOpacity
          style={[
            styles.specialFilterChip,
            specialFilter === 'favorites' && styles.specialFilterChipActive,
          ]}
          onPress={() => setSpecialFilter(specialFilter === 'favorites' ? null : 'favorites')}
          accessibilityRole="togglebutton"
          accessibilityLabel={`Favoris, ${favoriteExercises.length} exercices`}
          accessibilityState={{ selected: specialFilter === 'favorites' }}
        >
          <Ionicons
            name={specialFilter === 'favorites' ? 'heart' : 'heart-outline'}
            size={18}
            color={specialFilter === 'favorites' ? colors.accent.coral : colors.text.secondary}
          />
          <Text style={[
            styles.specialFilterLabel,
            specialFilter === 'favorites' && styles.specialFilterLabelActive,
          ]}>
            Favoris ({favoriteExercises.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.specialFilterChip,
            specialFilter === 'completed' && styles.specialFilterChipActive,
          ]}
          onPress={() => setSpecialFilter(specialFilter === 'completed' ? null : 'completed')}
          accessibilityRole="togglebutton"
          accessibilityLabel={`Complétés, ${user.progress.completedExercises.length} exercices`}
          accessibilityState={{ selected: specialFilter === 'completed' }}
        >
          <Ionicons
            name={specialFilter === 'completed' ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={18}
            color={specialFilter === 'completed' ? colors.accent.green : colors.text.secondary}
          />
          <Text style={[
            styles.specialFilterLabel,
            specialFilter === 'completed' && styles.specialFilterLabelActive,
          ]}>
            Complétés ({user.progress.completedExercises.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Zone Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {zoneOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.filterChip,
                selectedZone === option.id && styles.filterChipActive,
              ]}
              onPress={() => setSelectedZone(option.id)}
              accessibilityRole="radio"
              accessibilityLabel={`Zone ${option.label}`}
              accessibilityState={{ selected: selectedZone === option.id }}
            >
              <Ionicons
                name={option.icon}
                size={16}
                color={
                  selectedZone === option.id
                    ? colors.background.primary
                    : colors.text.secondary
                }
              />
              <Text
                style={[
                  styles.filterLabel,
                  selectedZone === option.id && styles.filterLabelActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Difficulty Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {difficultyOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.difficultyChip,
                selectedDifficulty === option.id && { backgroundColor: option.color },
              ]}
              onPress={() => setSelectedDifficulty(option.id)}
              accessibilityRole="radio"
              accessibilityLabel={`Difficulté ${option.label}`}
              accessibilityState={{ selected: selectedDifficulty === option.id }}
            >
              <Text
                style={[
                  styles.difficultyLabel,
                  selectedDifficulty === option.id && styles.difficultyLabelActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Exercises List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
      >
        {/* Contraindications Warning */}
        {user.healthInfo.contraindications.length > 0 && (
          <View style={styles.warningBanner}>
            <Ionicons
              name="shield-checkmark"
              size={20}
              color={colors.accent.teal}
            />
            <Text style={styles.warningText}>
              Certains exercices ont été masqués selon vos contre-indications
            </Text>
          </View>
        )}

        {/* Grouped view (when "all" is selected and no special filter) */}
        {selectedZone === 'all' && specialFilter === null && groupedExercises && (
          <>
            {Object.entries(groupedExercises).map(([zone, zoneExercises]) => (
              <View key={zone} style={styles.zoneSection}>
                <View style={styles.zoneSectionHeader}>
                  <Text style={styles.zoneSectionTitle}>
                    {getZoneLabel(zone)}
                  </Text>
                  <Text style={styles.zoneSectionCount}>
                    {zoneExercises.length} exercice(s)
                  </Text>
                </View>
                {zoneExercises.map((exercise) => (
                  <View key={exercise.id} style={styles.exerciseCardWrapper}>
                    {isSelectionMode && (
                      <TouchableOpacity
                        style={styles.selectionCheckbox}
                        onPress={() => toggleExerciseSelection(exercise.id)}
                      >
                        <Ionicons
                          name={isSelected(exercise.id) ? 'checkbox' : 'square-outline'}
                          size={24}
                          color={isSelected(exercise.id) ? colors.accent.green : colors.text.tertiary}
                        />
                      </TouchableOpacity>
                    )}
                    <View style={styles.exerciseCardContent}>
                      <ExerciseCard
                        exercise={exercise}
                        onPress={() => isSelectionMode ? toggleExerciseSelection(exercise.id) : handleExercisePress(exercise.id)}
                        completed={isExerciseCompleted(exercise.id)}
                        showZone={false}
                        isFavorite={isFavorite(exercise.id)}
                        onToggleFavorite={isSelectionMode ? undefined : handleToggleFavorite}
                      />
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}

        {/* Flat view with FlatList (when a specific zone is selected or special filter active) */}
        {(selectedZone !== 'all' || specialFilter !== null) && (
          <View style={styles.exercisesList}>
            {filteredExercises.map((exercise) => (
              <View key={exercise.id}>
                {renderExerciseItem({ item: exercise })}
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {filteredExercises.length === 0 && (
          <EmptyState
            icon="search-outline"
            title="Aucun exercice trouvé"
            description={searchQuery
              ? 'Essayez avec d\'autres mots-clés'
              : 'Aucun exercice disponible pour cette zone'}
          />
        )}
      </ScrollView>

      {/* Selection Mode Action Bar */}
      {isSelectionMode && selectedExercises.length > 0 && (
        <View style={styles.selectionActionBar}>
          <View style={styles.selectionInfo}>
            <Text style={styles.selectionCount}>
              {selectedExercises.length} exercice(s)
            </Text>
            <Text style={styles.selectionDuration}>
              {Math.ceil(selectedTotalDuration / 60)} min
            </Text>
          </View>
          <TouchableOpacity
            style={styles.startSessionButton}
            onPress={handleStartCustomSession}
            accessibilityRole="button"
            accessibilityLabel={`Démarrer une séance avec ${selectedExercises.length} exercices, durée ${Math.ceil(selectedTotalDuration / 60)} minutes`}
          >
            <Ionicons name="play" size={20} color={colors.background.primary} />
            <Text style={styles.startSessionText}>Démarrer</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  // Header
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  selectionModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
  },
  selectionModeButtonActive: {
    backgroundColor: colors.accent.coral,
  },
  selectionModeText: {
    ...typography.label,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  selectionModeTextActive: {
    color: colors.background.primary,
  },
  // Search
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  // Special Filters
  specialFiltersContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  specialFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  specialFilterChipActive: {
    backgroundColor: colors.background.elevated,
  },
  specialFilterLabel: {
    ...typography.label,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  specialFilterLabelActive: {
    color: colors.text.primary,
  },
  // Filters
  filtersContainer: {
    marginBottom: spacing.md,
  },
  filtersContent: {
    paddingHorizontal: spacing.lg,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
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
    marginLeft: spacing.xs,
  },
  filterLabelActive: {
    color: colors.background.primary,
  },
  // Difficulty chips
  difficultyChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  difficultyLabel: {
    ...typography.label,
    color: colors.text.secondary,
  },
  difficultyLabelActive: {
    color: colors.background.primary,
  },
  // Content
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },
  // Warning
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.teal + '10',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  // Zone Section
  zoneSection: {
    marginBottom: spacing.xl,
  },
  zoneSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  zoneSectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  zoneSectionCount: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  // Exercises List
  exercisesList: {
    marginBottom: spacing.lg,
  },
  // Selection Mode Styles
  exerciseCardWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  selectionCheckbox: {
    paddingTop: spacing.md,
    paddingRight: spacing.sm,
  },
  exerciseCardContent: {
    flex: 1,
  },
  selectionActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.dark,
  },
  selectionInfo: {
    flex: 1,
  },
  selectionCount: {
    ...typography.h4,
    color: colors.text.primary,
  },
  selectionDuration: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  startSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.green,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  startSessionText: {
    ...typography.label,
    color: colors.background.primary,
    marginLeft: spacing.sm,
  },
  // Empty State
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

export default LibraryScreen;
