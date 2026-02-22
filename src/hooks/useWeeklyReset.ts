import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from '../store/useStore';

const WEEKLY_RESET_KEY = '@face_yoga_weekly_reset';

/**
 * Checks if the weekly progress should be reset and resets it if needed.
 * Weekly progress resets every Monday at midnight.
 */
export function useWeeklyReset() {
  const hasChecked = useRef(false);
  const { user, updateProgress } = useStore();

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const checkAndReset = async () => {
      try {
        const lastResetStr = await AsyncStorage.getItem(WEEKLY_RESET_KEY);
        const now = new Date();
        const currentMonday = getMonday(now);

        if (lastResetStr) {
          const lastReset = new Date(lastResetStr);
          const lastMonday = getMonday(lastReset);

          // If the last reset was before this Monday, reset
          if (lastMonday.getTime() < currentMonday.getTime()) {
            updateProgress({ weeklyProgress: 0 });
            await AsyncStorage.setItem(WEEKLY_RESET_KEY, now.toISOString());
          }
        } else {
          // First time - just record the current date
          await AsyncStorage.setItem(WEEKLY_RESET_KEY, now.toISOString());
        }
      } catch (error) {
        console.error('Error checking weekly reset:', error);
      }
    };

    checkAndReset();
  }, [updateProgress]);
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default useWeeklyReset;
