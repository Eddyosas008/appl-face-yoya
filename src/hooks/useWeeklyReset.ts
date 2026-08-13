import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

/**
 * Réinitialise la progression hebdomadaire au premier rendu de la semaine.
 * La logique est centralisée dans le store afin que la persistance locale
 * et les règles de calcul restent cohérentes sur mobile comme sur le web.
 */
export function useWeeklyReset() {
  const hasChecked = useRef(false);
  const checkAndResetWeeklyProgress = useStore(
    (state) => state.checkAndResetWeeklyProgress
  );

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;
    checkAndResetWeeklyProgress();
  }, [checkAndResetWeeklyProgress]);
}

export default useWeeklyReset;
