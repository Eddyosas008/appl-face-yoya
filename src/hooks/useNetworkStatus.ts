import { useState, useEffect, useCallback, useRef } from 'react';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
}

/**
 * Lightweight network status hook using fetch-based connectivity check.
 * Avoids heavy @react-native-community/netinfo dependency.
 */
export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: true,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkConnectivity = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // Use a lightweight endpoint to check connectivity
      const response = await fetch('https://httpbin.org/status/200', {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      setNetworkState({
        isConnected: response.ok,
        isInternetReachable: response.ok,
      });
    } catch {
      setNetworkState({
        isConnected: false,
        isInternetReachable: false,
      });
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkConnectivity();

    // Periodic checks every 30 seconds
    intervalRef.current = setInterval(checkConnectivity, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkConnectivity]);

  return {
    ...networkState,
    refresh: checkConnectivity,
  };
};

export default useNetworkStatus;
