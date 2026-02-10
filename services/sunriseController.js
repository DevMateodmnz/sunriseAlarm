import * as Brightness from 'expo-brightness';
import { Vibration } from 'react-native';
import flashlightController from './flashlightController';

// Sunrise color progression: night -> dawn -> sunrise -> day
const SUNRISE_COLORS = [
  { r: 10, g: 10, b: 20 },      // Deep night
  { r: 20, g: 20, b: 40 },      // Night
  { r: 30, g: 30, b: 60 },      // Pre-dawn
  { r: 40, g: 40, b: 80 },      // Early dawn
  { r: 60, g: 50, b: 100 },     // Dawn blue
  { r: 80, g: 60, b: 110 },     // Dawn
  { r: 120, g: 70, b: 100 },    // Early morning purple
  { r: 160, g: 80, b: 80 },     // Morning pink
  { r: 200, g: 100, b: 60 },    // Sunrise orange
  { r: 230, g: 140, b: 70 },    // Sunrise
  { r: 250, g: 180, b: 80 },    // Golden hour
  { r: 255, g: 220, b: 120 },   // Bright morning
  { r: 255, g: 240, b: 180 },   // Day
  { r: 255, g: 255, b: 230 },   // Bright day
  { r: 255, g: 255, b: 255 },   // Full daylight
];

class SunriseController {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.originalBrightness = 0.5;
    this.currentProgress = 0;
  }

  async start(durationMinutes, onColorChange, onComplete) {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.currentProgress = 0;

    try {
      // Save original brightness
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === 'granted') {
        this.originalBrightness = await Brightness.getBrightnessAsync();
        await Brightness.setBrightnessAsync(0); // Start from dark
      }

      // Request flashlight permissions
      await flashlightController.requestPermissions();

      const totalMs = durationMinutes * 60 * 1000;
      const updateInterval = 1000; // Update every second
      const totalSteps = totalMs / updateInterval;
      let currentStep = 0;

      this.intervalId = setInterval(async () => {
        currentStep++;
        this.currentProgress = currentStep / totalSteps;

        // Calculate current color
        const colorIndex = Math.min(
          Math.floor(this.currentProgress * SUNRISE_COLORS.length),
          SUNRISE_COLORS.length - 1
        );
        const color = SUNRISE_COLORS[colorIndex];

        // Update screen brightness
        if (status === 'granted') {
          await Brightness.setBrightnessAsync(this.currentProgress);
        }

        // Update flashlight intensity (by pulsing faster)
        if (this.currentProgress > 0.3) {
          // Start flashlight at 30% progress
          const flashProgress = (this.currentProgress - 0.3) / 0.7;
          const pulseSpeed = 1000 - (flashProgress * 800); // 1000ms to 200ms
          
          if (flashProgress < 0.8) {
            await flashlightController.pulse(pulseSpeed);
          } else {
            await flashlightController.turnOn();
          }
        }

        // Notify color change
        if (onColorChange) {
          onColorChange(color, this.currentProgress);
        }

        // Check if complete
        if (currentStep >= totalSteps) {
          this.stop();
          if (onComplete) {
            onComplete();
          }
        }
      }, updateInterval);

    } catch (error) {
      console.error('Error starting sunrise:', error);
      this.stop();
    }
  }

  async stop() {
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.currentProgress = 0;
  }

  async reset() {
    await this.stop();
    
    try {
      // Restore original brightness
      const { status } = await Brightness.getPermissionsAsync();
      if (status === 'granted') {
        await Brightness.setBrightnessAsync(this.originalBrightness);
      }

      // Turn off flashlight
      await flashlightController.turnOff();
    } catch (error) {
      console.error('Error resetting sunrise:', error);
    }
  }

  getProgress() {
    return this.currentProgress;
  }

  async snooze(snoozeMinutes = 5) {
    await this.reset();
    // Snooze logic will be handled by the alarm screen
    return snoozeMinutes;
  }
}

export default new SunriseController();
export { SUNRISE_COLORS };
