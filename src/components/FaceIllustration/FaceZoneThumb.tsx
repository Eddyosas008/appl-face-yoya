// ============================================
// VIGNETTE STATIQUE DU VISAGE PAR ZONE
// ============================================
// Petite illustration (cartes d'exercices, aperçus) : le visage neutre avec
// la zone travaillée surlignée. Aucune animation, rendu très léger.

import React, { useId } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Svg from 'react-native-svg';
import { FaceZone } from '../../types';
import { FACE_VB_HEIGHT, FACE_VB_WIDTH, getMotionForExercise } from './motions';
import {
  FaceDefs,
  FacePalette,
  FaceTone,
  Head,
  HighlightShapes,
  Shoulders,
  StaticFeatures,
  ZONE_TO_HIGHLIGHT,
} from './faceParts';
import { svgSafeId, useFacePalette } from './useFacePalette';

interface FaceZoneThumbProps {
  zone: FaceZone;
  /** Si fourni, utilise la zone de surlignage précise de l'exercice. */
  exerciseId?: string;
  size?: number;
  highlightColor?: string;
  /** Force une carnation (sinon : réglage utilisateur). */
  tone?: FaceTone;
  palette?: Partial<FacePalette>;
  style?: StyleProp<ViewStyle>;
}

export const FaceZoneThumb: React.FC<FaceZoneThumbProps> = ({
  zone,
  exerciseId,
  size = 56,
  highlightColor,
  tone,
  palette: paletteOverride,
  style,
}) => {
  const palette = useFacePalette(paletteOverride, tone);
  const uid = svgSafeId(useId());
  const zones = exerciseId ? getMotionForExercise(exerciseId, zone).highlight : ZONE_TO_HIGHLIGHT[zone];
  // On cadre un peu plus serré sur le visage pour les petites tailles
  const viewBox = `10 20 ${FACE_VB_WIDTH - 20} ${FACE_VB_HEIGHT - 40}`;
  const height = (size * (FACE_VB_HEIGHT - 40)) / (FACE_VB_WIDTH - 20);

  return (
    <View style={style} pointerEvents="none">
      <Svg width={size} height={height} viewBox={viewBox}>
        <FaceDefs palette={palette} uid={uid} />
        <Shoulders palette={palette} uid={uid} />
        <Head palette={palette} uid={uid} />
        <StaticFeatures palette={palette} uid={uid} />
        <HighlightShapes zones={zones} color={highlightColor ?? palette.highlight} />
        {/* Second passage léger pour renforcer la lisibilité du surlignage */}
        <HighlightShapes zones={zones} color={highlightColor ?? palette.highlight} />
      </Svg>
    </View>
  );
};

export default FaceZoneThumb;
