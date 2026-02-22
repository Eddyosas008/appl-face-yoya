import { StateCreator } from 'zustand';
import { UserPreferences, UserGoal, FaceZone } from '../../types';

// ============================================
// PREFERENCES SLICE
// ============================================

const initialPreferences: UserPreferences = {
  primaryGoals: [],
  focusZones: [],
  preferredDuration: 10,
  preferredTime: 'flexible',
  reminderEnabled: false,
  reminderTime: '08:00',
  experienceLevel: 'nouveau',
};

export interface PreferencesSlice {
  preferences: UserPreferences;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  setGoals: (goals: UserGoal[]) => void;
  setFocusZones: (zones: FaceZone[]) => void;
  setPreferredDuration: (duration: 5 | 10 | 15 | 20) => void;
}

export const createPreferencesSlice: StateCreator<
  PreferencesSlice,
  [],
  [],
  PreferencesSlice
> = (set) => ({
  preferences: initialPreferences,

  updatePreferences: (updates) =>
    set((state) => ({
      preferences: { ...state.preferences, ...updates },
    })),

  setGoals: (goals) =>
    set((state) => ({
      preferences: { ...state.preferences, primaryGoals: goals },
    })),

  setFocusZones: (zones) =>
    set((state) => ({
      preferences: { ...state.preferences, focusZones: zones },
    })),

  setPreferredDuration: (duration) =>
    set((state) => ({
      preferences: { ...state.preferences, preferredDuration: duration },
    })),
});

// Selectors
export const selectPreferences = (state: { preferences: UserPreferences }) =>
  state.preferences;
