import { useStore } from '../useStore';

// Reset store before each test
beforeEach(() => {
  useStore.getState().resetAllData();
});

describe('useStore - Profile', () => {
  it('starts with default profile', () => {
    const state = useStore.getState();
    expect(state.user.profile.onboardingCompleted).toBe(false);
    expect(state.user.profile.firstName).toBeUndefined();
  });

  it('updates profile', () => {
    useStore.getState().updateProfile({ firstName: 'Marie' });
    expect(useStore.getState().user.profile.firstName).toBe('Marie');
  });

  it('completes onboarding', () => {
    useStore.getState().completeOnboarding();
    const profile = useStore.getState().user.profile;
    expect(profile.onboardingCompleted).toBe(true);
    expect(profile.onboardingCompletedAt).toBeDefined();
  });
});

describe('useStore - Preferences', () => {
  it('starts with default preferences', () => {
    const prefs = useStore.getState().user.preferences;
    expect(prefs.preferredDuration).toBe(10);
    expect(prefs.primaryGoals).toEqual([]);
    expect(prefs.experienceLevel).toBe('nouveau');
  });

  it('updates preferences', () => {
    useStore.getState().updatePreferences({ preferredDuration: 15 });
    expect(useStore.getState().user.preferences.preferredDuration).toBe(15);
  });

  it('sets goals', () => {
    useStore.getState().setGoals(['reduire_tensions', 'eclat_peau']);
    expect(useStore.getState().user.preferences.primaryGoals).toEqual([
      'reduire_tensions',
      'eclat_peau',
    ]);
  });

  it('sets focus zones', () => {
    useStore.getState().setFocusZones(['front', 'yeux']);
    expect(useStore.getState().user.preferences.focusZones).toEqual(['front', 'yeux']);
  });

  it('sets preferred duration', () => {
    useStore.getState().setPreferredDuration(20);
    expect(useStore.getState().user.preferences.preferredDuration).toBe(20);
  });
});

describe('useStore - Health', () => {
  it('adds contraindication', () => {
    useStore.getState().addContraindication('atm');
    expect(useStore.getState().user.healthInfo.contraindications).toContain('atm');
  });

  it('removes contraindication', () => {
    useStore.getState().addContraindication('atm');
    useStore.getState().addContraindication('glaucome');
    useStore.getState().removeContraindication('atm');

    const contraindications = useStore.getState().user.healthInfo.contraindications;
    expect(contraindications).not.toContain('atm');
    expect(contraindications).toContain('glaucome');
  });

  it('updates health info', () => {
    useStore.getState().updateHealthInfo({ recentProcedures: true, notes: 'Test' });
    const health = useStore.getState().user.healthInfo;
    expect(health.recentProcedures).toBe(true);
    expect(health.notes).toBe('Test');
  });
});

describe('useStore - Progress & Streaks', () => {
  it('increments streak and tracks longest', () => {
    useStore.getState().incrementStreak();
    useStore.getState().incrementStreak();
    useStore.getState().incrementStreak();

    const progress = useStore.getState().user.progress;
    expect(progress.currentStreak).toBe(3);
    expect(progress.longestStreak).toBe(3);
  });

  it('resets streak but preserves longest', () => {
    useStore.getState().incrementStreak();
    useStore.getState().incrementStreak();
    useStore.getState().incrementStreak();
    useStore.getState().resetStreak();

    const progress = useStore.getState().user.progress;
    expect(progress.currentStreak).toBe(0);
    expect(progress.longestStreak).toBe(3);
  });

  it('adds completed exercises without duplicates', () => {
    useStore.getState().addCompletedExercise('ex-1');
    useStore.getState().addCompletedExercise('ex-2');
    useStore.getState().addCompletedExercise('ex-1'); // duplicate

    expect(useStore.getState().user.progress.completedExercises).toEqual(['ex-1', 'ex-2']);
  });
});

describe('useStore - Programs', () => {
  it('starts a program', () => {
    useStore.getState().startProgram('prog-decouverte');

    const progress = useStore.getState().user.progress;
    expect(progress.currentProgramId).toBe('prog-decouverte');
    expect(progress.currentProgramProgress?.programId).toBe('prog-decouverte');
    expect(progress.currentProgramProgress?.currentDay).toBe(1);
  });

  it('updates program progress', () => {
    useStore.getState().startProgram('prog-decouverte');
    useStore.getState().updateProgramProgress(1);

    const pp = useStore.getState().user.progress.currentProgramProgress!;
    expect(pp.completedDays).toContain(1);
    expect(pp.currentDay).toBe(2);
  });

  it('does not duplicate completed days', () => {
    useStore.getState().startProgram('prog-decouverte');
    useStore.getState().updateProgramProgress(1);
    useStore.getState().updateProgramProgress(1);

    const pp = useStore.getState().user.progress.currentProgramProgress!;
    expect(pp.completedDays.filter((d) => d === 1).length).toBe(1);
  });

  it('completes a program', () => {
    useStore.getState().startProgram('prog-decouverte');
    useStore.getState().completeProgram();

    const progress = useStore.getState().user.progress;
    expect(progress.currentProgramId).toBeUndefined();
    expect(progress.currentProgramProgress).toBeUndefined();
    expect(progress.completedPrograms).toContain('prog-decouverte');
  });

  it('does nothing when completing without active program', () => {
    const before = useStore.getState().user.progress;
    useStore.getState().completeProgram();
    const after = useStore.getState().user.progress;
    expect(after.completedPrograms).toEqual(before.completedPrograms);
  });
});

describe('useStore - Sessions', () => {
  it('starts a session', () => {
    const sessionId = useStore.getState().startSession();
    expect(sessionId).toMatch(/^session-/);
    expect(useStore.getState().currentSessionId).toBe(sessionId);
  });

  it('completes a session and updates stats', () => {
    useStore.getState().startSession();
    useStore.getState().completeSession({
      date: '2024-01-15',
      exercises: [
        { exerciseId: 'ex-1', completedAt: '2024-01-15T10:00:00Z', duration: 60, skipped: false },
        { exerciseId: 'ex-2', completedAt: '2024-01-15T10:01:00Z', duration: 45, skipped: true },
      ],
      totalDuration: 5,
      mood: 4,
      faceFeel: 'detendu',
    });

    const state = useStore.getState();
    expect(state.currentSessionId).toBeNull();
    expect(state.sessionHistory).toHaveLength(1);
    expect(state.user.progress.totalSessions).toBe(1);
    expect(state.user.progress.totalMinutes).toBe(5);
    expect(state.user.progress.weeklyProgress).toBe(1);
    // Only non-skipped exercises get added
    expect(state.user.progress.completedExercises).toContain('ex-1');
    expect(state.user.progress.completedExercises).not.toContain('ex-2');
  });
});

describe('useStore - Daily Entries', () => {
  it('creates a new daily entry', () => {
    useStore.getState().updateDailyEntry({
      date: '2024-01-15',
      sessionCompleted: true,
      waterIntake: 8,
    });

    const entries = useStore.getState().dailyEntries;
    expect(entries).toHaveLength(1);
    expect(entries[0].date).toBe('2024-01-15');
    expect(entries[0].waterIntake).toBe(8);
  });

  it('updates an existing daily entry', () => {
    useStore.getState().updateDailyEntry({ date: '2024-01-15', waterIntake: 5 });
    useStore.getState().updateDailyEntry({ date: '2024-01-15', waterIntake: 8, sleepQuality: 4 });

    const entries = useStore.getState().dailyEntries;
    expect(entries).toHaveLength(1);
    expect(entries[0].waterIntake).toBe(8);
    expect(entries[0].sleepQuality).toBe(4);
  });
});

describe('useStore - Favorites', () => {
  it('toggles favorite exercise', () => {
    useStore.getState().toggleFavoriteExercise('ex-1');
    expect(useStore.getState().favoriteExercises).toContain('ex-1');

    useStore.getState().toggleFavoriteExercise('ex-1');
    expect(useStore.getState().favoriteExercises).not.toContain('ex-1');
  });

  it('checks if exercise is favorite', () => {
    useStore.getState().toggleFavoriteExercise('ex-1');
    expect(useStore.getState().isFavoriteExercise('ex-1')).toBe(true);
    expect(useStore.getState().isFavoriteExercise('ex-2')).toBe(false);
  });
});

describe('useStore - Settings', () => {
  it('updates settings', () => {
    useStore.getState().updateSettings({ soundEnabled: false, theme: 'light' });
    const settings = useStore.getState().user.settings;
    expect(settings.soundEnabled).toBe(false);
    expect(settings.theme).toBe('light');
  });
});

describe('useStore - Reset', () => {
  it('resets progress', () => {
    useStore.getState().incrementStreak();
    useStore.getState().addCompletedExercise('ex-1');
    useStore.getState().resetProgress();

    const progress = useStore.getState().user.progress;
    expect(progress.currentStreak).toBe(0);
    expect(progress.completedExercises).toEqual([]);
    expect(useStore.getState().sessionHistory).toEqual([]);
  });

  it('resets all data', () => {
    useStore.getState().updateProfile({ firstName: 'Test' });
    useStore.getState().incrementStreak();
    useStore.getState().toggleFavoriteExercise('ex-1');
    useStore.getState().resetAllData();

    const state = useStore.getState();
    expect(state.user.profile.firstName).toBeUndefined();
    expect(state.user.progress.currentStreak).toBe(0);
    expect(state.favoriteExercises).toEqual([]);
  });
});

describe('useStore - Weekly Reset', () => {
  it('resets weekly progress on new week', () => {
    // Simulate some progress
    useStore.getState().completeSession({
      date: '2024-01-15',
      exercises: [],
      totalDuration: 5,
    });
    expect(useStore.getState().user.progress.weeklyProgress).toBe(1);

    // Trigger weekly reset
    useStore.getState().checkAndResetWeeklyProgress();

    // After reset, weeklyProgress should be 0 (since lastWeekResetDate was null)
    expect(useStore.getState().user.progress.weeklyProgress).toBe(0);
    expect(useStore.getState().lastWeekResetDate).toBeTruthy();
  });

  it('does not reset if already reset this week', () => {
    useStore.getState().checkAndResetWeeklyProgress();
    const resetDate = useStore.getState().lastWeekResetDate;

    // Add some progress
    useStore.getState().completeSession({
      date: '2024-01-15',
      exercises: [],
      totalDuration: 5,
    });

    // Try reset again - should not reset since already done this week
    useStore.getState().checkAndResetWeeklyProgress();
    expect(useStore.getState().user.progress.weeklyProgress).toBe(1);
    expect(useStore.getState().lastWeekResetDate).toBe(resetDate);
  });
});

describe('useStore - Selectors', () => {
  it('selectIsOnboarded returns correct value', () => {
    const { selectIsOnboarded } = require('../useStore');
    expect(selectIsOnboarded(useStore.getState())).toBe(false);

    useStore.getState().completeOnboarding();
    expect(selectIsOnboarded(useStore.getState())).toBe(true);
  });
});
