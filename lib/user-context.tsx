import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, EmotionalCheckIn, JournalEntry, SessionHistory } from '@/shared/wellness-types';

interface UserContextType {
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  checkIns: EmotionalCheckIn[];
  journalEntries: JournalEntry[];
  sessionHistory: SessionHistory[];
  favorites: string[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (data: Partial<UserProfile>) => Promise<void>;
  addCheckIn: (checkIn: Omit<EmotionalCheckIn, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  addSessionHistory: (session: Omit<SessionHistory, 'id' | 'userId' | 'completedAt'>) => Promise<void>;
  toggleFavorite: (meditationId: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

const DEFAULT_PROFILE: UserProfile = {
  id: 'local-user',
  firstName: 'Sophia',
  ageRange: '25-30',
  mainGoal: 'stress_relief',
  meditationLevel: 'beginner',
  preferredDuration: 10,
  guidanceTone: 'gentle',
  isPremium: false,
  totalSessions: 0,
  totalMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  joinedAt: new Date(),
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [checkIns, setCheckIns] = useState<EmotionalCheckIn[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  async function loadStoredData() {
    try {
      const [authData, profileData, onboardedData, checkInsData, journalData, sessionsData, favData] =
        await Promise.all([
          AsyncStorage.getItem('yoya_auth'),
          AsyncStorage.getItem('yoya_profile'),
          AsyncStorage.getItem('yoya_onboarded'),
          AsyncStorage.getItem('yoya_checkins'),
          AsyncStorage.getItem('yoya_journal'),
          AsyncStorage.getItem('yoya_sessions'),
          AsyncStorage.getItem('yoya_favorites'),
        ]);

      if (authData) setIsAuthenticated(JSON.parse(authData));
      if (profileData) setProfile(JSON.parse(profileData));
      if (onboardedData) setIsOnboarded(JSON.parse(onboardedData));
      if (checkInsData) setCheckIns(JSON.parse(checkInsData));
      if (journalData) setJournalEntries(JSON.parse(journalData));
      if (sessionsData) setSessionHistory(JSON.parse(sessionsData));
      if (favData) setFavorites(JSON.parse(favData));
    } catch (e) {
      console.error('Error loading stored data:', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, _password: string) {
    // Mock login — in production, call backend API
    const newProfile = { ...DEFAULT_PROFILE, firstName: email.split('@')[0] };
    setProfile(newProfile);
    setIsAuthenticated(true);
    await AsyncStorage.setItem('yoya_auth', JSON.stringify(true));
    await AsyncStorage.setItem('yoya_profile', JSON.stringify(newProfile));
  }

  async function signup(email: string, _password: string) {
    const newProfile = { ...DEFAULT_PROFILE, firstName: email.split('@')[0], joinedAt: new Date() };
    setProfile(newProfile);
    setIsAuthenticated(true);
    await AsyncStorage.setItem('yoya_auth', JSON.stringify(true));
    await AsyncStorage.setItem('yoya_profile', JSON.stringify(newProfile));
  }

  async function logout() {
    setIsAuthenticated(false);
    setIsOnboarded(false);
    setProfile(null);
    await AsyncStorage.multiRemove(['yoya_auth', 'yoya_onboarded']);
  }

  async function completeOnboarding(data: Partial<UserProfile>) {
    const updatedProfile = { ...(profile || DEFAULT_PROFILE), ...data };
    setProfile(updatedProfile);
    setIsOnboarded(true);
    await AsyncStorage.setItem('yoya_profile', JSON.stringify(updatedProfile));
    await AsyncStorage.setItem('yoya_onboarded', JSON.stringify(true));
  }

  async function addCheckIn(checkIn: Omit<EmotionalCheckIn, 'id' | 'userId' | 'createdAt'>) {
    const newCheckIn: EmotionalCheckIn = {
      ...checkIn,
      id: Date.now().toString(),
      userId: profile?.id || 'local-user',
      createdAt: new Date(),
    };
    const updated = [newCheckIn, ...checkIns];
    setCheckIns(updated);
    await AsyncStorage.setItem('yoya_checkins', JSON.stringify(updated));
  }

  async function addJournalEntry(entry: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    const now = new Date();
    const newEntry: JournalEntry = {
      ...entry,
      id: Date.now().toString(),
      userId: profile?.id || 'local-user',
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newEntry, ...journalEntries];
    setJournalEntries(updated);
    await AsyncStorage.setItem('yoya_journal', JSON.stringify(updated));
  }

  async function addSessionHistory(session: Omit<SessionHistory, 'id' | 'userId' | 'completedAt'>) {
    const newSession: SessionHistory = {
      ...session,
      id: Date.now().toString(),
      userId: profile?.id || 'local-user',
      completedAt: new Date(),
    };
    const updated = [newSession, ...sessionHistory];
    setSessionHistory(updated);
    if (profile) {
      const updatedProfile = {
        ...profile,
        totalSessions: profile.totalSessions + 1,
        totalMinutes: profile.totalMinutes + session.duration,
      };
      setProfile(updatedProfile);
      await AsyncStorage.setItem('yoya_profile', JSON.stringify(updatedProfile));
    }
    await AsyncStorage.setItem('yoya_sessions', JSON.stringify(updated));
  }

  async function toggleFavorite(meditationId: string) {
    const updated = favorites.includes(meditationId)
      ? favorites.filter((id) => id !== meditationId)
      : [...favorites, meditationId];
    setFavorites(updated);
    await AsyncStorage.setItem('yoya_favorites', JSON.stringify(updated));
  }

  async function updateProfile(data: Partial<UserProfile>) {
    if (!profile) return;
    const updated = { ...profile, ...data };
    setProfile(updated);
    await AsyncStorage.setItem('yoya_profile', JSON.stringify(updated));
  }

  return (
    <UserContext.Provider
      value={{
        profile,
        isAuthenticated,
        isOnboarded,
        checkIns,
        journalEntries,
        sessionHistory,
        favorites,
        isLoading,
        login,
        signup,
        logout,
        completeOnboarding,
        addCheckIn,
        addJournalEntry,
        addSessionHistory,
        toggleFavorite,
        updateProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
