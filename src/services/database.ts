import { supabase } from './supabase';
import {
  User,
  UserProfile,
  UserPreferences,
  UserHealthInfo,
  UserProgress,
  SessionHistory,
  DailyEntry,
  UserSettings,
} from '../types';

export interface DatabaseUser {
  id: string;
  profile: UserProfile;
  preferences: UserPreferences;
  healthInfo: UserHealthInfo;
  progress: UserProgress;
  settings: UserSettings;
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // exponential backoff

async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const isRetryable = error?.message?.includes('network') ||
        error?.message?.includes('timeout') ||
        error?.message?.includes('fetch') ||
        error?.code === 'PGRST301';

      if (!isRetryable || attempt === MAX_RETRIES) {
        throw error;
      }
      console.warn(
        `${operationName} failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying...`
      );
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]));
    }
  }
  throw lastError;
}

// Batch size for bulk operations
const BATCH_SIZE = 10;

async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  return results;
}

export class DatabaseService {
  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async createOrUpdateProfile(userId: string, profile: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        first_name: profile.firstName,
        age: profile.age,
        avatar_url: profile.avatarUrl,
        onboarding_completed: profile.onboardingCompleted,
        onboarding_completed_at: profile.onboardingCompletedAt,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserPreferences(userId: string) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async createOrUpdatePreferences(userId: string, preferences: Partial<UserPreferences>) {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        primary_goals: preferences.primaryGoals,
        focus_zones: preferences.focusZones,
        preferred_duration: preferences.preferredDuration,
        preferred_time: preferences.preferredTime,
        reminder_enabled: preferences.reminderEnabled,
        reminder_time: preferences.reminderTime,
        experience_level: preferences.experienceLevel,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserHealthInfo(userId: string) {
    const { data, error } = await supabase
      .from('user_health_info')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async createOrUpdateHealthInfo(userId: string, healthInfo: Partial<UserHealthInfo>) {
    const { data, error } = await supabase
      .from('user_health_info')
      .upsert({
        user_id: userId,
        contraindications: healthInfo.contraindications,
        recent_procedures: healthInfo.recentProcedures,
        procedure_details: healthInfo.procedureDetails,
        notes: healthInfo.notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserProgress(userId: string) {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async createOrUpdateProgress(userId: string, progress: Partial<UserProgress>) {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        current_streak: progress.currentStreak,
        longest_streak: progress.longestStreak,
        total_sessions: progress.totalSessions,
        total_minutes: progress.totalMinutes,
        completed_exercises: progress.completedExercises,
        completed_programs: progress.completedPrograms,
        current_program_id: progress.currentProgramId,
        current_program_data: progress.currentProgramProgress,
        weekly_goal: progress.weeklyGoal,
        weekly_progress: progress.weeklyProgress,
        badges: progress.badges,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserSettings(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async createOrUpdateSettings(userId: string, settings: Partial<UserSettings>) {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        language: settings.language,
        theme: settings.theme,
        sound_enabled: settings.soundEnabled,
        haptic_enabled: settings.hapticEnabled,
        show_animations: settings.showAnimations,
        data_collection: settings.dataCollection,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getSessionHistory(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('session_history')
      .select('*')
      .eq('user_id', userId)
      .order('session_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async createSession(userId: string, session: Omit<SessionHistory, 'id'>) {
    const { data, error } = await supabase
      .from('session_history')
      .insert({
        user_id: userId,
        session_date: session.date,
        program_id: session.programId,
        program_day: session.programDay,
        exercises: session.exercises,
        total_duration: session.totalDuration,
        mood: session.mood,
        face_feel: session.faceFeel,
        notes: session.notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getDailyEntries(userId: string, limit = 30) {
    const { data, error } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async getDailyEntry(userId: string, date: string) {
    const { data, error } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('entry_date', date)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async createOrUpdateDailyEntry(userId: string, entry: Partial<DailyEntry> & { date: string }) {
    const { data, error } = await supabase
      .from('daily_entries')
      .upsert({
        user_id: userId,
        entry_date: entry.date,
        session_completed: entry.sessionCompleted,
        session_id: entry.sessionId,
        morning_feel: entry.morningFeel,
        evening_feel: entry.eveningFeel,
        tension_areas: entry.tensionAreas,
        water_intake: entry.waterIntake,
        sleep_quality: entry.sleepQuality,
        stress_level: entry.stressLevel,
        notes: entry.notes,
        photos: entry.photos,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async syncAllUserData(userId: string): Promise<DatabaseUser | null> {
    try {
      const [profile, preferences, healthInfo, progress, settings] = await Promise.all([
        this.getUserProfile(userId),
        this.getUserPreferences(userId),
        this.getUserHealthInfo(userId),
        this.getUserProgress(userId),
        this.getUserSettings(userId),
      ]);

      if (!profile) return null;

      return {
        id: userId,
        profile: {
          firstName: profile.first_name,
          age: profile.age,
          avatarUrl: profile.avatar_url,
          onboardingCompleted: profile.onboarding_completed,
          onboardingCompletedAt: profile.onboarding_completed_at,
        },
        preferences: preferences ? {
          primaryGoals: preferences.primary_goals || [],
          focusZones: preferences.focus_zones || [],
          preferredDuration: preferences.preferred_duration || 10,
          preferredTime: preferences.preferred_time || 'flexible',
          reminderEnabled: preferences.reminder_enabled || false,
          reminderTime: preferences.reminder_time,
          experienceLevel: preferences.experience_level || 'nouveau',
        } : {
          primaryGoals: [],
          focusZones: [],
          preferredDuration: 10,
          preferredTime: 'flexible',
          reminderEnabled: false,
          reminderTime: '08:00',
          experienceLevel: 'nouveau',
        },
        healthInfo: healthInfo ? {
          contraindications: healthInfo.contraindications || [],
          recentProcedures: healthInfo.recent_procedures || false,
          procedureDetails: healthInfo.procedure_details,
          notes: healthInfo.notes,
        } : {
          contraindications: [],
          recentProcedures: false,
        },
        progress: progress ? {
          currentStreak: progress.current_streak || 0,
          longestStreak: progress.longest_streak || 0,
          totalSessions: progress.total_sessions || 0,
          totalMinutes: progress.total_minutes || 0,
          badges: progress.badges || [],
          completedExercises: progress.completed_exercises || [],
          completedPrograms: progress.completed_programs || [],
          currentProgramId: progress.current_program_id,
          currentProgramProgress: progress.current_program_data,
          weeklyGoal: progress.weekly_goal || 5,
          weeklyProgress: progress.weekly_progress || 0,
        } : {
          currentStreak: 0,
          longestStreak: 0,
          totalSessions: 0,
          totalMinutes: 0,
          badges: [],
          completedExercises: [],
          completedPrograms: [],
          weeklyGoal: 5,
          weeklyProgress: 0,
        },
        settings: settings ? {
          language: settings.language || 'fr',
          theme: settings.theme || 'dark',
          soundEnabled: settings.sound_enabled !== false,
          hapticEnabled: settings.haptic_enabled !== false,
          showAnimations: settings.show_animations !== false,
          dataCollection: settings.data_collection || false,
        } : {
          language: 'fr',
          theme: 'dark',
          soundEnabled: true,
          hapticEnabled: true,
          showAnimations: true,
          dataCollection: false,
        },
      };
    } catch (error) {
      console.error('Error syncing user data:', error);
      return null;
    }
  }

  static async uploadAllLocalData(
    userId: string,
    user: User,
    sessionHistory: SessionHistory[],
    dailyEntries: DailyEntry[]
  ) {
    try {
      // Upload user data in parallel with retry
      await withRetry(
        () => Promise.all([
          this.createOrUpdateProfile(userId, user.profile),
          this.createOrUpdatePreferences(userId, user.preferences),
          this.createOrUpdateHealthInfo(userId, user.healthInfo),
          this.createOrUpdateProgress(userId, user.progress),
          this.createOrUpdateSettings(userId, user.settings),
        ]),
        'uploadUserData'
      );

      // Upload sessions in batches (parallel within each batch)
      if (sessionHistory.length > 0) {
        await processBatch(sessionHistory, (session) =>
          withRetry(
            () => this.createSession(userId, session),
            `createSession-${session.date}`
          )
        );
      }

      // Upload daily entries in batches
      if (dailyEntries.length > 0) {
        await processBatch(dailyEntries, (entry) =>
          withRetry(
            () => this.createOrUpdateDailyEntry(userId, entry),
            `updateDailyEntry-${entry.date}`
          )
        );
      }

      return true;
    } catch (error) {
      console.error('Error uploading local data:', error);
      throw error;
    }
  }
}

export default DatabaseService;
