import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useUser } from '@/lib/user-context';
import { useColors } from '@/hooks/use-colors';

export default function IndexScreen() {
  const { isAuthenticated, isOnboarded, isLoading } = useUser();
  const colors = useColors();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
    } else if (!isOnboarded) {
      router.replace('/onboarding');
    } else {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isOnboarded, isLoading]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
