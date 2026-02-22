import { StateCreator } from 'zustand';

// ============================================
// FAVORITES SLICE
// ============================================

export interface FavoritesSlice {
  favoriteExercises: string[];
  toggleFavoriteExercise: (exerciseId: string) => void;
  isFavoriteExercise: (exerciseId: string) => boolean;
}

export const createFavoritesSlice: StateCreator<
  FavoritesSlice,
  [],
  [],
  FavoritesSlice
> = (set, get) => ({
  favoriteExercises: [],

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
});

// Selectors
export const selectFavoriteExercises = (state: { favoriteExercises: string[] }) =>
  state.favoriteExercises;
