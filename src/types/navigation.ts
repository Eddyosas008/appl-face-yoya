import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { RootStackParamList, MainTabParamList } from './index';

// ============================================
// TYPED NAVIGATION PROPS
// ============================================
// Provides full type safety for all screen navigation props

// Root stack screen props
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// Tab screen props (composite with root stack)
export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

// Individual screen prop types
export type OnboardingScreenProps = RootStackScreenProps<'Onboarding'>;
export type SafetyScreenProps = RootStackScreenProps<'Safety'>;
export type SessionPlayerScreenProps = RootStackScreenProps<'SessionPlayer'>;
export type ExerciseDetailScreenProps = RootStackScreenProps<'ExerciseDetail'>;
export type ProgramDetailScreenProps = RootStackScreenProps<'ProgramDetail'>;
export type SettingsScreenNavProps = RootStackScreenProps<'Settings'>;
export type EditProfileScreenProps = RootStackScreenProps<'EditProfile'>;
export type StatsScreenProps = RootStackScreenProps<'Stats'>;

// Tab screen prop types
export type TodayScreenProps = MainTabScreenProps<'Today'>;
export type ProgramsScreenProps = MainTabScreenProps<'Programs'>;
export type LibraryScreenProps = MainTabScreenProps<'Library'>;
export type JournalScreenProps = MainTabScreenProps<'Journal'>;
export type ProfileScreenNavProps = MainTabScreenProps<'Profile'>;
