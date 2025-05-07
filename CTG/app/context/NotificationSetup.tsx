import * as Notifications from 'expo-notifications';

let intervalId: NodeJS.Timeout | null = null;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const enableNotifications = async () => {
  try {
    await Notifications.requestPermissionsAsync();
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Only start if not already started
    if (!intervalId) {
      // Send one immediately
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Reminder',
          body: 'Do not forget to check out our app!',
        },
        trigger: null,
      });

      // Start interval
      intervalId = setInterval(async () => {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Reminder',
            body: 'Do not forget to check out our app!',
          },
          trigger: null,
        });
      }, 10000);

      console.log("Notifications enabled (every 10 seconds)");
    } else {
      console.log("Notifications already running.");
    }
  } catch (error) {
    console.error("Error enabling notifications:", error);
  }
};

export const disableNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
      console.log("Notifications disabled");
    } else {
      console.log("Notifications already off.");
    }
  } catch (error) {
    console.error("Error disabling notifications:", error);
  }
};
