import { StateCreator } from 'zustand';
import { UserProfile } from '../../types';

// ============================================
// PROFILE SLICE
// ============================================

const initialProfile: UserProfile = {
  firstName: undefined,
  age: undefined,
  avatarUrl: undefined,
  onboardingCompleted: false,
  onboardingCompletedAt: undefined,
};

export interface ProfileSlice {
  profile: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
}

export const createProfileSlice: StateCreator<
  ProfileSlice,
  [],
  [],
  ProfileSlice
> = (set) => ({
  profile: initialProfile,

  updateProfile: (updates) =>
    set((state) => ({
      profile: { ...state.profile, ...updates },
    })),

  completeOnboarding: () =>
    set((state) => ({
      profile: {
        ...state.profile,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date().toISOString(),
      },
    })),
});

// Selectors
export const selectProfile = (state: { profile: UserProfile }) => state.profile;
export const selectIsOnboarded = (state: { profile: UserProfile }) =>
  state.profile.onboardingCompleted;
