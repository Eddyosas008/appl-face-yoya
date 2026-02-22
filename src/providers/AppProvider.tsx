import React, { createContext, useContext, ReactNode } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useSync } from '../hooks/useSync';
import { useWeeklyReset } from '../hooks/useWeeklyReset';

// ============================================
// APP CONTEXT
// ============================================
// Centralized provider for cross-cutting concerns:
// network status, sync state, auth state

interface AppContextType {
  // Network
  isConnected: boolean;
  isInternetReachable: boolean;
  refreshNetwork: () => Promise<void>;

  // Sync
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  isAuthenticated: boolean;
  isAnonymous: boolean;
  syncToCloud: () => Promise<boolean | undefined>;
  syncFromCloud: () => Promise<any>;
  performFullSync: () => Promise<any>;
}

const AppContext = createContext<AppContextType | null>(null);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const network = useNetworkStatus();
  const sync = useSync();

  // Automatically reset weekly progress on Monday
  useWeeklyReset();

  const contextValue: AppContextType = {
    // Network
    isConnected: network.isConnected,
    isInternetReachable: network.isInternetReachable,
    refreshNetwork: network.refresh,

    // Sync
    syncStatus: sync.syncStatus,
    isAuthenticated: sync.isAuthenticated,
    isAnonymous: sync.isAnonymous,
    syncToCloud: sync.syncToCloud,
    syncFromCloud: sync.syncFromCloud,
    performFullSync: sync.performFullSync,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * Hook to access app-level context (network, sync, auth)
 */
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppProvider;
