import { useEffect, useState, useCallback } from 'react';
import { AppState } from 'react-native';
import { AuthService, SyncService } from '../services';
import { useStore } from '../store/useStore';

export const useSync = () => {
  const [syncStatus, setSyncStatus] = useState(SyncService.getSyncStatus());
  const [authUser, setAuthUser] = useState<any>(null);
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
