import { AuthService } from './auth';
import { DatabaseService } from './database';
import { User, SessionHistory, DailyEntry } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

const LAST_SYNC_KEY = '@face_yoga_last_sync';
const SYNC_QUEUE_KEY = '@face_yoga_sync_queue';

interface SyncQueueItem {
  type: 'session' | 'daily_entry' | 'profile' | 'preferences' | 'health_info' | 'progress' | 'settings';
  data: any;
  timestamp: string;
}

export class SyncService {
  private static syncStatus: SyncStatus = 'idle';
  private static listeners: ((status: SyncStatus) => void)[] = [];

  static getSyncStatus(): SyncStatus {
    return this.syncStatus;
  }

  static setSyncStatus(status: SyncStatus) {
    this.syncStatus = status;
    this.listeners.forEach(listener => listener(status));
  }

  static onSyncStatusChange(listener: (status: SyncStatus) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  static async getLastSyncTime(): Promise<Date | null> {
    try {
      const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
      return lastSync ? new Date(lastSync) : null;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }

  static async setLastSyncTime(time: Date) {
    try {
      await AsyncStorage.setItem(LAST_SYNC_KEY, time.toISOString());
    } catch (error) {
      console.error('Error setting last sync time:', error);
    }
  }

  static async addToSyncQueue(item: SyncQueueItem) {
    try {
      const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      const queue: SyncQueueItem[] = queueJson ? JSON.parse(queueJson) : [];
      queue.push(item);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  }

  static async getSyncQueue(): Promise<SyncQueueItem[]> {
    try {
      const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      return queueJson ? JSON.parse(queueJson) : [];
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  }

  static async clearSyncQueue() {
    try {
      await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    } catch (error) {
      console.error('Error clearing sync queue:', error);
    }
  }

  static async syncToCloud(
    user: User,
    sessionHistory: SessionHistory[],
    dailyEntries: DailyEntry[]
  ) {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      console.log('No authenticated user, skipping sync');
      return false;
    }

    this.setSyncStatus('syncing');

    try {
      await DatabaseService.createOrUpdateProfile(currentUser.id, user.profile);
      await DatabaseService.createOrUpdatePreferences(currentUser.id, user.preferences);
      await DatabaseService.createOrUpdateHealthInfo(currentUser.id, user.healthInfo);
      await DatabaseService.createOrUpdateProgress(currentUser.id, user.progress);
      await DatabaseService.createOrUpdateSettings(currentUser.id, user.settings);

      const lastSync = await this.getLastSyncTime();

      if (lastSync) {
        const newSessions = sessionHistory.filter(
          s => new Date(s.date) > lastSync
        );
        for (const session of newSessions) {
          await DatabaseService.createSession(currentUser.id, session);
        }

        const newEntries = dailyEntries.filter(
          e => new Date(e.date) > lastSync
        );
        for (const entry of newEntries) {
          await DatabaseService.createOrUpdateDailyEntry(currentUser.id, entry);
        }
      } else {
        for (const session of sessionHistory) {
          await DatabaseService.createSession(currentUser.id, session);
        }
        for (const entry of dailyEntries) {
          await DatabaseService.createOrUpdateDailyEntry(currentUser.id, entry);
        }
      }

      await this.processSyncQueue(currentUser.id);

      await this.setLastSyncTime(new Date());
      this.setSyncStatus('synced');
      return true;
    } catch (error) {
      console.error('Error syncing to cloud:', error);
      this.setSyncStatus('error');
      return false;
    }
  }

  static async syncFromCloud() {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      console.log('No authenticated user, skipping sync');
      return null;
    }

    this.setSyncStatus('syncing');

    try {
      const userData = await DatabaseService.syncAllUserData(currentUser.id);

      if (!userData) {
        this.setSyncStatus('error');
        return null;
      }

      const [sessionHistory, dailyEntries] = await Promise.all([
        DatabaseService.getSessionHistory(currentUser.id),
        DatabaseService.getDailyEntries(currentUser.id),
      ]);

      await this.setLastSyncTime(new Date());
      this.setSyncStatus('synced');

      return {
        user: userData,
        sessionHistory: sessionHistory.map(s => ({
          id: s.id,
          date: s.session_date,
          programId: s.program_id,
          programDay: s.program_day,
          exercises: s.exercises,
          totalDuration: s.total_duration,
          mood: s.mood,
          faceFeel: s.face_feel,
          notes: s.notes,
        })),
        dailyEntries: dailyEntries.map(e => ({
          date: e.entry_date,
          sessionCompleted: e.session_completed,
          sessionId: e.session_id,
          morningFeel: e.morning_feel,
          eveningFeel: e.evening_feel,
          tensionAreas: e.tension_areas,
          waterIntake: e.water_intake,
          sleepQuality: e.sleep_quality,
          stressLevel: e.stress_level,
          notes: e.notes,
          photos: e.photos,
        })),
      };
    } catch (error) {
      console.error('Error syncing from cloud:', error);
      this.setSyncStatus('error');
      return null;
    }
  }

  static async processSyncQueue(userId: string) {
    const queue = await this.getSyncQueue();

    for (const item of queue) {
      try {
        switch (item.type) {
          case 'session':
            await DatabaseService.createSession(userId, item.data);
            break;
          case 'daily_entry':
            await DatabaseService.createOrUpdateDailyEntry(userId, item.data);
            break;
          case 'profile':
            await DatabaseService.createOrUpdateProfile(userId, item.data);
            break;
          case 'preferences':
            await DatabaseService.createOrUpdatePreferences(userId, item.data);
            break;
          case 'health_info':
            await DatabaseService.createOrUpdateHealthInfo(userId, item.data);
            break;
          case 'progress':
            await DatabaseService.createOrUpdateProgress(userId, item.data);
            break;
          case 'settings':
            await DatabaseService.createOrUpdateSettings(userId, item.data);
            break;
        }
      } catch (error) {
        console.error('Error processing sync queue item:', error);
      }
    }

    await this.clearSyncQueue();
  }

  static async performFullSync(
    user: User,
    sessionHistory: SessionHistory[],
    dailyEntries: DailyEntry[]
  ) {
    await this.syncToCloud(user, sessionHistory, dailyEntries);
    const cloudData = await this.syncFromCloud();
    return cloudData;
  }
}

export default SyncService;
