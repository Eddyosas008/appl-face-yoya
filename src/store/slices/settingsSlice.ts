import { StateCreator } from 'zustand';
import { UserSettings } from '../../types';

// ============================================
// SETTINGS SLICE
// ============================================

const initialSettings: UserSettings = {
  language: 'fr',
  theme: 'dark',
  soundEnabled: true,
  hapticEnabled: true,
  showAnimations: true,
  dataCollection: false,
};

export interface SettingsSlice {
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
}

export const createSettingsSlice: StateCreator<
  SettingsSlice,
  [],
  [],
  SettingsSlice
> = (set) => ({
  settings: initialSettings,

  updateSettings: (updates) =>
    set((state) => ({
      settings: { ...state.settings, ...updates },
    })),
});

// Selectors
export const selectSettings = (state: { settings: UserSettings }) =>
  state.settings;
