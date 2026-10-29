// ============================================
// PARTIES STATIQUES DU VISAGE (SVG)
// ============================================
// Formes partagées entre l'illustration animée et les vignettes statiques.
// Toutes les coordonnées sont exprimées dans le viewBox 200 x 240.

import React from 'react';
import { Circle, Ellipse, Path, Rect, G } from 'react-native-svg';
import { colors } from '../../theme';
import { FaceZone } from '../../types';
import { HighlightZone } from './motions';

export interface FacePalette {
  skin: string;
  skinShade: string;
  blush: string;
  hair: string;
  feature: string;
  lips: string;
  top: string;
  glow: string;
  highlight: string;
  touch: string;
}

export const DEFAULT_FACE_PALETTE: FacePalette = {
  skin: '#EBC9A9',
  skinShade: '#D3A47F',
  blush: '#F2A48E',
  hair: '#3A4B3A',
  feature: '#4A3A30',
  lips: '#C9776A',
  top: colors.accent.greenDark,
  glow: colors.accent.green,
  highlight: colors.accent.green,
  touch: colors.accent.teal,
};

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

/** Halo discret derrière la tête. */
export const Glow: React.FC<{ palette: FacePalette }> = ({ palette }) => (
  <Circle cx={100} cy={112} r={92} fill={palette.glow} opacity={0.08} />
);

/** Épaules + cou (dessinés sous la tête). */
export const Shoulders: React.FC<{ palette: FacePalette }> = ({ palette }) => (
  <G>
    <Rect x={82} y={166} width={36} height={56} rx={14} fill={palette.skinShade} />
    <Path
      d="M 22 240 Q 28 204 70 196 L 130 196 Q 172 204 178 240 Z"
      fill={palette.top}
    />
    {/* Encolure */}
    <Path d="M 70 196 Q 100 222 130 196" fill={palette.skinShade} />
  </G>
);

/** Tête : ovale, oreilles, cheveux. */
export const Head: React.FC<{ palette: FacePalette }> = ({ palette }) => (
  <G>
    <Ellipse cx={40} cy={112} rx={7} ry={11} fill={palette.skinShade} />
    <Ellipse cx={160} cy={112} rx={7} ry={11} fill={palette.skinShade} />
    <Ellipse cx={100} cy={110} rx={60} ry={74} fill={palette.skin} />
    {/* Ombre légère sous les pommettes pour donner du relief */}
    <Path
      d="M 46 128 Q 60 150 82 158"
      stroke={palette.skinShade}
      strokeWidth={3}
      strokeLinecap="round"
      fill="none"
      opacity={0.35}
    />
    <Path
      d="M 154 128 Q 140 150 118 158"
      stroke={palette.skinShade}
      strokeWidth={3}
      strokeLinecap="round"
      fill="none"
      opacity={0.35}
    />
    <Path
      d="M 40 100 Q 38 34 100 30 Q 162 34 160 100 Q 148 64 100 60 Q 52 64 40 100 Z"
      fill={palette.hair}
    />
  </G>
);

/** Nez simple. */
export const Nose: React.FC<{ palette: FacePalette }> = ({ palette }) => (
  <Path
    d="M 100 104 L 94 128 Q 100 133 106 128"
    stroke={palette.feature}
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
    opacity={0.75}
  />
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
          return <Ellipse key={zone} cx={100} cy={112} rx={58} ry={74} fill={color} />;
      }
    })}
  </G>
);

/** Traits statiques (yeux, sourcils, bouche neutre) pour les vignettes. */
export const StaticFeatures: React.FC<{ palette: FacePalette }> = ({ palette }) => (
  <G>
    <Path d="M 60 80 Q 74 72 90 78" stroke={palette.feature} strokeWidth={3} strokeLinecap="round" fill="none" />
    <Path d="M 110 78 Q 126 72 140 80" stroke={palette.feature} strokeWidth={3} strokeLinecap="round" fill="none" />
    <Ellipse cx={76} cy={96} rx={11} ry={6} fill="#FFFFFF" />
    <Ellipse cx={124} cy={96} rx={11} ry={6} fill="#FFFFFF" />
    <Circle cx={76} cy={96} r={3.5} fill={palette.feature} />
    <Circle cx={124} cy={96} r={3.5} fill={palette.feature} />
    <Nose palette={palette} />
    <Circle cx={66} cy={128} r={11} fill={palette.blush} opacity={0.3} />
    <Circle cx={134} cy={128} r={11} fill={palette.blush} opacity={0.3} />
    <Path d="M 84 152 Q 100 150 116 152 Q 100 157 84 152 Z" fill={palette.lips} />
  </G>
);
