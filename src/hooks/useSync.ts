import { useEffect, useState, useCallback } from 'react';
import { AppState } from 'react-native';
import { AuthService, SyncService, AuthUser } from '../services';
import { useStore } from '../store/useStore';

export const useSync = () => {
  const [syncStatus, setSyncStatus] = useState(SyncService.getSyncStatus());
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const { user, sessionHistory, dailyEntries } = useStore();

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await AuthService.getCurrentUser();
      setAuthUser(currentUser);
    };
    checkAuth();

    const unsubscribe = AuthService.onAuthStateChange((user) => {
      setAuthUser(user);
      if (user) {
        syncFromCloud();
      }
    });

    return unsubscribe;
    // Abonnement unique au montage : ajouter `syncFromCloud` (qui dépend de
    // `authUser`) réabonnerait le listener à chaque changement d'auth et
    // déclencherait des synchronisations supplémentaires.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsubscribe = SyncService.onSyncStatusChange((status) => {
      setSyncStatus(status);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && authUser) {
        syncFromCloud();
      }
    });

    return () => {
      subscription.remove();
    };
    // `syncFromCloud` ne change que lorsque `authUser` change : la dépendance
    // explicite sur `authUser` suffit et évite de réabonner inutilement AppState.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  const syncToCloud = useCallback(async () => {
    if (!authUser) return false;
    return await SyncService.syncToCloud(user, sessionHistory, dailyEntries);
  }, [authUser, user, sessionHistory, dailyEntries]);

  const syncFromCloud = useCallback(async () => {
    if (!authUser) return null;
    const cloudData = await SyncService.syncFromCloud();

    if (cloudData) {
      const store = useStore.getState();

      store.updateProfile(cloudData.user.profile);
      store.updatePreferences(cloudData.user.preferences);
      store.updateHealthInfo(cloudData.user.healthInfo);
      store.updateSettings(cloudData.user.settings);
    }

    return cloudData;
  }, [authUser]);

  const performFullSync = useCallback(async () => {
    if (!authUser) return null;
    return await SyncService.performFullSync(user, sessionHistory, dailyEntries);
  }, [authUser, user, sessionHistory, dailyEntries]);

  return {
    syncStatus,
    authUser,
    syncToCloud,
    syncFromCloud,
    performFullSync,
    isAuthenticated: !!authUser,
    isAnonymous: authUser?.isAnonymous || false,
  };
};

export default useSync;
