import { useEffect } from 'react';
import { Alert, Platform, AppState } from 'react-native';
import * as Notifications from 'expo-notifications';

let scheduledNotificationId: string | null = null;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForNotificationsAsync() {
  const { status } = await Notifications.getPermissionsAsync();
  let finalStatus = status;

  if (status !== 'granted') {
    const { status: askedStatus } = await Notifications.requestPermissionsAsync();
    finalStatus = askedStatus;
  }

  if (finalStatus !== 'granted') {
    Alert.alert('Permission required', 'We need notification permissions.');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return true;
}

async function scheduleNotification(seconds = 60): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Reminder',
      body: 'Hey! Check out our app!',
    },
    trigger: { seconds },
  });
}

export async function enableNotifications() {
  const granted = await registerForNotificationsAsync();
  if (granted && !scheduledNotificationId) {
    scheduledNotificationId = await scheduleNotification(60);
    console.log('Scheduled notification:', scheduledNotificationId);
  }
}

export async function disableNotifications() {
  if (scheduledNotificationId) {
    await Notifications.cancelScheduledNotificationAsync(scheduledNotificationId);
    scheduledNotificationId = null;
    console.log('Notification cancelled.');
  }
}

export async function scheduleCustomNotification(title: string, body: string, seconds = 1) {
  const granted = await registerForNotificationsAsync();
  if (!granted) {
    console.log("Notification permission not granted, skipping.");
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: { seconds },
    });
    console.log(`🔔 Custom notification scheduled: ${title}`);
  } catch (error) {
    console.error("Failed to schedule custom notification:", error);
  }
}

export default function NotificationSetup() {
  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(async () => {
      console.log('Notification received, rescheduling another notification.');
      scheduledNotificationId = await scheduleNotification(60);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(async () => {
      console.log('Notification tapped by user, scheduling next notification.');
      scheduledNotificationId = await scheduleNotification(60);
    });

    const appStateListener = AppState.addEventListener('change', async (state) => {
      if (state === 'active' && !scheduledNotificationId) {
        console.log('App activated, ensuring notification scheduled.');
        scheduledNotificationId = await scheduleNotification(60);
      }
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
      appStateListener.remove();
    };
  }, []);

  return null;
}
