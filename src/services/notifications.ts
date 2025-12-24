import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Storage key for notification IDs
const NOTIFICATION_IDS_KEY = '@face_yoga_notifications';

// Notification types
export type NotificationType = 'reminder' | 'motivation' | 'streak' | 'milestone';

interface ScheduledNotification {
  id: string;
  type: NotificationType;
  notificationId: string;
}

// Motivational messages for different scenarios
const motivationalMessages = {
  morning: [
    {
      title: 'Bonjour ! ☀️',
      body: 'Quelques minutes de face yoga pour bien commencer la journée ?',
    },
    {
      title: 'Réveillez votre visage 🌱',
      body: 'Un petit moment de détente faciale vous attend !',
    },
    {
      title: 'Nouvelle journée, nouvelle énergie ✨',
      body: 'Prenez soin de vous avec votre routine matinale.',
    },
  ],
  afternoon: [
    {
      title: 'Pause bien-être 🌿',
      body: 'Une petite pause face yoga pour détendre les tensions ?',
    },
    {
      title: 'Moment de détente 😌',
      body: 'Accordez-vous quelques minutes pour vous relaxer.',
    },
  ],
  evening: [
    {
      title: 'Fin de journée apaisante 🌙',
      body: 'Relâchez les tensions avec une séance de face yoga.',
    },
    {
      title: 'Prenez soin de vous ce soir 💆‍♀️',
      body: 'Une routine douce avant de vous reposer.',
    },
  ],
  streakReminder: [
    {
      title: 'Votre streak vous attend ! 🔥',
      body: "N'oubliez pas votre séance pour maintenir votre série.",
    },
    {
      title: 'Continuez sur votre lancée ! 💪',
      body: 'Une petite séance pour garder le rythme ?',
    },
  ],
};

// Request notification permissions
export async function requestPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    // On Android, we need to set up a notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Rappels Face Yoga',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4ade80',
      });

      await Notifications.setNotificationChannelAsync('motivation', {
        name: 'Messages de motivation',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250],
        lightColor: '#4ade80',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

// Get random message from array
function getRandomMessage(messages: Array<{ title: string; body: string }>) {
  return messages[Math.floor(Math.random() * messages.length)];
}

// Get time-based message
function getTimeBasedMessage(): { title: string; body: string } {
  const hour = new Date().getHours();

  if (hour < 12) {
    return getRandomMessage(motivationalMessages.morning);
  } else if (hour < 18) {
    return getRandomMessage(motivationalMessages.afternoon);
  } else {
    return getRandomMessage(motivationalMessages.evening);
  }
}

// Schedule daily reminder notification
export async function scheduleDailyReminder(
  hour: number,
  minute: number
): Promise<string | null> {
  try {
    // Cancel existing reminders first
    await cancelNotification('daily_reminder');

    const message = getTimeBasedMessage();

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: message.title,
        body: message.body,
        sound: 'default',
        data: { type: 'reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    // Store the notification ID
    await storeNotificationId('daily_reminder', 'reminder', notificationId);

    console.log('Daily reminder scheduled for', hour, ':', minute);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling daily reminder:', error);
    return null;
  }
}

// Schedule streak reminder (evening reminder if no session done)
export async function scheduleStreakReminder(): Promise<string | null> {
  try {
    // Cancel existing streak reminders first
    await cancelNotification('streak_reminder');

    const message = getRandomMessage(motivationalMessages.streakReminder);

    // Schedule for 8 PM
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: message.title,
        body: message.body,
        sound: 'default',
        data: { type: 'streak' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 20,
        minute: 0,
      },
    });

    await storeNotificationId('streak_reminder', 'streak', notificationId);

    console.log('Streak reminder scheduled');
    return notificationId;
  } catch (error) {
    console.error('Error scheduling streak reminder:', error);
    return null;
  }
}

// Send immediate notification (for milestones, achievements)
export async function sendImmediateNotification(
  title: string,
  body: string,
  type: NotificationType = 'milestone'
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        data: { type },
      },
      trigger: null, // null means immediate
    });
  } catch (error) {
    console.error('Error sending immediate notification:', error);
  }
}

// Send streak milestone notification
export async function sendStreakMilestoneNotification(streakDays: number): Promise<void> {
  const milestones: { [key: number]: { title: string; body: string } } = {
    3: {
      title: '3 jours de suite ! 🎉',
      body: 'Vous avez maintenu votre routine pendant 3 jours.',
    },
    7: {
      title: 'Une semaine complète ! 🌟',
      body: 'Félicitations pour 7 jours consécutifs de face yoga !',
    },
    14: {
      title: '2 semaines ! 💪',
      body: "14 jours de pratique, c'est une vraie habitude qui se forme !",
    },
    21: {
      title: '21 jours - Nouvelle habitude ! 🏆',
      body: 'On dit que 21 jours créent une habitude. Bravo !',
    },
    30: {
      title: 'Un mois entier ! 🌙',
      body: '30 jours de face yoga ! Vous êtes incroyable !',
    },
    60: {
      title: '2 mois de pratique ! ⭐',
      body: 'Votre dévouement est inspirant. Continuez !',
    },
    100: {
      title: '100 jours ! 💎',
      body: "Centenaire de jours de pratique. C'est exceptionnel !",
    },
  };

  const milestone = milestones[streakDays];
  if (milestone) {
    await sendImmediateNotification(milestone.title, milestone.body, 'milestone');
  }
}

// Send badge earned notification
export async function sendBadgeNotification(badgeName: string): Promise<void> {
  await sendImmediateNotification(
    'Nouveau badge obtenu ! 🏅',
    `Vous avez débloqué le badge "${badgeName}"`,
    'milestone'
  );
}

// Store notification ID for later cancellation
async function storeNotificationId(
  id: string,
  type: NotificationType,
  notificationId: string
): Promise<void> {
  try {
    const existingJson = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    const existing: ScheduledNotification[] = existingJson
      ? JSON.parse(existingJson)
      : [];

    // Remove any existing with same ID
    const filtered = existing.filter((n) => n.id !== id);
    filtered.push({ id, type, notificationId });

    await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error storing notification ID:', error);
  }
}

// Cancel specific notification
export async function cancelNotification(id: string): Promise<void> {
  try {
    const existingJson = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    if (!existingJson) return;

    const existing: ScheduledNotification[] = JSON.parse(existingJson);
    const notification = existing.find((n) => n.id === id);

    if (notification) {
      await Notifications.cancelScheduledNotificationAsync(notification.notificationId);

      const filtered = existing.filter((n) => n.id !== id);
      await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(filtered));
    }
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
}

// Cancel all notifications
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem(NOTIFICATION_IDS_KEY);
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
}

// Get all scheduled notifications
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

// Setup notification listeners
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void
): () => void {
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('Notification received:', notification);
      onNotificationReceived?.(notification);
    }
  );

  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log('Notification response:', response);
      onNotificationResponse?.(response);
    }
  );

  // Return cleanup function
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

export default {
  requestPermissions,
  scheduleDailyReminder,
  scheduleStreakReminder,
  sendImmediateNotification,
  sendStreakMilestoneNotification,
  sendBadgeNotification,
  cancelNotification,
  cancelAllNotifications,
  getScheduledNotifications,
  setupNotificationListeners,
};
