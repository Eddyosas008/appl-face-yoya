import { exercises } from '../../../data/exercises';
import {
  EXERCISE_MOTIONS,
  MOUTH_SHAPES,
  MotionSpec,
  Track,
  circleTrack,
  getMotionCaption,
  getMotionForExercise,
  mouthPath,
} from '../motions';

const expectValidTrack = (track: Track | undefined, label: string) => {
  if (!track) return;
  expect(track.input.length).toBeGreaterThanOrEqual(2);
  expect(track.output.length).toBe(track.input.length);
  expect(track.input[0]).toBe(0);
  expect(track.input[track.input.length - 1]).toBe(1);
  for (let i = 1; i < track.input.length; i++) {
    // Animated.interpolate exige une inputRange croissante
    expect(track.input[i]).toBeGreaterThanOrEqual(track.input[i - 1]);
  }
  track.output.forEach((v) => expect(Number.isFinite(v)).toBe(true));
  // label utilisé pour un message lisible en cas d'échec
  expect(label).toBeTruthy();
};

const expectValidSpec = (spec: MotionSpec) => {
  expect(spec.duration).toBeGreaterThan(0);
  expect(['pingpong', 'cycle']).toContain(spec.loop);
  expect(spec.highlight.length).toBeGreaterThan(0);
  expect(spec.caption.trim().length).toBeGreaterThan(0);

  const tracks: Array<[string, Track | undefined]> = [
    ['browLift', spec.browLift],
    ['browInner', spec.browInner],
    ['eyeOpen', spec.eyeOpen],
    ['pupilX', spec.pupilX],
    ['pupilY', spec.pupilY],
    ['pupilConverge', spec.pupilConverge],
    ['cheekLeft', spec.cheekLeft],
    ['cheekRight', spec.cheekRight],
    ['jawOpen', spec.jawOpen],
    ['headRotate', spec.headRotate],
    ['headTilt', spec.headTilt],
    ['turn', spec.turn],
  ];
  tracks.forEach(([label, track]) => expectValidTrack(track, `${spec.id}.${label}`));

  if (spec.mouth) {
    expect(spec.mouth.shapes.length).toBe(spec.mouth.input.length);
    spec.mouth.shapes.forEach((shape) => expect(MOUTH_SHAPES[shape]).toBeDefined());
  }

  (spec.touch ?? []).forEach((tp, i) => {
    expectValidTrack(tp.x, `${spec.id}.touch[${i}].x`);
    expectValidTrack(tp.y, `${spec.id}.touch[${i}].y`);
    // Les points restent dans le viewBox
    tp.x.output.forEach((x) => expect(x).toBeGreaterThanOrEqual(0));
    tp.x.output.forEach((x) => expect(x).toBeLessThanOrEqual(200));
    tp.y.output.forEach((y) => expect(y).toBeGreaterThanOrEqual(0));
    tp.y.output.forEach((y) => expect(y).toBeLessThanOrEqual(240));
  });
};

describe('FaceIllustration motions', () => {
  it('définit une animation dédiée pour chacun des exercices du catalogue', () => {
    exercises.forEach((exercise) => {
      expect(EXERCISE_MOTIONS[exercise.id]).toBeDefined();
    });
    expect(Object.keys(EXERCISE_MOTIONS).length).toBe(exercises.length);
  });

  it('chaque spécification est valide pour Animated.interpolate', () => {
    Object.values(EXERCISE_MOTIONS).forEach(expectValidSpec);
  });

  it('les formes de bouche sont interpolables entre elles (même structure)', () => {
    const lengths = new Set(Object.values(MOUTH_SHAPES).map((s) => s.length));
    expect(lengths.size).toBe(1);
    expect([...lengths][0]).toBe(10);
    expect(mouthPath(MOUTH_SHAPES.neutral)).toMatch(/^M [\d.]+ [\d.]+ Q .* Z$/);
  });

  it('repli par zone lorsque l’exercice est inconnu', () => {
    const spec = getMotionForExercise('inconnu', 'joues');
    expect(spec.highlight).toContain('cheeks');
    expectValidSpec(spec);
    expect(getMotionForExercise(undefined, 'cou').highlight).toContain('neck');
    expect(getMotionCaption('ex-bouche-001')).toContain('O');
  });

  it('circleTrack produit une trajectoire fermée', () => {
    const track = circleTrack(50, 50, 10, { steps: 8 });
    expect(track.x.output[0]).toBeCloseTo(track.x.output[8], 5);
    expect(track.y.output[0]).toBeCloseTo(track.y.output[8], 5);
    expect(track.x.input[8]).toBe(1);
  });
});
