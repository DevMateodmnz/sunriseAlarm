import { useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { loadAlarms, updateAlarm } from './alarmStorage';
import { scheduleAlarmNotification } from './notificationService';
import sunriseController from './sunriseController';
import audioService, { ALARM_SOUNDS } from './audioService';

class AlarmManager {
  constructor() {
    this.activeAlarm = null;
    this.checkInterval = null;
    this.sunriseStarted = false;
    this.alarmRinging = false;
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(event, data) {
    this.listeners.forEach(listener => listener(event, data));
  }

  async initialize() {
    await audioService.initialize();
    
    // Start checking for alarms
    this.startChecking();

    // Listen for notification responses
    Notifications.addNotificationResponseReceivedListener(response => {
      const alarmId = response.notification.request.content.data.alarmId;
      this.handleAlarmTrigger(alarmId);
    });
  }

  startChecking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check every second for upcoming alarms
    this.checkInterval = setInterval(async () => {
      await this.checkAlarms();
    }, 1000);
  }

  async checkAlarms() {
    try {
      const alarms = await loadAlarms();
      const now = new Date();
      
      for (const alarm of alarms) {
        if (!alarm.enabled) continue;

        const [hours, minutes] = alarm.time.split(':').map(Number);
        const alarmTime = new Date();
        alarmTime.setHours(hours, minutes, 0, 0);

        // Check if this alarm should be active today
        const shouldTriggerToday = this.shouldTriggerToday(alarm, now);
        if (!shouldTriggerToday) continue;

        // Calculate sunrise start time
        const sunriseDuration = alarm.sunriseDuration || 30; // minutes
        const sunriseStartTime = new Date(alarmTime.getTime() - sunriseDuration * 60 * 1000);

        // Start sunrise effect
        if (now >= sunriseStartTime && now < alarmTime && !this.sunriseStarted) {
          await this.startSunrise(alarm);
        }

        // Trigger alarm sound
        if (now >= alarmTime && !this.alarmRinging) {
          await this.triggerAlarm(alarm);
        }
      }
    } catch (error) {
      console.error('Error checking alarms:', error);
    }
  }

  shouldTriggerToday(alarm, now) {
    if (!alarm.repeat || alarm.repeat.length === 0) {
      // One-time alarm
      return true;
    }

    if (alarm.repeat.length === 7) {
      // Daily alarm
      return true;
    }

    // Check if today is in the repeat days
    const today = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    return alarm.repeat.includes(today);
  }

  async startSunrise(alarm) {
    try {
      this.sunriseStarted = true;
      this.activeAlarm = alarm;

      const duration = alarm.sunriseDuration || 30;

      this.notify('sunriseStarted', { alarm, duration });

      await sunriseController.start(
        duration,
        (color, progress) => {
          this.notify('sunriseProgress', { color, progress });
        },
        () => {
          this.notify('sunriseComplete', { alarm });
        }
      );
    } catch (error) {
      console.error('Error starting sunrise:', error);
      this.sunriseStarted = false;
    }
  }

  async triggerAlarm(alarm) {
    try {
      this.alarmRinging = true;
      this.activeAlarm = alarm;

      this.notify('alarmTriggered', { alarm });

      // Load and play sound with fade-in
      const soundKey = alarm.sound || 'birds';
      const soundFile = ALARM_SOUNDS[soundKey];
      
      await audioService.loadSound(soundFile);
      await audioService.fadeIn(30); // 30 second fade-in

      // Update alarm if it's one-time only
      if (!alarm.repeat || alarm.repeat.length === 0) {
        await updateAlarm(alarm.id, { enabled: false });
      }
    } catch (error) {
      console.error('Error triggering alarm:', error);
      this.alarmRinging = false;
    }
  }

  async handleAlarmTrigger(alarmId) {
    const alarms = await loadAlarms();
    const alarm = alarms.find(a => a.id === alarmId);
    
    if (alarm) {
      await this.triggerAlarm(alarm);
    }
  }

  async snooze(minutes = 9) {
    try {
      if (this.activeAlarm) {
        await audioService.fadeOut(2);
        await sunriseController.reset();

        // Create a temporary snooze alarm
        const snoozeTime = new Date();
        snoozeTime.setMinutes(snoozeTime.getMinutes() + minutes);
        
        const snoozeAlarm = {
          ...this.activeAlarm,
          time: `${snoozeTime.getHours()}:${snoozeTime.getMinutes().toString().padStart(2, '0')}`,
          repeat: [], // Make it one-time
        };

        this.activeAlarm = null;
        this.sunriseStarted = false;
        this.alarmRinging = false;

        this.notify('alarmSnoozed', { minutes });

        // Schedule snooze
        setTimeout(() => {
          this.triggerAlarm(snoozeAlarm);
        }, minutes * 60 * 1000);
      }
    } catch (error) {
      console.error('Error snoozing alarm:', error);
    }
  }

  async dismiss() {
    try {
      await audioService.fadeOut(2);
      await sunriseController.reset();

      this.activeAlarm = null;
      this.sunriseStarted = false;
      this.alarmRinging = false;

      this.notify('alarmDismissed', {});
    } catch (error) {
      console.error('Error dismissing alarm:', error);
    }
  }

  async stopAll() {
    clearInterval(this.checkInterval);
    await audioService.stop();
    await sunriseController.reset();
    
    this.activeAlarm = null;
    this.sunriseStarted = false;
    this.alarmRinging = false;
  }

  getActiveAlarm() {
    return this.activeAlarm;
  }

  isAlarmActive() {
    return this.alarmRinging;
  }

  isSunriseActive() {
    return this.sunriseStarted;
  }
}

export default new AlarmManager();
