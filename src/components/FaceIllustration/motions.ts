// ============================================
// ANIMATIONS DE FACE YOGA - SPÉCIFICATIONS
// ============================================
// Chaque exercice est décrit par une "MotionSpec" purement déclarative :
// des pistes de keyframes (0 → 1) qui pilotent le visage SVG animé.
// Le composant FaceIllustration lit ces specs ; aucune logique d'animation ici.

import { FaceZone } from '../../types';

// Dimensions du viewBox du visage (partagées par tous les composants)
export const FACE_VB_WIDTH = 200;
export const FACE_VB_HEIGHT = 240;
// Point de pivot (base du cou) pour les rotations de tête
export const HEAD_PIVOT_Y = 170;

// ---------- Pistes de keyframes ----------
export interface Track {
  input: number[];   // progression 0 → 1 (croissante)
  output: number[];  // valeur associée
}

export const kf = (input: number[], output: number[]): Track => ({ input, output });
/** Piste simple "de → vers" */
export const lin = (from: number, to: number): Track => kf([0, 1], [from, to]);
/** Piste constante */
export const constant = (value: number): Track => kf([0, 1], [value, value]);

export interface TouchPoint {
  x: Track;
  y: Track;
  r?: number;     // rayon du point (unités viewBox)
}

/** Génère une trajectoire circulaire (approximée par `steps` segments). */
export const circleTrack = (
  cx: number,
  cy: number,
  r: number,
  options: { steps?: number; clockwise?: boolean; phase?: number } = {}
): TouchPoint => {
  const { steps = 16, clockwise = true, phase = 0 } = options;
  const input: number[] = [];
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = phase + (clockwise ? 1 : -1) * t * Math.PI * 2;
    input.push(Number(t.toFixed(4)));
    xs.push(Number((cx + r * Math.cos(angle)).toFixed(2)));
    ys.push(Number((cy + r * Math.sin(angle)).toFixed(2)));
  }
  return { x: kf(input, xs), y: kf(input, ys), r: 5 };
};

/** Point de contact qui glisse d'un point A à un point B. */
export const slideTrack = (
  from: [number, number],
  to: [number, number],
  r = 5
): TouchPoint => ({
  x: lin(from[0], to[0]),
  y: lin(from[1], to[1]),
  r,
});

/** Point de contact fixe qui "pulse" légèrement (pression). */
export const pressTrack = (x: number, y: number, amplitude = 2, r = 6): TouchPoint => ({
  x: constant(x),
  y: kf([0, 1], [y, y + amplitude]),
  r,
});

// ---------- Formes de bouche ----------
// Chaque forme = 10 nombres : M a b Q c d e f Q g h i j Z
// (lèvre supérieure puis lèvre inférieure) → interpolables entre elles.
export type MouthShape =
  | 'neutral'
  | 'tight'
  | 'smile'
  | 'wide'
  | 'o'
  | 'oSoft'
  | 'pucker'
  | 'upperStretch'
  | 'open'
  | 'vowelE'
  | 'vowelI'
  | 'vowelU';

export const MOUTH_SHAPES: Record<MouthShape, number[]> = {
  neutral: [84, 152, 100, 150, 116, 152, 100, 157, 84, 152],
  tight: [86, 152, 100, 151, 114, 152, 100, 153.5, 86, 152],
  smile: [78, 148, 100, 158, 122, 148, 100, 166, 78, 148],
  wide: [72, 149, 100, 154, 128, 149, 100, 170, 72, 149],
  o: [91, 152, 100, 137, 109, 152, 100, 167, 91, 152],
  oSoft: [92, 153, 100, 143, 108, 153, 100, 163, 92, 153],
  pucker: [94, 152, 100, 144, 106, 152, 100, 160, 94, 152],
  upperStretch: [82, 154, 100, 154, 118, 154, 100, 164, 82, 154],
  open: [86, 148, 100, 142, 114, 148, 100, 170, 86, 148],
  vowelE: [76, 151, 100, 151, 124, 151, 100, 159, 76, 151],
  vowelI: [74, 150, 100, 152, 126, 150, 100, 156, 74, 150],
  vowelU: [95, 152, 100, 146, 105, 152, 100, 158, 95, 152],
};

export const mouthPath = (shape: number[]): string => {
  const [a, b, c, d, e, f, g, h, i, j] = shape;
  return `M ${a} ${b} Q ${c} ${d} ${e} ${f} Q ${g} ${h} ${i} ${j} Z`;
};

export interface MouthTrack {
  input: number[];
  shapes: MouthShape[];
}

// ---------- Zones à surligner ----------
export type HighlightZone =
  | 'forehead'
  | 'temples'
  | 'brows'
  | 'eyes'
  | 'cheeks'
  | 'mouth'
  | 'jaw'
  | 'chin'
  | 'neck'
  | 'shoulders'
  | 'face';

// ---------- Spécification complète d'un mouvement ----------
export interface MotionSpec {
  id: string;
  /** 'pingpong' : aller-retour fluide, 'cycle' : boucle continue (cercles, séquences) */
  loop: 'pingpong' | 'cycle';
  /** Durée d'un passage 0 → 1 en ms */
  duration: number;
  highlight: HighlightZone[];
  /** Consigne courte affichée sous l'illustration */
  caption: string;

  browLift?: Track;      // translation verticale des sourcils (négatif = vers le haut)
  browInner?: Track;     // décalage vertical des extrémités internes (froncement > 0)
  eyeOpen?: Track;       // ouverture des yeux (0 fermé, 1 normal, 1.5 grand ouvert)
  pupilX?: Track;        // décalage horizontal commun des pupilles
  pupilY?: Track;        // décalage vertical commun des pupilles
  pupilConverge?: Track; // convergence (focus proche) : gauche +c / droite -c
  mouth?: MouthTrack;    // forme de la bouche
  cheekLeft?: Track;     // gonflement joue gauche (-1 creusée … 1 gonflée)
  cheekRight?: Track;    // gonflement joue droite
  jawOpen?: Track;       // translation verticale de la bouche/menton (ouverture)
  headRotate?: Track;    // rotation de la tête (degrés) autour de la base du cou
  headTilt?: Track;      // translation verticale de la tête (flexion / extension)
  turn?: Track;          // translation horizontale des traits (rotation du cou)
  touch?: TouchPoint[];  // points de contact des doigts
}

// ---------- Mouvements par exercice ----------
const base = (
  id: string,
  caption: string,
  highlight: HighlightZone[],
  partial: Partial<MotionSpec> = {}
): MotionSpec => ({
  id,
  loop: 'pingpong',
  duration: 2400,
  highlight,
  caption,
  ...partial,
});

const relaxedEyes: Track = constant(0.9);

export const EXERCISE_MOTIONS: Record<string, MotionSpec> = {
  // ----- FRONT -----
  'ex-front-001': base('forehead-slide', 'Glissez des mains du centre vers les tempes', ['forehead'], {
    duration: 2600,
    eyeOpen: relaxedEyes,
    browLift: constant(0),
    touch: [
      slideTrack([92, 68], [50, 80], 6),
      slideTrack([108, 68], [150, 80], 6),
      slideTrack([92, 58], [56, 70], 5),
      slideTrack([108, 58], [144, 70], 5),
    ],
  }),
  'ex-front-002': base('brow-lift', 'Levez les sourcils contre une légère résistance', ['brows', 'forehead'], {
    duration: 1800,
    browLift: kf([0, 0.6, 1], [0, -6, -6]),
    eyeOpen: kf([0, 0.6, 1], [1, 1.25, 1.25]),
    touch: [
      { x: constant(72), y: kf([0, 0.6, 1], [70, 66, 66]), r: 6 },
      { x: constant(128), y: kf([0, 0.6, 1], [70, 66, 66]), r: 6 },
    ],
  }),
  'ex-front-003': base('temple-circles', 'Petits cercles lents sur les tempes', ['temples'], {
    loop: 'cycle',
    duration: 3000,
    eyeOpen: kf([0, 1], [0.35, 0.35]),
    touch: [
      circleTrack(46, 86, 5, { clockwise: true }),
      circleTrack(154, 86, 5, { clockwise: false }),
    ],
  }),
  'ex-front-004': base('forehead-pinch', 'Pincez délicatement du centre vers les tempes', ['forehead'], {
    duration: 2800,
    touch: [
      slideTrack([97, 66], [58, 76], 4),
      slideTrack([103, 70], [62, 80], 4),
      slideTrack([103, 66], [142, 76], 4),
      slideTrack([97, 70], [138, 80], 4),
    ],
  }),
  'ex-front-005': base('glabella-press', 'Lissez l’espace entre les sourcils', ['brows'], {
    duration: 2400,
    browInner: kf([0, 1], [3, -1]),
    eyeOpen: relaxedEyes,
    touch: [
      slideTrack([96, 84], [82, 80], 5),
      slideTrack([104, 84], [118, 80], 5),
    ],
  }),

  // ----- YEUX -----
  'ex-yeux-001': base('eye-circles', 'Dessinez des cercles autour des yeux', ['eyes'], {
    loop: 'cycle',
    duration: 3200,
    eyeOpen: constant(0.75),
    touch: [
      circleTrack(76, 97, 18, { clockwise: false, phase: Math.PI }),
      circleTrack(124, 97, 18, { clockwise: true }),
    ],
  }),
  'ex-yeux-002': base('eyelid-press', 'Pression très douce sur les paupières fermées', ['eyes'], {
    duration: 2000,
    eyeOpen: constant(0.1),
    browLift: constant(0),
    touch: [pressTrack(76, 95, 1.5, 7), pressTrack(124, 95, 1.5, 7)],
  }),
  'ex-yeux-003': base('eyelid-lift', 'Ouvrez grand les yeux, sourcils immobiles', ['eyes', 'brows'], {
    duration: 2000,
    browLift: constant(0),
    eyeOpen: kf([0, 0.5, 1], [1, 1.5, 1.5]),
    touch: [pressTrack(70, 72, 0, 6), pressTrack(130, 72, 0, 6)],
  }),
  'ex-yeux-004': base('eye-drainage', 'Tapotez du coin interne vers le coin externe', ['eyes'], {
    duration: 2600,
    eyeOpen: constant(0.85),
    touch: [
      slideTrack([90, 107], [60, 104], 5),
      slideTrack([110, 107], [140, 104], 5),
    ],
  }),
  'ex-yeux-005': base('eye-focus', 'Alternez regard proche et regard lointain', ['eyes'], {
    duration: 2400,
    eyeOpen: constant(1.1),
    pupilConverge: kf([0, 1], [0, 3.5]),
    pupilY: kf([0, 1], [0, 1]),
  }),

  // ----- JOUES -----
  'ex-joues-001': base('cheek-puff', 'Gonflez les deux joues et maintenez', ['cheeks'], {
    duration: 2200,
    mouth: { input: [0, 1], shapes: ['neutral', 'tight'] },
    cheekLeft: kf([0, 0.7, 1], [0, 1, 1]),
    cheekRight: kf([0, 0.7, 1], [0, 1, 1]),
  }),
  'ex-joues-002': base('air-transfer', 'Transférez l’air d’une joue à l’autre', ['cheeks'], {
    duration: 1600,
    mouth: { input: [0, 1], shapes: ['tight', 'tight'] },
    cheekLeft: kf([0, 1], [1, 0]),
    cheekRight: kf([0, 1], [0, 1]),
  }),
  'ex-joues-003': base('smile-resist', 'Souriez contre la résistance des doigts', ['cheeks', 'mouth'], {
    duration: 2000,
    mouth: { input: [0, 1], shapes: ['neutral', 'smile'] },
    cheekLeft: kf([0, 1], [0, 0.45]),
    cheekRight: kf([0, 1], [0, 0.45]),
    touch: [
      { x: kf([0, 1], [82, 80]), y: kf([0, 1], [150, 147]), r: 5 },
      { x: kf([0, 1], [118, 120]), y: kf([0, 1], [150, 147]), r: 5 },
    ],
  }),
  'ex-joues-004': base('cheek-massage', 'Cercles doux sur les pommettes', ['cheeks'], {
    loop: 'cycle',
    duration: 2800,
    touch: [
      circleTrack(66, 124, 7, { clockwise: false }),
      circleTrack(134, 124, 7, { clockwise: true }),
    ],
  }),
  'ex-joues-005': base('cheek-suck', 'Creusez les joues en « bouche de poisson »', ['cheeks', 'mouth'], {
    duration: 2200,
    mouth: { input: [0, 1], shapes: ['neutral', 'pucker'] },
    cheekLeft: kf([0, 1], [0, -1]),
    cheekRight: kf([0, 1], [0, -1]),
  }),

  // ----- BOUCHE -----
  'ex-bouche-001': base('mouth-o', 'Formez un grand « O » en couvrant les dents', ['mouth'], {
    duration: 2400,
    mouth: { input: [0, 1], shapes: ['neutral', 'o'] },
    jawOpen: kf([0, 1], [0, 6]),
    eyeOpen: constant(1.05),
  }),
  'ex-bouche-002': base('duck-lips', 'Avancez les lèvres en « bec de canard »', ['mouth'], {
    duration: 2000,
    mouth: { input: [0, 1], shapes: ['neutral', 'pucker'] },
    cheekLeft: kf([0, 1], [0, -0.3]),
    cheekRight: kf([0, 1], [0, -0.3]),
  }),
  'ex-bouche-003': base('upper-lip-stretch', 'Étirez la lèvre supérieure vers le bas', ['mouth'], {
    duration: 2400,
    mouth: { input: [0, 1], shapes: ['neutral', 'upperStretch'] },
    jawOpen: kf([0, 1], [0, 3]),
  }),
  'ex-bouche-004': base('wide-smile', 'Souriez le plus largement possible', ['mouth', 'cheeks'], {
    duration: 2200,
    mouth: { input: [0, 1], shapes: ['neutral', 'wide'] },
    cheekLeft: kf([0, 1], [0, 0.6]),
    cheekRight: kf([0, 1], [0, 0.6]),
    eyeOpen: kf([0, 1], [1, 0.8]),
  }),
  'ex-bouche-005': base('vowels', 'Articulez A – E – I – O – U en exagérant', ['mouth'], {
    loop: 'cycle',
    duration: 5000,
    mouth: {
      input: [0, 0.2, 0.4, 0.6, 0.8, 1],
      shapes: ['open', 'vowelE', 'vowelI', 'o', 'vowelU', 'open'],
    },
    jawOpen: kf([0, 0.2, 0.4, 0.6, 0.8, 1], [6, 2, 1, 5, 2, 6]),
  }),

  // ----- OVALE -----
  'ex-ovale-001': base('oval-lift', 'Remontez du menton vers les oreilles', ['jaw'], {
    duration: 2800,
    touch: [
      slideTrack([90, 178], [46, 126], 7),
      slideTrack([110, 178], [154, 126], 7),
    ],
  }),
  'ex-ovale-002': base('chin-resist', 'Ouvrez la bouche contre le poing sous le menton', ['chin', 'jaw'], {
    duration: 2200,
    mouth: { input: [0, 1], shapes: ['tight', 'oSoft'] },
    jawOpen: kf([0, 1], [0, 8]),
    touch: [pressTrack(100, 194, 2, 9)],
  }),
  'ex-ovale-003': base('neck-side-stretch', 'Inclinez doucement la tête sur le côté', ['neck'], {
    duration: 3000,
    headRotate: kf([0, 1], [0, -18]),
    eyeOpen: relaxedEyes,
    touch: [pressTrack(148, 110, 0, 6)],
  }),
  'ex-ovale-004': base('tongue-palate', 'Langue au palais, menton légèrement relevé', ['jaw', 'neck'], {
    duration: 2600,
    headTilt: kf([0, 1], [0, -5]),
    pupilY: kf([0, 1], [0, -2]),
    mouth: { input: [0, 1], shapes: ['neutral', 'tight'] },
  }),
  'ex-ovale-005': base('jaw-massage', 'Massez le long de la mâchoire', ['jaw'], {
    duration: 3000,
    touch: [
      slideTrack([92, 182], [50, 134], 8),
      slideTrack([108, 182], [150, 134], 8),
    ],
  }),

  // ----- COU & MÂCHOIRE -----
  'ex-cou-001': base('jaw-release', 'Relâchez la mâchoire, bouche entrouverte', ['jaw'], {
    duration: 3000,
    mouth: { input: [0, 1], shapes: ['tight', 'oSoft'] },
    jawOpen: kf([0, 1], [0, 10]),
    eyeOpen: relaxedEyes,
  }),
  'ex-cou-002': base('neck-rotation', 'Tournez lentement la tête de gauche à droite', ['neck'], {
    duration: 3200,
    turn: kf([0, 1], [-12, 12]),
    headRotate: kf([0, 1], [4, -4]),
    eyeOpen: constant(0.95),
  }),
  'ex-cou-003': base('platysma', 'Tête en arrière, lèvre inférieure vers le haut', ['neck'], {
    duration: 2800,
    headTilt: kf([0, 1], [0, -7]),
    pupilY: kf([0, 1], [0, -2.5]),
    mouth: { input: [0, 1], shapes: ['neutral', 'upperStretch'] },
  }),
  'ex-cou-004': base('trapezius', 'Pressez et relâchez les trapèzes', ['shoulders', 'neck'], {
    duration: 1800,
    touch: [pressTrack(62, 204, 3, 8), pressTrack(138, 204, 3, 8)],
    eyeOpen: relaxedEyes,
  }),
  'ex-cou-005': base('neck-flexion', 'Amenez doucement le menton vers la poitrine', ['neck'], {
    duration: 3000,
    headTilt: kf([0, 1], [0, 9]),
    pupilY: kf([0, 1], [0, 2.5]),
    eyeOpen: kf([0, 1], [1, 0.6]),
  }),
};

// ---------- Mouvement par défaut selon la zone ----------
const ZONE_FALLBACK: Record<FaceZone, MotionSpec> = {
  front: base('zone-front', 'Détendez le front', ['forehead'], { eyeOpen: relaxedEyes }),
  yeux: base('zone-yeux', 'Relâchez le contour des yeux', ['eyes'], { eyeOpen: kf([0, 1], [1, 0.6]) }),
  joues: base('zone-joues', 'Activez les joues', ['cheeks'], {
    cheekLeft: kf([0, 1], [0, 0.5]),
    cheekRight: kf([0, 1], [0, 0.5]),
  }),
  bouche: base('zone-bouche', 'Mobilisez la bouche', ['mouth'], {
    mouth: { input: [0, 1], shapes: ['neutral', 'smile'] },
  }),
  ovale: base('zone-ovale', 'Redessinez l’ovale', ['jaw'], { jawOpen: kf([0, 1], [0, 4]) }),
  cou: base('zone-cou', 'Libérez le cou', ['neck'], { headRotate: kf([0, 1], [-8, 8]) }),
  global: base('zone-global', 'Respirez et détendez tout le visage', ['face'], {
    eyeOpen: kf([0, 1], [1, 0.8]),
  }),
};

export const getMotionForExercise = (exerciseId?: string, zone: FaceZone = 'global'): MotionSpec =>
  (exerciseId && EXERCISE_MOTIONS[exerciseId]) || ZONE_FALLBACK[zone] || ZONE_FALLBACK.global;

export const getMotionCaption = (exerciseId?: string, zone?: FaceZone): string =>
  getMotionForExercise(exerciseId, zone).caption;
