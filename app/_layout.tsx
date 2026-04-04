import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Platform, View } from "react-native";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import { useFonts } from "expo-font";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";

import { trpc, createTRPCClient } from "@/lib/trpc";
import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";
import { UserProvider } from "@/lib/user-context";
import { setupNotificationHandler } from "@/lib/notification-service";
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

// Initialize notification handler at module level (required by expo-notifications)
setupNotificationHandler();

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [fontsLoaded] = useFonts({
    'CormorantGaramond-Regular': require('../assets/fonts/CormorantGaramond-Regular.ttf'),
    'CormorantGaramond-Medium': require('../assets/fonts/CormorantGaramond-Medium.ttf'),
    'CormorantGaramond-Light': require('../assets/fonts/CormorantGaramond-Light.ttf'),
    'CormorantGaramond-SemiBold': require('../assets/fonts/CormorantGaramond-SemiBold.ttf'),
    'PlayfairDisplay-Regular': require('../assets/fonts/PlayfairDisplay-Regular.ttf'),
    'PlayfairDisplay-Medium': require('../assets/fonts/PlayfairDisplay-Medium.ttf'),
    'PlayfairDisplay-SemiBold': require('../assets/fonts/PlayfairDisplay-SemiBold.ttf'),
    'PlayfairDisplay-Italic': require('../assets/fonts/PlayfairDisplay-Italic.ttf'),
  });

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);

  // Initialize Manus runtime for cookie injection from parent container
  useEffect(() => {
    initManusRuntime();
  }, []);

  // Handle notification deep links (native only — not available on web)
  useEffect(() => {
    if (Platform.OS === 'web') return;

    // Handle notification that opened the app
    try {
      const lastResponse = Notifications.getLastNotificationResponse();
      if (lastResponse?.notification?.request?.content?.data?.url) {
        const url = lastResponse.notification.request.content.data.url as string;
        router.push(url as never);
      }
    } catch (_) {}

    // Listen for notification interactions while app is running
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = response.notification.request.content.data?.url;
      if (typeof url === 'string') {
        router.push(url as never);
      }
    });

    return () => subscription.remove();
  }, []);

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    setInsets(metrics.insets);
    setFrame(metrics.frame);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  // Create clients once and reuse them
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic refetching on window focus for mobile
            refetchOnWindowFocus: false,
            // Retry failed requests once
            retry: 1,
          },
        },
      }),
  );
  const [trpcClient] = useState(() => createTRPCClient());

  // Ensure minimum 8px padding for top and bottom on mobile
  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {/* Default to hiding native headers so raw route segments don't appear (e.g. "(tabs)", "products/[id]"). */}
          {/* If a screen needs the native header, explicitly enable it and set a human title via Stack.Screen options. */}
          {/* in order for ios apps tab switching to work properly, use presentation: "fullScreenModal" for login page, whenever you decide to use presentation: "modal*/}
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
              animationDuration: 280,
              gestureEnabled: true,
              gestureDirection: "horizontal",
              contentStyle: { backgroundColor: '#0D0B1A' },
            }}
          >
            <Stack.Screen name="index" options={{ animation: "fade" }} />
            <Stack.Screen name="(auth)" options={{ animation: "fade", animationDuration: 350 }} />
            <Stack.Screen name="(tabs)" options={{ animation: "fade", animationDuration: 350 }} />
            <Stack.Screen name="onboarding" options={{ animation: "slide_from_right", gestureEnabled: false }} />
            <Stack.Screen name="meditation/[id]" options={{ presentation: "modal", animation: "slide_from_bottom", animationDuration: 320 }} />
            <Stack.Screen name="journey/[id]" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="checkin" options={{ presentation: "modal", animation: "slide_from_bottom", animationDuration: 320 }} />
            <Stack.Screen name="chat" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="breathing" options={{ animation: "slide_from_bottom", animationDuration: 350 }} />
            <Stack.Screen name="ambient" options={{ animation: "slide_from_bottom", animationDuration: 350 }} />
            <Stack.Screen name="progress" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="notifications-settings" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="program/[slug]" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="program-day/[slug]/[day]" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="sleep-tracker" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="stats" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="programs/index" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="program-complete/[slug]" options={{ animation: "fade", animationDuration: 400 }} />
            <Stack.Screen name="oauth/callback" options={{ animation: "fade" }} />
          </Stack>
          <StatusBar style="auto" />
        </QueryClientProvider>
      </trpc.Provider>
      </UserProvider>
    </GestureHandlerRootView>
  );

  const shouldOverrideSafeArea = Platform.OS === "web";

  if (shouldOverrideSafeArea) {
    return (
      <ThemeProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>
          <SafeAreaFrameContext.Provider value={frame}>
            <SafeAreaInsetsContext.Provider value={insets}>
              {content}
            </SafeAreaInsetsContext.Provider>
          </SafeAreaFrameContext.Provider>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={providerInitialMetrics}>{content}</SafeAreaProvider>
    </ThemeProvider>
  );
}
