import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  UserProfile,
  UserPreferences,
  UserHealthInfo,
  UserProgress,
  UserSettings,
  SessionHistory,
  DailyEntry,
  Badge,
  Contraindication,
  FaceZone,
  UserGoal,
  FaceFeelRating,
} from '../types';
import { badgeDefinitions, checkBadgeEarned } from '../data/badges';
import { getExerciseById } from '../data/exercises';

// ============================================
// ÉTAT INITIAL DE L'UTILISATEUR
// ============================================
const initialUserProfile: UserProfile = {
  firstName: undefined,
  age: undefined,
  avatarUrl: undefined,
  onboardingCompleted: false,
  onboardingCompletedAt: undefined,
};

const initialUserPreferences: UserPreferences = {
  primaryGoals: [],
  focusZones: [],
  preferredDuration: 10,
  preferredTime: 'flexible',
  reminderEnabled: false,
  reminderTime: '08:00',
  experienceLevel: 'nouveau',
};

const initialUserHealthInfo: UserHealthInfo = {
  contraindications: [],
  recentProcedures: false,
  procedureDetails: undefined,
  notes: undefined,
};

const initialUserProgress: UserProgress = {
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

const initialUserSettings: UserSettings = {
  language: 'fr',
  theme: 'dark',
  soundEnabled: true,
  hapticEnabled: true,
  showAnimations: true,
  dataCollection: false,
};

const initialUser: User = {
  id: `user-${Date.now()}`,
  createdAt: new Date().toISOString(),
  profile: initialUserProfile,
  preferences: initialUserPreferences,
  healthInfo: initialUserHealthInfo,
  progress: initialUserProgress,
  settings: initialUserSettings,
};

// ============================================
// TYPES DU STORE
// ============================================
interface AppState {
  // User data
  user: User;
  sessionHistory: SessionHistory[];
  dailyEntries: DailyEntry[];
  favoriteExercises: string[];

  // UI State
  isLoading: boolean;
  currentSessionId: string | null;
  lastWeekResetDate: string | null;

  // Actions - Profile
  updateProfile: (profile: Partial<UserProfile>) => void;
  completeOnboarding: () => void;

  // Actions - Preferences
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  setGoals: (goals: UserGoal[]) => void;
  setFocusZones: (zones: FaceZone[]) => void;
  setPreferredDuration: (duration: 5 | 10 | 15 | 20) => void;

  // Actions - Health
  updateHealthInfo: (healthInfo: Partial<UserHealthInfo>) => void;
  addContraindication: (contraindication: Contraindication) => void;
  removeContraindication: (contraindication: Contraindication) => void;

  // Actions - Progress
  incrementStreak: () => void;
  resetStreak: () => void;
  addCompletedExercise: (exerciseId: string) => void;
  addCompletedProgram: (programId: string) => void;
  startProgram: (programId: string) => void;
  updateProgramProgress: (day: number) => void;
  completeProgram: () => void;

  // Actions - Sessions
  startSession: () => string;
  completeSession: (sessionData: Omit<SessionHistory, 'id'>) => void;
  addSessionToHistory: (session: SessionHistory) => void;

  // Actions - Daily Entries
  updateDailyEntry: (entry: Partial<DailyEntry> & { date: string }) => void;
  getTodayEntry: () => DailyEntry | undefined;

  // Actions - Badges
  checkAndAwardBadges: () => Badge[];

  // Actions - Settings
  updateSettings: (settings: Partial<UserSettings>) => void;

  // Actions - Favorites
  toggleFavoriteExercise: (exerciseId: string) => void;
  isFavoriteExercise: (exerciseId: string) => boolean;

  // Actions - Utility
  resetProgress: () => void;
  resetAllData: () => void;
  checkAndResetWeeklyProgress: () => void;
}

// ============================================
// CRÉATION DU STORE
// ============================================
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: initialUser,
      sessionHistory: [],
      dailyEntries: [],
      favoriteExercises: [],
      isLoading: false,
      currentSessionId: null,
      lastWeekResetDate: null,

      // ==========================================
      // PROFILE ACTIONS
      // ==========================================
      updateProfile: (profile) =>
        set((state) => ({
          user: {
            ...state.user,
            profile: { ...state.user.profile, ...profile },
          },
        })),

      completeOnboarding: () =>
        set((state) => ({
          user: {
            ...state.user,
            profile: {
              ...state.user.profile,
              onboardingCompleted: true,
              onboardingCompletedAt: new Date().toISOString(),
            },
          },
        })),

      // ==========================================
      // PREFERENCES ACTIONS
      // ==========================================
      updatePreferences: (preferences) =>
        set((state) => ({
          user: {
            ...state.user,
            preferences: { ...state.user.preferences, ...preferences },
          },
        })),

      setGoals: (goals) =>
        set((state) => ({
          user: {
            ...state.user,
            preferences: { ...state.user.preferences, primaryGoals: goals },
          },
        })),

      setFocusZones: (zones) =>
        set((state) => ({
          user: {
            ...state.user,
            preferences: { ...state.user.preferences, focusZones: zones },
          },
        })),

      setPreferredDuration: (duration) =>
        set((state) => ({
          user: {
            ...state.user,
            preferences: { ...state.user.preferences, preferredDuration: duration },
          },
        })),

      // ==========================================
      // HEALTH ACTIONS
      // ==========================================
      updateHealthInfo: (healthInfo) =>
        set((state) => ({
          user: {
            ...state.user,
            healthInfo: { ...state.user.healthInfo, ...healthInfo },
          },
        })),

      addContraindication: (contraindication) =>
        set((state) => ({
          user: {
            ...state.user,
            healthInfo: {
              ...state.user.healthInfo,
              contraindications: [
                ...state.user.healthInfo.contraindications,
                contraindication,
              ],
            },
          },
        })),

      removeContraindication: (contraindication) =>
        set((state) => ({
          user: {
            ...state.user,
            healthInfo: {
              ...state.user.healthInfo,
              contraindications: state.user.healthInfo.contraindications.filter(
                (c) => c !== contraindication
              ),
            },
          },
        })),

      // ==========================================
      // PROGRESS ACTIONS
      // ==========================================
      incrementStreak: () =>
        set((state) => {
          const newStreak = state.user.progress.currentStreak + 1;
          const newLongestStreak = Math.max(
            newStreak,
            state.user.progress.longestStreak
          );
          return {
            user: {
              ...state.user,
              progress: {
                ...state.user.progress,
                currentStreak: newStreak,
                longestStreak: newLongestStreak,
              },
            },
          };
        }),

      resetStreak: () =>
        set((state) => ({
          user: {
            ...state.user,
            progress: { ...state.user.progress, currentStreak: 0 },
          },
        })),

      addCompletedExercise: (exerciseId) =>
        set((state) => {
          const completedExercises = state.user.progress.completedExercises;
          if (!completedExercises.includes(exerciseId)) {
            return {
              user: {
                ...state.user,
                progress: {
                  ...state.user.progress,
                  completedExercises: [...completedExercises, exerciseId],
                },
              },
            };
          }
          return state;
        }),

      addCompletedProgram: (programId) =>
        set((state) => ({
          user: {
            ...state.user,
            progress: {
              ...state.user.progress,
              completedPrograms: [
                ...state.user.progress.completedPrograms,
                programId,
              ],
            },
          },
        })),

      startProgram: (programId) =>
        set((state) => ({
          user: {
            ...state.user,
            progress: {
              ...state.user.progress,
              currentProgramId: programId,
              currentProgramProgress: {
                programId,
                startedAt: new Date().toISOString(),
                currentDay: 1,
                completedDays: [],
                lastSessionAt: undefined,
              },
            },
          },
        })),

      updateProgramProgress: (day) =>
        set((state) => {
          if (!state.user.progress.currentProgramProgress) return state;

          const completedDays = [
            ...state.user.progress.currentProgramProgress.completedDays,
          ];
          if (!completedDays.includes(day)) {
            completedDays.push(day);
          }

          return {
            user: {
              ...state.user,
              progress: {
                ...state.user.progress,
                currentProgramProgress: {
                  ...state.user.progress.currentProgramProgress,
                  currentDay: day + 1,
                  completedDays,
                  lastSessionAt: new Date().toISOString(),
                },
              },
            },
          };
        }),

      completeProgram: () =>
        set((state) => {
          const currentProgramId = state.user.progress.currentProgramId;
          if (!currentProgramId) return state;

          return {
            user: {
              ...state.user,
              progress: {
                ...state.user.progress,
                currentProgramId: undefined,
                currentProgramProgress: undefined,
                completedPrograms: [
                  ...state.user.progress.completedPrograms,
                  currentProgramId,
                ],
              },
            },
          };
        }),

      // ==========================================
      // SESSION ACTIONS
      // ==========================================
      startSession: () => {
        const sessionId = `session-${Date.now()}`;
        set({ currentSessionId: sessionId });
        return sessionId;
      },

      completeSession: (sessionData) =>
        set((state) => {
          const newSession: SessionHistory = {
            ...sessionData,
            id: state.currentSessionId || `session-${Date.now()}`,
          };

          const newTotalSessions = state.user.progress.totalSessions + 1;
          const newTotalMinutes =
            state.user.progress.totalMinutes + sessionData.totalDuration;
          const newWeeklyProgress = state.user.progress.weeklyProgress + 1;

          // Add completed exercises
          const newCompletedExercises = [
            ...state.user.progress.completedExercises,
          ];
          sessionData.exercises.forEach((ex) => {
            if (
              !ex.skipped &&
              !newCompletedExercises.includes(ex.exerciseId)
            ) {
              newCompletedExercises.push(ex.exerciseId);
            }
          });

          return {
            currentSessionId: null,
            sessionHistory: [...state.sessionHistory, newSession],
            user: {
              ...state.user,
              progress: {
                ...state.user.progress,
                totalSessions: newTotalSessions,
                totalMinutes: newTotalMinutes,
                weeklyProgress: newWeeklyProgress,
                completedExercises: newCompletedExercises,
              },
            },
          };
        }),

      addSessionToHistory: (session) =>
        set((state) => ({
          sessionHistory: [...state.sessionHistory, session],
        })),

      // ==========================================
      // DAILY ENTRIES ACTIONS
      // ==========================================
      updateDailyEntry: (entry) =>
        set((state) => {
          const existingIndex = state.dailyEntries.findIndex(
            (e) => e.date === entry.date
          );

          if (existingIndex >= 0) {
            const updatedEntries = [...state.dailyEntries];
            updatedEntries[existingIndex] = {
              ...updatedEntries[existingIndex],
              ...entry,
            };
            return { dailyEntries: updatedEntries };
          }

          return {
            dailyEntries: [
              ...state.dailyEntries,
              {
                sessionCompleted: false,
                ...entry,
              } as DailyEntry,
            ],
          };
        }),

      getTodayEntry: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().dailyEntries.find((e) => e.date === today);
      },

      // ==========================================
      // BADGES ACTIONS
      // ==========================================
      checkAndAwardBadges: () => {
        const state = get();
        const earnedBadgeIds = state.user.progress.badges.map((b) => b.id);

        // Calculer les zones explorées à partir de l'historique
        const zonesExplored = new Set<string>();
        state.user.progress.completedExercises.forEach((exerciseId) => {
          const exercise = getExerciseById(exerciseId);
          if (exercise) {
            zonesExplored.add(exercise.zone);
          }
        });

        const userStats = {
          currentStreak: state.user.progress.currentStreak,
          totalSessions: state.user.progress.totalSessions,
          totalMinutes: state.user.progress.totalMinutes,
          completedExercises: state.user.progress.completedExercises,
          completedPrograms: state.user.progress.completedPrograms,
          zonesExplored: Array.from(zonesExplored),
        };

        const newBadges: Badge[] = [];

        badgeDefinitions.forEach((badgeDef) => {
          if (
            !earnedBadgeIds.includes(badgeDef.id) &&
            checkBadgeEarned(badgeDef, userStats)
          ) {
            const newBadge: Badge = {
              id: badgeDef.id,
              name: badgeDef.name,
              description: badgeDef.description,
              iconName: badgeDef.iconName,
              earnedAt: new Date().toISOString(),
              category: badgeDef.category,
            };
            newBadges.push(newBadge);
          }
        });

        if (newBadges.length > 0) {
          set((state) => ({
            user: {
              ...state.user,
              progress: {
                ...state.user.progress,
                badges: [...state.user.progress.badges, ...newBadges],
              },
            },
          }));
        }

        return newBadges;
      },

      // ==========================================
      // SETTINGS ACTIONS
      // ==========================================
      updateSettings: (settings) =>
        set((state) => ({
          user: {
            ...state.user,
            settings: { ...state.user.settings, ...settings },
          },
        })),

      // ==========================================
      // FAVORITES ACTIONS
      // ==========================================
      toggleFavoriteExercise: (exerciseId) =>
        set((state) => {
          const isFavorite = state.favoriteExercises.includes(exerciseId);
          return {
            favoriteExercises: isFavorite
              ? state.favoriteExercises.filter((id) => id !== exerciseId)
              : [...state.favoriteExercises, exerciseId],
          };
        }),

      isFavoriteExercise: (exerciseId) => {
        return get().favoriteExercises.includes(exerciseId);
      },

      // ==========================================
      // UTILITY ACTIONS
      // ==========================================
      resetProgress: () =>
        set((state) => ({
          user: {
            ...state.user,
            progress: initialUserProgress,
          },
          sessionHistory: [],
          dailyEntries: [],
        })),

      resetAllData: () =>
        set({
          user: {
            ...initialUser,
            id: `user-${Date.now()}`,
            createdAt: new Date().toISOString(),
          },
          sessionHistory: [],
          dailyEntries: [],
          favoriteExercises: [],
          currentSessionId: null,
          lastWeekResetDate: null,
        }),

      checkAndResetWeeklyProgress: () => {
        const state = get();
        const now = new Date();
        const currentMonday = new Date(now);
        const dayOfWeek = currentMonday.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        currentMonday.setDate(currentMonday.getDate() - diff);
        const mondayStr = currentMonday.toISOString().split('T')[0];

        if (state.lastWeekResetDate !== mondayStr) {
          set((s) => ({
            lastWeekResetDate: mondayStr,
            user: {
              ...s.user,
              progress: {
                ...s.user.progress,
                weeklyProgress: 0,
              },
            },
          }));
        }
      },
    }),
    {
      name: 'face-yoga-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        sessionHistory: state.sessionHistory,
        dailyEntries: state.dailyEntries,
        favoriteExercises: state.favoriteExercises,
        lastWeekResetDate: state.lastWeekResetDate,
      }),
    }
  )
);

// ============================================
// SELECTORS
// ============================================
export const selectUser = (state: AppState) => state.user;
export const selectProfile = (state: AppState) => state.user.profile;
export const selectPreferences = (state: AppState) => state.user.preferences;
export const selectHealthInfo = (state: AppState) => state.user.healthInfo;
export const selectProgress = (state: AppState) => state.user.progress;
export const selectSettings = (state: AppState) => state.user.settings;
export const selectSessionHistory = (state: AppState) => state.sessionHistory;
export const selectDailyEntries = (state: AppState) => state.dailyEntries;
export const selectIsOnboarded = (state: AppState) =>
  state.user.profile.onboardingCompleted;
