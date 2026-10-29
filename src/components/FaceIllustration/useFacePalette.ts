import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { DEFAULT_FACE_TONE, FACE_TONES, FacePalette, FaceTone } from './faceParts';

/**
 * Palette du visage : carnation choisie dans les réglages (ou forcée via `tone`),
 * éventuellement surchargée champ par champ.
 */
export const useFacePalette = (
  override?: Partial<FacePalette>,
  tone?: FaceTone
): FacePalette => {
  const settingTone = useStore((state) => state.user.settings.illustrationTone);
  const resolved: FaceTone = tone ?? settingTone ?? DEFAULT_FACE_TONE;
  return useMemo(() => ({ ...FACE_TONES[resolved], ...override }), [resolved, override]);
};

/** Identifiant sûr pour les dégradés SVG (sans caractères spéciaux). */
export const svgSafeId = (raw: string): string => `fy${raw.replace(/[^a-zA-Z0-9]/g, '')}`;
