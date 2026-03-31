// ─── Wellness App Shared Types ───────────────────────────────────────────────

export type MeditationCategory =
  | 'stress_relief'
  | 'sleep'
  | 'anxiety'
  | 'emotional_reset'
  | 'confidence'
  | 'focus'
  | 'self_compassion';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type MoodState =
  | 'calm'
  | 'anxious'
  | 'sad'
  | 'happy'
  | 'tired'
  | 'overwhelmed'
  | 'grateful'
  | 'neutral';

export type EnergyLevel = 1 | 2 | 3 | 4 | 5;
export type StressLevel = 1 | 2 | 3 | 4 | 5;
export type SleepQuality = 1 | 2 | 3 | 4 | 5;

export interface Meditation {
  id: string;
  title: string;
  category: MeditationCategory;
  duration: number; // in minutes
  difficulty: DifficultyLevel;
  description: string;
  coverImage: string;
  audioUrl?: string;
  isPremium: boolean;
  tags: string[];
}

export interface AdaptiveJourney {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: number; // total minutes
  mood: MoodState[];
  steps: JourneyStep[];
  coverGradient: string[];
  isPremium: boolean;
}

export interface JourneyStep {
  id: string;
  type: 'intro' | 'breathing' | 'meditation' | 'reflection' | 'feedback';
  title: string;
  description: string;
  duration: number; // in minutes
  content?: string;
}

export interface EmotionalCheckIn {
  id: string;
  userId: string;
  mood: MoodState;
  stressLevel: StressLevel;
  energyLevel: EnergyLevel;
  sleepQuality: SleepQuality;
  note?: string;
  createdAt: Date;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title?: string;
  content: string;
  mood?: MoodState;
  checkInId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionHistory {
  id: string;
  userId: string;
  meditationId?: string;
  journeyId?: string;
  duration: number; // actual minutes listened
  completedAt: Date;
  rating?: number;
}

export interface UserProfile {
  id: string;
  firstName: string;
  ageRange: '18-24' | '25-30' | '31-35' | '36-40' | '40+';
  mainGoal: 'sleep' | 'stress_relief' | 'emotional_balance' | 'confidence' | 'focus' | 'recovery';
  meditationLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredDuration: 5 | 10 | 15 | 20 | 30;
  guidanceTone: 'gentle' | 'motivating' | 'neutral' | 'spiritual';
  isPremium: boolean;
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  joinedAt: Date;
}

export interface SubscriptionPlan {
  id: 'free' | 'monthly' | 'yearly';
  name: string;
  price: number;
  period?: string;
  features: string[];
  isPopular?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
