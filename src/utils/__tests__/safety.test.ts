import {
  filterExercisesForHealth,
  getBlockedContraindications,
  isExerciseSafeForHealth,
} from '../safety';
import { Contraindication, Exercise, UserHealthInfo } from '../../types';

const makeExercise = (id: string, contraindications: Contraindication[] = []): Exercise => ({
  id,
  name: id,
  slug: id,
  zone: 'global',
  duration: 60,
  difficulty: 'debutant',
  description: '',
  benefits: [],
  steps: [],
  commonErrors: [],
  corrections: [],
  contraindications,
  tips: [],
});

const safe = makeExercise('safe');
const atm = makeExercise('atm', ['atm']);
const postSurgery = makeExercise('post-surgery', ['post_chirurgie']);
const injections = makeExercise('injections', ['injections_recentes', 'hypertension']);
const glaucoma = makeExercise('glaucoma', ['glaucome']);
const all = [safe, atm, postSurgery, injections, glaucoma];

const health = (overrides: Partial<UserHealthInfo> = {}): UserHealthInfo => ({
  contraindications: [],
  recentProcedures: false,
  ...overrides,
});

describe('getBlockedContraindications', () => {
  it('returns declared contraindications when no recent procedure', () => {
    expect(getBlockedContraindications(health({ contraindications: ['atm'] }))).toEqual(['atm']);
  });

  it('adds post_chirurgie and injections_recentes when recentProcedures is true', () => {
    const blocked = getBlockedContraindications(health({ recentProcedures: true }));
    expect(blocked).toEqual(expect.arrayContaining(['post_chirurgie', 'injections_recentes']));
    expect(blocked).toHaveLength(2);
  });

  it('does not duplicate entries', () => {
    const blocked = getBlockedContraindications(
      health({ recentProcedures: true, contraindications: ['post_chirurgie'] })
    );
    expect(blocked.filter((c) => c === 'post_chirurgie')).toHaveLength(1);
  });
});

describe('filterExercisesForHealth', () => {
  it('returns every exercise for a profile without precautions', () => {
    expect(filterExercisesForHealth(all, health())).toEqual(all);
  });

  it('excludes exercises whose contraindications intersect the user contraindications', () => {
    const result = filterExercisesForHealth(all, health({ contraindications: ['atm', 'glaucome'] }));
    expect(result.map((e) => e.id)).toEqual(['safe', 'post-surgery', 'injections']);
  });

  it('matches on any contraindication of a multi-contraindication exercise', () => {
    const result = filterExercisesForHealth(all, health({ contraindications: ['hypertension'] }));
    expect(result.map((e) => e.id)).not.toContain('injections');
  });

  it('excludes post-surgery and recent-injection exercises when recentProcedures is true', () => {
    const result = filterExercisesForHealth(all, health({ recentProcedures: true }));
    expect(result.map((e) => e.id)).toEqual(['safe', 'atm', 'glaucoma']);
  });

  it('combines declared contraindications with recent procedures', () => {
    const result = filterExercisesForHealth(
      all,
      health({ recentProcedures: true, contraindications: ['atm'] })
    );
    expect(result.map((e) => e.id)).toEqual(['safe', 'glaucoma']);
  });

  it('can filter everything out', () => {
    const result = filterExercisesForHealth(
      [postSurgery, injections],
      health({ recentProcedures: true })
    );
    expect(result).toEqual([]);
  });

  it('does not mutate the input array', () => {
    const input = [...all];
    filterExercisesForHealth(input, health({ contraindications: ['atm'] }));
    expect(input).toEqual(all);
  });
});

describe('isExerciseSafeForHealth', () => {
  it('agrees with filterExercisesForHealth', () => {
    const info = health({ recentProcedures: true, contraindications: ['glaucome'] });
    const kept = filterExercisesForHealth(all, info).map((e) => e.id);
    all.forEach((exercise) => {
      expect(isExerciseSafeForHealth(exercise, info)).toBe(kept.includes(exercise.id));
    });
  });
});
