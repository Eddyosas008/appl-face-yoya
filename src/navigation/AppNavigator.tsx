import React, { useCallback } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { useStore } from '../store/useStore';
import {
  OnboardingScreen,
  TodayScreen,
  ProgramsScreen,
  LibraryScreen,
  JournalScreen,
  ProfileScreen,
  SafetyScreen,
  SessionPlayerScreen,
  ExerciseDetailScreen,
  ProgramDetailScreen,
  SettingsScreen,
  EditProfileScreen,
  StatsScreen,
} from '../screens';
import { ErrorBoundary } from '../components';
import { RootStackParamList, MainTabParamList } from '../types';
import { adaptive } from '../utils/responsive';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab icon mapping for cleaner code
const TAB_ICONS: Record<keyof MainTabParamList, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Today: { active: 'home', inactive: 'home-outline' },
  Programs: { active: 'calendar', inactive: 'calendar-outline' },
  Library: { active: 'grid', inactive: 'grid-outline' },
  Journal: { active: 'book', inactive: 'book-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

const TAB_LABELS: Record<keyof MainTabParamList, string> = {
  Today: 'Aujourd\'hui',
  Programs: 'Programmes',
  Library: 'Exercices',
  Journal: 'Journal',
  Profile: 'Profil',
};

// Main Tab Navigator with responsive tab bar
const MainTabs: React.FC = () => {
  const tabBarHeight = adaptive({
    small: 56,
    medium: 60,
    large: 64,
    default: 60,
  });

  const iconSize = adaptive({
    small: 20,
    medium: 22,
    large: 24,
    default: 22,
  });

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background.secondary,
          borderTopColor: colors.border.dark,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: Platform.OS === 'ios' ? 8 : 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.accent.green,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarLabelStyle: {
          fontSize: adaptive({ small: 10, default: 11 }),
          fontWeight: '500' as const,
        },
        tabBarAccessibilityLabel: TAB_LABELS[route.name],
        tabBarIcon: ({ focused, color }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.active : icons.inactive;
          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{ tabBarLabel: TAB_LABELS.Today }}
      />
      <Tab.Screen
        name="Programs"
        component={ProgramsScreen}
        options={{ tabBarLabel: TAB_LABELS.Programs }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{ tabBarLabel: TAB_LABELS.Library }}
      />
      <Tab.Screen
        name="Journal"
        component={JournalScreen}
        options={{ tabBarLabel: TAB_LABELS.Journal }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: TAB_LABELS.Profile }}
      />
    </Tab.Navigator>
  );
};

// Root Navigator
export const AppNavigator: React.FC = () => {
  const { user } = useStore();
  const isOnboarded = user.profile.onboardingCompleted;

  const handleOnboardingComplete = useCallback(() => {
    // Navigation will automatically switch due to state change
  }, []);

  return (
    <ErrorBoundary>
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background.primary },
          animation: 'slide_from_right',
        }}
      >
        {!isOnboarded ? (
          <Stack.Screen name="Onboarding">
            {(props) => (
              <OnboardingScreen
                {...props}
                onComplete={handleOnboardingComplete}
              />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="Safety"
              component={SafetyScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="SessionPlayer"
              component={SessionPlayerScreen}
              options={{
                animation: 'slide_from_bottom',
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="ExerciseDetail"
              component={ExerciseDetailScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="ProgramDetail"
              component={ProgramDetailScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="Stats"
              component={StatsScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
    </ErrorBoundary>
  );
};

export default AppNavigator;
