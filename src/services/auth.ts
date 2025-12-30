import { supabase } from './supabase';
import { DatabaseService } from './database';
import { User } from '../types';

export interface AuthUser {
  id: string;
  email?: string;
  isAnonymous: boolean;
}

export class AuthService {
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        isAnonymous: user.is_anonymous || false,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async signUpWithEmail(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  static async signInWithEmail(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  static async signInAnonymously() {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      throw error;
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  static async convertAnonymousToEmail(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error converting anonymous account:', error);
      throw error;
    }
  }

  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          callback({
            id: session.user.id,
            email: session.user.email,
            isAnonymous: session.user.is_anonymous || false,
          });
        } else {
          callback(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }

  static async migrateLocalDataToCloud(
    localUser: User,
    sessionHistory: any[],
    dailyEntries: any[]
  ) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      await DatabaseService.uploadAllLocalData(
        currentUser.id,
        localUser,
        sessionHistory,
        dailyEntries
      );

      return true;
    } catch (error) {
      console.error('Error migrating local data:', error);
      throw error;
    }
  }

  static async syncUserData() {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) return null;

      const userData = await DatabaseService.syncAllUserData(currentUser.id);
      return userData;
    } catch (error) {
      console.error('Error syncing user data:', error);
      return null;
    }
  }
}

export default AuthService;
