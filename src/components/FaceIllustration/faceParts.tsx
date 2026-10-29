// ============================================
// PARTIES STATIQUES DU VISAGE (SVG)
// ============================================
// Formes partagées entre l'illustration animée et les vignettes statiques.
// Toutes les coordonnées sont exprimées dans le viewBox 200 x 240.

import React from 'react';
import {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { colors } from '../../theme';
import { FaceZone } from '../../types';
import { HighlightZone } from './motions';

export interface FacePalette {
  skin: string;
  skinLight: string;
  skinShade: string;
  blush: string;
  hair: string;
  hairLight: string;
  feature: string;
  iris: string;
  lips: string;
  lipsDark: string;
  top: string;
  topLight: string;
  glow: string;
  highlight: string;
  touch: string;
}

/** Carnations proposées dans les réglages. */
export type FaceTone = 'light' | 'medium' | 'tan' | 'deep';

const BRAND = {
  top: colors.accent.greenDark,
  topLight: colors.accent.green,
  glow: colors.accent.green,
  highlight: colors.accent.green,
  touch: colors.accent.teal,
};

export const FACE_TONES: Record<FaceTone, FacePalette> = {
  light: {
    ...BRAND,
    skin: '#F3D9C4',
    skinLight: '#FBE9DB',
    skinShade: '#D8B094',
    blush: '#F5A5A0',
    hair: '#6E4B3A',
    hairLight: '#8C6652',
    feature: '#4A3A30',
    iris: '#5E7E8C',
    lips: '#D5807A',
    lipsDark: '#B7615D',
  },
  medium: {
    ...BRAND,
    skin: '#EBC9A9',
    skinLight: '#F6DEC6',
    skinShade: '#D2A27C',
    blush: '#F2A48E',
    hair: '#4F3A30',
    hairLight: '#6D5245',
    feature: '#4A3A30',
    iris: '#5C6F4E',
    lips: '#C9776A',
    lipsDark: '#A85B52',
  },
  tan: {
    ...BRAND,
    skin: '#C9966D',
    skinLight: '#DCB08A',
    skinShade: '#A87353',
    blush: '#DA8A75',
    hair: '#30221B',
    hairLight: '#4B372E',
    feature: '#3B2A22',
    iris: '#4E3B2E',
    lips: '#A95F53',
    lipsDark: '#884841',
  },
  deep: {
    ...BRAND,
    skin: '#8E5B3D',
    skinLight: '#A77151',
    skinShade: '#6C432B',
    blush: '#B56C58',
    hair: '#1F1613',
    hairLight: '#3A2B25',
    feature: '#2A1C16',
    iris: '#3A2A22',
    lips: '#7F4B41',
    lipsDark: '#5F3731',
  },
};

export const FACE_TONE_LABELS: Record<FaceTone, string> = {
  light: 'Claire',
  medium: 'Médium',
  tan: 'Hâlée',
  deep: 'Foncée',
};

export const DEFAULT_FACE_TONE: FaceTone = 'medium';
export const DEFAULT_FACE_PALETTE: FacePalette = FACE_TONES[DEFAULT_FACE_TONE];

/** Zone de surlignage par défaut pour chaque zone d'exercice. */
export const ZONE_TO_HIGHLIGHT: Record<FaceZone, HighlightZone[]> = {
  front: ['forehead'],
  yeux: ['eyes'],
  joues: ['cheeks'],
  bouche: ['mouth'],
  ovale: ['jaw'],
  cou: ['neck'],
  global: ['face'],
};

interface PartProps {
  palette: FacePalette;
  /** Préfixe unique pour les identifiants de dégradés (évite les collisions). */
  uid: string;
}

/** Identifiants de dégradés partagés. */
export const gradientIds = (uid: string) => ({
  skin: `${uid}-skin`,
  blush: `${uid}-blush`,
  top: `${uid}-top`,
  hair: `${uid}-hair`,
  glow: `${uid}-glow`,
});

/** Définitions de dégradés (à placer une fois par <Svg>). */
export const FaceDefs: React.FC<PartProps> = ({ palette, uid }) => {
  const ids = gradientIds(uid);
  return (
    <Defs>
      <RadialGradient id={ids.skin} cx="46%" cy="36%" rx="64%" ry="62%" fx="44%" fy="32%">
        <Stop offset="0" stopColor={palette.skinLight} />
        <Stop offset="0.55" stopColor={palette.skin} />
        <Stop offset="1" stopColor={palette.skinShade} />
      </RadialGradient>
      <RadialGradient id={ids.blush} cx="50%" cy="50%" rx="50%" ry="50%">
        <Stop offset="0" stopColor={palette.blush} stopOpacity={1} />
        <Stop offset="0.6" stopColor={palette.blush} stopOpacity={0.55} />
        <Stop offset="1" stopColor={palette.blush} stopOpacity={0} />
      </RadialGradient>
      <RadialGradient id={ids.glow} cx="50%" cy="50%" rx="50%" ry="50%">
        <Stop offset="0" stopColor={palette.glow} stopOpacity={0.22} />
        <Stop offset="0.7" stopColor={palette.glow} stopOpacity={0.08} />
        <Stop offset="1" stopColor={palette.glow} stopOpacity={0} />
      </RadialGradient>
      <LinearGradient id={ids.top} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor={palette.topLight} />
        <Stop offset="1" stopColor={palette.top} />
      </LinearGradient>
      <LinearGradient id={ids.hair} x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor={palette.hairLight} />
        <Stop offset="0.6" stopColor={palette.hair} />
        <Stop offset="1" stopColor={palette.hair} />
      </LinearGradient>
    </Defs>
  );
};

/** Halo doux derrière la tête. */
export const Glow: React.FC<PartProps> = ({ uid }) => (
  <Circle cx={100} cy={112} r={104} fill={`url(#${gradientIds(uid).glow})`} />
);

/** Épaules + cou (dessinés sous la tête). */
export const Shoulders: React.FC<PartProps> = ({ palette, uid }) => (
  <G>
    {/* Cou */}
    <Rect x={83} y={160} width={34} height={60} rx={15} fill={palette.skin} />
    {/* Ombre portée du menton sur le cou */}
    <Ellipse cx={100} cy={176} rx={17} ry={9} fill={palette.skinShade} opacity={0.5} />
    {/* Haut (encolure arrondie) */}
    <Path
      d="M 18 240 C 22 212 44 200 72 196 C 84 194 90 206 100 206 C 110 206 116 194 128 196 C 156 200 178 212 182 240 Z"
      fill={`url(#${gradientIds(uid).top})`}
    />
    {/* Reflet sur le tissu */}
    <Path
      d="M 30 238 C 36 220 50 210 68 206"
      stroke="#FFFFFF"
      strokeWidth={2}
      strokeLinecap="round"
      fill="none"
      opacity={0.18}
    />
    {/* Clavicules discrètes */}
    <Path d="M 78 214 Q 90 220 100 216" stroke={palette.skinShade} strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.35} />
    <Path d="M 122 214 Q 110 220 100 216" stroke={palette.skinShade} strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.35} />
  </G>
);

/** Contour de la tête (utilisé pour la forme et certaines zones). */
export const HEAD_PATH =
  'M 100 36 C 134 36 160 66 160 104 C 160 136 142 164 122 178 C 112 185 106 187 100 187 C 94 187 88 185 78 178 C 58 164 40 136 40 104 C 40 66 66 36 100 36 Z';

/** Tête : oreilles, ovale, cheveux. */
export const Head: React.FC<PartProps> = ({ palette, uid }) => {
  const ids = gradientIds(uid);
  return (
    <G>
      {/* Oreilles */}
      <Ellipse cx={41} cy={110} rx={7.5} ry={11.5} fill={palette.skinShade} />
      <Ellipse cx={159} cy={110} rx={7.5} ry={11.5} fill={palette.skinShade} />
      <Path d="M 39 104 Q 35 110 39 116" stroke={palette.feature} strokeWidth={1.2} strokeLinecap="round" fill="none" opacity={0.35} />
      <Path d="M 161 104 Q 165 110 161 116" stroke={palette.feature} strokeWidth={1.2} strokeLinecap="round" fill="none" opacity={0.35} />
      {/* Visage */}
      <Path d={HEAD_PATH} fill={`url(#${ids.skin})`} />
      {/* Modelé discret des pommettes */}
      <Path d="M 50 124 Q 58 138 70 146" stroke={palette.skinShade} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.18} />
      <Path d="M 150 124 Q 142 138 130 146" stroke={palette.skinShade} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.18} />
      {/* Cheveux : casque souple avec frange légèrement de côté */}
      <Path
        d="M 38 112 C 32 62 60 26 100 26 C 140 26 168 62 162 112 C 158 90 148 76 132 70 C 116 64 102 72 88 66 C 70 72 50 86 38 112 Z"
        fill={`url(#${ids.hair})`}
      />
      {/* Reflet des cheveux */}
      <Path d="M 64 48 Q 82 32 104 33" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" fill="none" opacity={0.16} />
    </G>
  );
};

/** Nez doux : arête, pointe et narines. */
export const Nose: React.FC<{ palette: FacePalette }> = ({ palette }) => (
  <G>
    <Path d="M 100 106 L 95 128 Q 100 134 105 128" stroke={palette.feature} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.55} />
    <Path d="M 91 129 q 2 2.5 5 1" stroke={palette.feature} strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.45} />
    <Path d="M 109 129 q -2 2.5 -5 1" stroke={palette.feature} strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.45} />
    <Path d="M 101 108 L 98 124" stroke="#FFFFFF" strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.18} />
  </G>
);

/** Formes de surlignage pour une liste de zones. */
export const HighlightShapes: React.FC<{ zones: HighlightZone[]; color: string }> = ({
  zones,
  color,
}) => (
  <G>
    {zones.map((zone) => {
      switch (zone) {
        case 'forehead':
          return <Ellipse key={zone} cx={100} cy={70} rx={40} ry={15} fill={color} />;
        case 'temples':
          return (
            <G key={zone}>
              <Circle cx={46} cy={86} r={12} fill={color} />
              <Circle cx={154} cy={86} r={12} fill={color} />
            </G>
          );
        case 'brows':
          return <Ellipse key={zone} cx={100} cy={78} rx={44} ry={9} fill={color} />;
        case 'eyes':
          return (
            <G key={zone}>
              <Ellipse cx={76} cy={96} rx={20} ry={13} fill={color} />
              <Ellipse cx={124} cy={96} rx={20} ry={13} fill={color} />
            </G>
          );
        case 'cheeks':
          return (
            <G key={zone}>
              <Circle cx={66} cy={126} r={19} fill={color} />
              <Circle cx={134} cy={126} r={19} fill={color} />
            </G>
          );
        case 'mouth':
          return <Ellipse key={zone} cx={100} cy={153} rx={26} ry={15} fill={color} />;
        case 'jaw':
          return (
            <Path
              key={zone}
              d="M 44 122 Q 60 176 100 184 Q 140 176 156 122"
              stroke={color}
              strokeWidth={14}
              strokeLinecap="round"
              fill="none"
            />
          );
        case 'chin':
          return <Ellipse key={zone} cx={100} cy={180} rx={20} ry={11} fill={color} />;
        case 'neck':
          return <Rect key={zone} x={78} y={166} width={44} height={50} rx={14} fill={color} />;
        case 'shoulders':
          return (
            <G key={zone}>
              <Ellipse cx={62} cy={206} rx={22} ry={10} fill={color} />
              <Ellipse cx={138} cy={206} rx={22} ry={10} fill={color} />
            </G>
          );
        case 'face':
        default:
          return <Path key={zone} d={HEAD_PATH} fill={color} />;
      }
    })}
  </G>
);

/** Sourcils effilés (formes pleines). `inner` décale les extrémités internes. */
export const browPaths = (inner = 0) => ({
  left: `M 59 82 Q 72 69 91 ${77 + inner} Q 75 ${78 + inner * 0.6} 59 82 Z`,
  right: `M 109 ${77 + inner} Q 128 69 141 82 Q 125 ${78 + inner * 0.6} 109 ${77 + inner} Z`,
});

/** Traits statiques (yeux, sourcils, bouche neutre) pour les vignettes. */
export const StaticFeatures: React.FC<PartProps> = ({ palette, uid }) => {
  const brows = browPaths(0);
  const blush = `url(#${gradientIds(uid).blush})`;
  return (
    <G>
      <Circle cx={66} cy={128} r={13} fill={blush} opacity={0.75} />
      <Circle cx={134} cy={128} r={13} fill={blush} opacity={0.75} />
      <Path d={brows.left} fill={palette.feature} />
      <Path d={brows.right} fill={palette.feature} />
      <Ellipse cx={76} cy={96} rx={11} ry={6} fill="#FFFFFF" />
      <Ellipse cx={124} cy={96} rx={11} ry={6} fill="#FFFFFF" />
      <Circle cx={76} cy={96} r={4.4} fill={palette.iris} />
      <Circle cx={124} cy={96} r={4.4} fill={palette.iris} />
      <Circle cx={76} cy={96} r={2.3} fill={palette.feature} />
      <Circle cx={124} cy={96} r={2.3} fill={palette.feature} />
      <Circle cx={74.6} cy={94.6} r={1.1} fill="#FFFFFF" />
      <Circle cx={122.6} cy={94.6} r={1.1} fill="#FFFFFF" />
      <Path d="M 65 95 Q 76 88 87 95" stroke={palette.feature} strokeWidth={1.8} strokeLinecap="round" fill="none" opacity={0.7} />
      <Path d="M 113 95 Q 124 88 135 95" stroke={palette.feature} strokeWidth={1.8} strokeLinecap="round" fill="none" opacity={0.7} />
      <Nose palette={palette} />
      <Path d="M 84 152 Q 100 150 116 152 Q 100 157 84 152 Z" fill={palette.lips} />
      <Path d="M 84 152 Q 100 150 116 152" stroke={palette.lipsDark} strokeWidth={1.2} strokeLinecap="round" fill="none" opacity={0.6} />
    </G>
  );
};
