// ============================================================
// Notification Service — Local Push Notifications
// ============================================================

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications behave when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  private isConfigured = false;
  private readonly REMINDER_IDENTIFIER = 'daily_chant_reminder';

  async init() {
    if (this.isConfigured) return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D4AF37', // Gold
      });
    }

    this.isConfigured = true;
  }

  async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  }

  async scheduleDailyReminder(targetCount: number = 108) {
    await this.init();
    
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return false;

    // Cancel existing ones first to avoid duplicates
    await this.cancelReminders();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time for your daily Sadhana 🙏',
        body: `Your goal is ${targetCount} chants today. Continue your spiritual journey!`,
        sound: true,
      },
      trigger: {
        hour: 7, // 7 AM
        minute: 0,
        repeats: true,
        ...(Platform.OS === 'android' ? { channelId: 'default' } : {}),
      },
      identifier: this.REMINDER_IDENTIFIER,
    });

    return true;
  }

  async cancelReminders() {
    await Notifications.cancelScheduledNotificationAsync(this.REMINDER_IDENTIFIER);
  }
}

export const notificationService = new NotificationService();
