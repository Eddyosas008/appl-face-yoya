import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useStore } from '../store/useStore';

/**
 * Réinitialise la progression hebdomadaire au changement de semaine.
 *
 * - Ne s'exécute qu'après l'hydratation du store persisté : sinon le `set()`
 *   s'applique à l'état initial et est écrasé par les données restaurées.
 * - Se relance quand l'app redevient active, pour qu'un lundi qui arrive
 *   pendant que l'app reste ouverte déclenche bien la remise à zéro.
 *
 * `checkAndResetWeeklyProgress` compare la clé du lundi local courant à
 * `lastWeekResetDate` : les appels répétés sont donc sans effet (idempotent).
 */
export function useWeeklyReset() {
  useEffect(() => {
    const run = () => {
      if (!useStore.persist.hasHydrated()) return;
      useStore.getState().checkAndResetWeeklyProgress();
    };

    let unsubscribeHydration: (() => void) | undefined;
    if (useStore.persist.hasHydrated()) {
      run();
    } else {
      unsubscribeHydration = useStore.persist.onFinishHydration(run);
    }

    const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (status === 'active') run();
    });

    return () => {
      unsubscribeHydration?.();
      subscription.remove();
    };
  }, []);
}

export default useWeeklyReset;
