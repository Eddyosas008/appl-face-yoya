import {
  Contraindication,
  DifficultyLevel,
  FaceFeelRating,
  FaceZone,
} from '../types';

// ============================================
// LIBELLÉS PARTAGÉS (copy FR)
// ============================================
// Source unique pour les libellés affichés dans l'app. Ne pas dupliquer
// ces tables localement dans les écrans/composants.

/** Libellés complets des zones du visage. */
export const ZONE_LABELS: Record<FaceZone, string> = {
  front: 'Front',
  yeux: 'Contour des yeux',
  joues: 'Joues',
  bouche: 'Bouche',
  ovale: 'Ovale du visage',
  cou: 'Cou & Mâchoire',
  global: 'Visage complet',
};

/** Libellés courts des zones (badges, graphiques). */
export const ZONE_SHORT_LABELS: Record<FaceZone, string> = {
  front: 'Front',
  yeux: 'Yeux',
  joues: 'Joues',
  bouche: 'Bouche',
  ovale: 'Ovale',
  cou: 'Cou',
  global: 'Global',
};

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
};

export const CONTRAINDICATION_LABELS: Record<Contraindication, string> = {
  atm: 'Troubles ATM',
  douleurs_cervicales: 'Douleurs cervicales',
  post_chirurgie: 'Post-chirurgie',
  injections_recentes: 'Injections récentes',
  paralysie_faciale: 'Paralysie faciale',
  hypertension: 'Hypertension',
  glaucome: 'Glaucome',
  problemes_dentaires: 'Problèmes dentaires',
};

export interface FaceFeelOption {
  id: FaceFeelRating;
  emoji: string;
  label: string;
  /** Description longue, utilisée notamment comme libellé d'accessibilité. */
  description?: string;
}

export const FACE_FEEL_OPTIONS: FaceFeelOption[] = [
  { id: 'tendu', emoji: '😣', label: 'Tendu', description: 'Mon visage est tendu' },
  { id: 'normal', emoji: '😐', label: 'Normal', description: 'Mon visage se sent normal' },
  { id: 'detendu', emoji: '😌', label: 'Détendu', description: 'Mon visage est détendu' },
  { id: 'revitalise', emoji: '✨', label: 'Revitalisé', description: 'Mon visage se sent revitalisé' },
];
