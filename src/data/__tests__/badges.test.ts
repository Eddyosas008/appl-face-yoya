import {
  badgeDefinitions,
  checkBadgeEarned,
  getBadgeProgress,
  getNextBadgeToEarn,
  getRandomMessage,
  motivationalMessages,
} from '../badges';

const defaultStats = {
  currentStreak: 0,
  totalSessions: 0,
  totalMinutes: 0,
  completedExercises: [] as string[],
  completedPrograms: [] as string[],
  zonesExplored: [] as string[],
};

describe('badgeDefinitions', () => {
  it('has unique IDs', () => {
    const ids = badgeDefinitions.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has all required fields', () => {
    badgeDefinitions.forEach((badge) => {
      expect(badge.id).toBeTruthy();
      expect(badge.name).toBeTruthy();
      expect(badge.description).toBeTruthy();
      expect(badge.iconName).toBeTruthy();
      expect(badge.category).toBeTruthy();
      expect(badge.requirement).toBeDefined();
      expect(badge.motivationalMessage).toBeTruthy();
    });
  });

  it('covers all requirement types', () => {
    const types = new Set(badgeDefinitions.map((b) => b.requirement.type));
    expect(types).toContain('streak');
    expect(types).toContain('sessions');
    expect(types).toContain('minutes');
    expect(types).toContain('exercises');
    expect(types).toContain('programs');
    expect(types).toContain('zones');
  });
});

describe('checkBadgeEarned', () => {
  it('awards streak badges when threshold met', () => {
    const badge = badgeDefinitions.find((b) => b.id === 'badge-streak-3')!;
    expect(checkBadgeEarned(badge, { ...defaultStats, currentStreak: 2 })).toBe(false);
    expect(checkBadgeEarned(badge, { ...defaultStats, currentStreak: 3 })).toBe(true);
    expect(checkBadgeEarned(badge, { ...defaultStats, currentStreak: 10 })).toBe(true);
  });

  it('awards session badges when threshold met', () => {
    const badge = badgeDefinitions.find((b) => b.id === 'badge-sessions-10')!;
    expect(checkBadgeEarned(badge, { ...defaultStats, totalSessions: 9 })).toBe(false);
    expect(checkBadgeEarned(badge, { ...defaultStats, totalSessions: 10 })).toBe(true);
  });

  it('awards minute badges when threshold met', () => {
    const badge = badgeDefinitions.find((b) => b.id === 'badge-minutes-60')!;
    expect(checkBadgeEarned(badge, { ...defaultStats, totalMinutes: 59 })).toBe(false);
    expect(checkBadgeEarned(badge, { ...defaultStats, totalMinutes: 60 })).toBe(true);
  });

  it('awards exercise badges when threshold met', () => {
    const badge = badgeDefinitions.find((b) => b.id === 'badge-exercises-10')!;
    const exercises = Array.from({ length: 10 }, (_, i) => `ex-${i}`);
    expect(checkBadgeEarned(badge, { ...defaultStats, completedExercises: exercises.slice(0, 9) })).toBe(false);
    expect(checkBadgeEarned(badge, { ...defaultStats, completedExercises: exercises })).toBe(true);
  });

  it('awards zone badges when threshold met', () => {
    const badge = badgeDefinitions.find((b) => b.id === 'badge-zones-all')!;
    const zones = ['front', 'yeux', 'joues', 'bouche', 'ovale', 'cou'];
    expect(checkBadgeEarned(badge, { ...defaultStats, zonesExplored: zones.slice(0, 5) })).toBe(false);
    expect(checkBadgeEarned(badge, { ...defaultStats, zonesExplored: zones })).toBe(true);
  });

  it('awards program badges when threshold met', () => {
    const badge = badgeDefinitions.find((b) => b.id === 'badge-program-first')!;
    expect(checkBadgeEarned(badge, { ...defaultStats, completedPrograms: [] })).toBe(false);
    expect(checkBadgeEarned(badge, { ...defaultStats, completedPrograms: ['prog-1'] })).toBe(true);
  });
});

describe('getBadgeProgress', () => {
  it('returns 0 for no progress', () => {
    const badge = badgeDefinitions.find((b) => b.id === 'badge-streak-7')!;
    expect(getBadgeProgress(badge, defaultStats)).toBe(0);
  });

  it('returns fraction for partial progress', () => {
    const badge = badgeDefinitions.find((b) => b.id === 'badge-sessions-10')!;
    expect(getBadgeProgress(badge, { ...defaultStats, totalSessions: 5 })).toBe(0.5);
  });

  it('caps at 1 for completed badges', () => {
    const badge = badgeDefinitions.find((b) => b.id === 'badge-streak-3')!;
    expect(getBadgeProgress(badge, { ...defaultStats, currentStreak: 100 })).toBe(1);
  });
});

describe('getNextBadgeToEarn', () => {
  it('returns the closest badge to earn', () => {
    const stats = { ...defaultStats, currentStreak: 2, totalSessions: 1 };
    const next = getNextBadgeToEarn([], stats);
    expect(next).not.toBeNull();
    // Should be streak-3 since we're at 2/3 (66%) vs sessions-10 at 1/10 (10%)
    expect(next?.id).toBe('badge-streak-3');
  });

  it('excludes already earned badges', () => {
    const stats = { ...defaultStats, currentStreak: 5 };
    const next = getNextBadgeToEarn(['badge-streak-3'], stats);
    expect(next?.id).toBe('badge-streak-7');
  });

  it('returns null when all badges earned', () => {
    const allIds = badgeDefinitions.map((b) => b.id);
    const next = getNextBadgeToEarn(allIds, defaultStats);
    expect(next).toBeNull();
  });
});

describe('getRandomMessage', () => {
  it('returns a string from the given category', () => {
    const message = getRandomMessage('sessionStart');
    expect(motivationalMessages.sessionStart).toContain(message);
  });

  it('works for all categories', () => {
    const categories: (keyof typeof motivationalMessages)[] = [
      'sessionStart',
      'sessionComplete',
      'streakContinue',
      'streakRestart',
      'gentleReminder',
      'achievements',
    ];
    categories.forEach((category) => {
      const message = getRandomMessage(category);
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });
  });
});
