import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Text, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AppProvider } from './src/providers/AppProvider';
import { NetworkStatusBar } from './src/components/NetworkStatus';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import { colors, typography } from './src/theme';

// Suppress non-critical warnings in production
if (!__DEV__) {
  LogBox.ignoreAllLogs();
}

function AppContent() {
  const { isConnected } = useNetworkStatus();

  return (
    <>
      <NetworkStatusBar isConnected={isConnected} />
      <AppNavigator />
      <StatusBar style="light" />
    </>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const initialize = useCallback(async () => {
    try {
      // Load fonts, assets, etc. here if needed
      // await Font.loadAsync({...});

      // Brief initialization delay for splash screen
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setInitError('Impossible de charger l\'application. Veuillez réessayer.');
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent.green} />
        <StatusBar style="light" />
      </View>
    );
  }

  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{initError}</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <ErrorBoundary>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    paddingHorizontal: 24,
  },
  errorText: {
    ...typography.body,
    color: colors.accent.coral,
    textAlign: 'center',
  },
});
