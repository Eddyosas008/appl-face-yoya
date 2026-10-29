import { getLocalDateKey, getLocalMonday, getLocalMondayKey } from '../date';

// Dates construites avec des composants LOCAUX (mois indexé à 0).
// Octobre 2026 : lundi 19, dimanche 25, lundi 26.
const sundayLateEvening = new Date(2026, 9, 25, 23, 45, 30);
const mondayEarlyMorning = new Date(2026, 9, 26, 0, 5, 0);
const mondayLateEvening = new Date(2026, 9, 26, 23, 59, 59);
const wednesdayNoon = new Date(2026, 9, 28, 12, 0, 0);

describe('getLocalDateKey', () => {
  it('formats the local calendar date as zero-padded YYYY-MM-DD', () => {
    expect(getLocalDateKey(new Date(2026, 0, 5, 9, 0, 0))).toBe('2026-01-05');
    expect(getLocalDateKey(new Date(2026, 11, 31, 0, 0, 0))).toBe('2026-12-31');
  });

  it('keeps the local day for a late-evening time regardless of UTC offset', () => {
    // 23:45 local must remain the 25th even if UTC is already the 26th (or still the 24th).
    expect(getLocalDateKey(sundayLateEvening)).toBe('2026-10-25');
  });

  it('defaults to now', () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    expect(getLocalDateKey()).toBe(expected);
  });
});

describe('getLocalMonday', () => {
  it('returns the previous Monday at local midnight for a Sunday', () => {
    const monday = getLocalMonday(sundayLateEvening);
    expect(monday.getFullYear()).toBe(2026);
    expect(monday.getMonth()).toBe(9);
    expect(monday.getDate()).toBe(19);
    expect(monday.getDay()).toBe(1);
    expect(monday.getHours()).toBe(0);
    expect(monday.getMinutes()).toBe(0);
  });

  it('returns the same day at local midnight for a Monday', () => {
    const monday = getLocalMonday(mondayLateEvening);
    expect(monday.getDate()).toBe(26);
    expect(monday.getDay()).toBe(1);
    expect(monday.getHours()).toBe(0);
  });

  it('does not mutate the input date', () => {
    const input = new Date(wednesdayNoon.getTime());
    getLocalMonday(input);
    expect(input.getTime()).toBe(wednesdayNoon.getTime());
  });
});

describe('getLocalMondayKey', () => {
  it('maps a Sunday (late evening) to the Monday that started that week', () => {
    expect(getLocalMondayKey(sundayLateEvening)).toBe('2026-10-19');
  });

  it('maps a Monday (early morning and late evening) to itself', () => {
    expect(getLocalMondayKey(mondayEarlyMorning)).toBe('2026-10-26');
    expect(getLocalMondayKey(mondayLateEvening)).toBe('2026-10-26');
  });

  it('is stable across every day of the same week', () => {
    const keys = [0, 1, 2, 3, 4, 5, 6].map((offset) =>
      getLocalMondayKey(new Date(2026, 9, 26 + offset, 23, 30))
    );
    expect(new Set(keys)).toEqual(new Set(['2026-10-26']));
  });

  it('crosses month boundaries using local date parts', () => {
    // Dimanche 1er novembre 2026 -> lundi 26 octobre 2026
    expect(getLocalMondayKey(new Date(2026, 10, 1, 23, 0))).toBe('2026-10-26');
  });
});
