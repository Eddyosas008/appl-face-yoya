import { Contraindication, Exercise, UserHealthInfo } from '../types';

/**
 * Contre-indications appliquées automatiquement lorsque l'utilisateur
 * déclare une intervention récente (chirurgie, injections...).
 */
export const RECENT_PROCEDURE_CONTRAINDICATIONS: readonly Contraindication[] = [
  'post_chirurgie',
  'injections_recentes',
];

/**
 * Liste complète des contre-indications à exclure pour un profil santé :
 * celles déclarées explicitement + celles impliquées par une intervention récente.
 */
export function getBlockedContraindications(healthInfo: UserHealthInfo): Contraindication[] {
  const blocked = new Set<Contraindication>(healthInfo.contraindications);
  if (healthInfo.recentProcedures) {
    RECENT_PROCEDURE_CONTRAINDICATIONS.forEach((item) => blocked.add(item));
  }
  return Array.from(blocked);
}

/** Vrai si l'exercice ne présente aucune contre-indication pour ce profil. */
export function isExerciseSafeForHealth(exercise: Exercise, healthInfo: UserHealthInfo): boolean {
  const blocked = getBlockedContraindications(healthInfo);
  if (blocked.length === 0) return true;
  return !exercise.contraindications.some((item) => blocked.includes(item));
}

/**
 * Filtre les exercices incompatibles avec le profil santé de l'utilisateur.
 * Source unique de vérité pour TodayScreen et ProgramDetailScreen.
 */
export function filterExercisesForHealth(
  exercises: Exercise[],
  healthInfo: UserHealthInfo
): Exercise[] {
  const blocked = getBlockedContraindications(healthInfo);
  if (blocked.length === 0) return exercises;
  return exercises.filter(
    (exercise) => !exercise.contraindications.some((item) => blocked.includes(item))
  );
}
