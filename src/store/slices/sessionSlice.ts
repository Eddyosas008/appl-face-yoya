import { StateCreator } from 'zustand';
import { SessionHistory, DailyEntry, CompletedExercise } from '../../types';

// ============================================
// SESSION & DAILY ENTRIES SLICE
// ============================================

export interface SessionSlice {
  sessionHistory: SessionHistory[];
  dailyEntries: DailyEntry[];
  currentSessionId: string | null;

  startSession: () => string;
  completeSession: (sessionData: Omit<SessionHistory, 'id'>, addMinutes: (mins: number) => void) => void;
  addSessionToHistory: (session: SessionHistory) => void;

  updateDailyEntry: (entry: Partial<DailyEntry> & { date: string }) => void;
  getTodayEntry: () => DailyEntry | undefined;

  clearSessionData: () => void;
}

export const createSessionSlice: StateCreator<
  SessionSlice,
  [],
  [],
  SessionSlice
> = (set, get) => ({
  sessionHistory: [],
  dailyEntries: [],
  currentSessionId: null,

  startSession: () => {
    const sessionId = `session-${Date.now()}`;
    set({ currentSessionId: sessionId });
    return sessionId;
  },

  completeSession: (sessionData, addMinutes) => {
    set((state) => {
      const newSession: SessionHistory = {
        ...sessionData,
        id: state.currentSessionId || `session-${Date.now()}`,
      };

      return {
        currentSessionId: null,
        sessionHistory: [...state.sessionHistory, newSession],
      };
    });
  },

  addSessionToHistory: (session) =>
    set((state) => ({
      sessionHistory: [...state.sessionHistory, session],
    })),

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

  clearSessionData: () =>
    set({
      sessionHistory: [],
      dailyEntries: [],
      currentSessionId: null,
    }),
});

// Selectors
export const selectSessionHistory = (state: { sessionHistory: SessionHistory[] }) =>
  state.sessionHistory;
export const selectDailyEntries = (state: { dailyEntries: DailyEntry[] }) =>
  state.dailyEntries;
