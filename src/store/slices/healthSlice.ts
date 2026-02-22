import { StateCreator } from 'zustand';
import { UserHealthInfo, Contraindication } from '../../types';

// ============================================
// HEALTH SLICE
// ============================================

const initialHealthInfo: UserHealthInfo = {
  contraindications: [],
  recentProcedures: false,
  procedureDetails: undefined,
  notes: undefined,
};

export interface HealthSlice {
  healthInfo: UserHealthInfo;
  updateHealthInfo: (healthInfo: Partial<UserHealthInfo>) => void;
  addContraindication: (contraindication: Contraindication) => void;
  removeContraindication: (contraindication: Contraindication) => void;
}

export const createHealthSlice: StateCreator<
  HealthSlice,
  [],
  [],
  HealthSlice
> = (set) => ({
  healthInfo: initialHealthInfo,

  updateHealthInfo: (updates) =>
    set((state) => ({
      healthInfo: { ...state.healthInfo, ...updates },
    })),

  addContraindication: (contraindication) =>
    set((state) => ({
      healthInfo: {
        ...state.healthInfo,
        contraindications: [
          ...state.healthInfo.contraindications,
          contraindication,
        ],
      },
    })),

  removeContraindication: (contraindication) =>
    set((state) => ({
      healthInfo: {
        ...state.healthInfo,
        contraindications: state.healthInfo.contraindications.filter(
          (c) => c !== contraindication
        ),
      },
    })),
});

// Selectors
export const selectHealthInfo = (state: { healthInfo: UserHealthInfo }) =>
  state.healthInfo;
