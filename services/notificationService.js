import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false, // We'll handle sound ourselves
    shouldSetBadge: false,
  }),
});

export const requestPermissions = async () => {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get notification permissions!');
      return false;
    }
    
    return true;
  } else {
    alert('Must use physical device for notifications');
    return false;
  }
};

export const scheduleAlarmNotification = async (alarm) => {
  try {
    // Cancel existing notification for this alarm
    if (alarm.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(alarm.notificationId);
    }

    if (!alarm.enabled) {
      return null;
    }

    const [hours, minutes] = alarm.time.split(':').map(Number);
    
    const trigger = {
      hour: hours,
      minute: minutes,
      repeats: alarm.repeat.length > 0,
    };

    // If specific days are selected, we need to schedule for each day
    if (alarm.repeat.length > 0 && alarm.repeat.length < 7) {
      const notificationIds = [];
      for (const day of alarm.repeat) {
        const dayTrigger = {
          ...trigger,
          weekday: day + 1, // Sunday = 1, Monday = 2, etc.
        };
        
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Sunrise Alarm',
            body: 'Time to wake up!',
            data: { alarmId: alarm.id },
          },
          trigger: dayTrigger,
        });
        notificationIds.push(id);
      }
      return notificationIds[0]; // Return first ID for reference
    } else if (alarm.repeat.length === 7) {
      // Daily alarm
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Sunrise Alarm',
          body: 'Time to wake up!',
          data: { alarmId: alarm.id },
        },
        trigger,
      });
      return id;
    } else {
      // One-time alarm
      const now = new Date();
      const alarmTime = new Date();
      alarmTime.setHours(hours, minutes, 0, 0);
      
      // If alarm time has passed today, schedule for tomorrow
      if (alarmTime <= now) {
        alarmTime.setDate(alarmTime.getDate() + 1);
      }
      
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Sunrise Alarm',
          body: 'Time to wake up!',
          data: { alarmId: alarm.id },
        },
        trigger: {
          date: alarmTime,
        },
      });
      return id;
    }
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

export const cancelAlarmNotification = async (notificationId) => {
  try {
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    }
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};
