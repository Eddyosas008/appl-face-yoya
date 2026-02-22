import { StateCreator } from 'zustand';
import { UserProgress, Badge } from '../../types';
import { badgeDefinitions, checkBadgeEarned } from '../../data/badges';

// ============================================
// PROGRESS SLICE
// ============================================

export const initialProgress: UserProgress = {
  currentStreak: 0,
  longestStreak: 0,
  totalSessions: 0,
  totalMinutes: 0,
  badges: [],
  completedExercises: [],
  completedPrograms: [],
  currentProgramId: undefined,
  currentProgramProgress: undefined,
  weeklyGoal: 5,
  weeklyProgress: 0,
};

export interface ProgressSlice {
  progress: UserProgress;
  incrementStreak: () => void;
  resetStreak: () => void;
  addCompletedExercise: (exerciseId: string) => void;
  addCompletedProgram: (programId: string) => void;
  startProgram: (programId: string) => void;
  updateProgramProgress: (day: number) => void;
  completeProgram: () => void;
  updateProgress: (updates: Partial<UserProgress>) => void;
  checkAndAwardBadges: () => Badge[];
  resetProgress: () => void;
}

export const createProgressSlice: StateCreator<
  ProgressSlice,
  [],
  [],
  ProgressSlice
> = (set, get) => ({
  progress: initialProgress,

  incrementStreak: () =>
    set((state) => {
      const newStreak = state.progress.currentStreak + 1;
      return {
        progress: {
          ...state.progress,
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, state.progress.longestStreak),
        },
      };
    }),

  resetStreak: () =>
    set((state) => ({
      progress: { ...state.progress, currentStreak: 0 },
    })),

  addCompletedExercise: (exerciseId) =>
    set((state) => {
      if (state.progress.completedExercises.includes(exerciseId)) {
        return state;
      }
      return {
        progress: {
          ...state.progress,
          completedExercises: [...state.progress.completedExercises, exerciseId],
        },
      };
    }),

  addCompletedProgram: (programId) =>
    set((state) => ({
      progress: {
        ...state.progress,
        completedPrograms: [...state.progress.completedPrograms, programId],
      },
    })),

  startProgram: (programId) =>
    set((state) => ({
      progress: {
        ...state.progress,
        currentProgramId: programId,
        currentProgramProgress: {
          programId,
          startedAt: new Date().toISOString(),
          currentDay: 1,
          completedDays: [],
          lastSessionAt: undefined,
        },
      },
    })),

  updateProgramProgress: (day) =>
    set((state) => {
      if (!state.progress.currentProgramProgress) return state;

      const completedDays = [
        ...state.progress.currentProgramProgress.completedDays,
      ];
      if (!completedDays.includes(day)) {
        completedDays.push(day);
      }

      return {
        progress: {
          ...state.progress,
          currentProgramProgress: {
            ...state.progress.currentProgramProgress,
            currentDay: day + 1,
            completedDays,
            lastSessionAt: new Date().toISOString(),
          },
        },
      };
    }),

  completeProgram: () =>
    set((state) => {
      const currentProgramId = state.progress.currentProgramId;
      if (!currentProgramId) return state;

      return {
        progress: {
          ...state.progress,
          currentProgramId: undefined,
          currentProgramProgress: undefined,
          completedPrograms: [
            ...state.progress.completedPrograms,
            currentProgramId,
          ],
        },
      };
    }),

  updateProgress: (updates) =>
    set((state) => ({
      progress: { ...state.progress, ...updates },
    })),

  checkAndAwardBadges: () => {
    const state = get();
    const earnedBadgeIds = state.progress.badges.map((b) => b.id);

    const userStats = {
      currentStreak: state.progress.currentStreak,
      totalSessions: state.progress.totalSessions,
      totalMinutes: state.progress.totalMinutes,
      completedExercises: state.progress.completedExercises,
      completedPrograms: state.progress.completedPrograms,
      zonesExplored: [] as string[],
    };

    const newBadges: Badge[] = [];

    badgeDefinitions.forEach((badgeDef) => {
      if (
        !earnedBadgeIds.includes(badgeDef.id) &&
        checkBadgeEarned(badgeDef, userStats)
      ) {
        newBadges.push({
          id: badgeDef.id,
          name: badgeDef.name,
          description: badgeDef.description,
          iconName: badgeDef.iconName,
          earnedAt: new Date().toISOString(),
          category: badgeDef.category,
        });
      }
    });

    if (newBadges.length > 0) {
      set((state) => ({
        progress: {
          ...state.progress,
          badges: [...state.progress.badges, ...newBadges],
        },
      }));
    }

    return newBadges;
  },

  resetProgress: () =>
    set({ progress: initialProgress }),
});

// Selectors
export const selectProgress = (state: { progress: UserProgress }) =>
  state.progress;
export const selectCurrentStreak = (state: { progress: UserProgress }) =>
  state.progress.currentStreak;
export const selectTotalSessions = (state: { progress: UserProgress }) =>
  state.progress.totalSessions;
