import { Camera } from 'expo-camera';
import { Platform } from 'react-native';

class FlashlightController {
  constructor() {
    this.isOn = false;
    this.intervalId = null;
    this.pulseSpeed = 1000; // milliseconds
  }

  async turnOn() {
    try {
      if (Platform.OS === 'android') {
        await Camera.setFlashMode('torch');
      } else {
        // iOS doesn't have direct torch control in Expo
        // We'll need to use Camera component
      }
      this.isOn = true;
    } catch (error) {
      console.error('Error turning on flashlight:', error);
    }
  }

  async turnOff() {
    try {
      if (Platform.OS === 'android') {
        await Camera.setFlashMode('off');
      }
      this.isOn = false;
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    } catch (error) {
      console.error('Error turning off flashlight:', error);
    }
  }

  async pulse(speed = 1000) {
    this.pulseSpeed = speed;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.intervalId = setInterval(async () => {
      if (this.isOn) {
        await this.turnOff();
      } else {
        await this.turnOn();
      }
    }, this.pulseSpeed);
  }

  async startGradualIncrease(durationMinutes, onProgress) {
    const totalMs = durationMinutes * 60 * 1000;
    const steps = 100;
    const stepMs = totalMs / steps;
    
    let currentStep = 0;
    
    const interval = setInterval(async () => {
      currentStep++;
      const progress = currentStep / steps;
      
      if (onProgress) {
        onProgress(progress);
      }
      
      // Increase pulse speed (faster = brighter effect)
      const newSpeed = 1000 - (progress * 900); // From 1000ms to 100ms
      
      if (currentStep < 50) {
        // First half: start pulsing slower
        await this.pulse(newSpeed);
      } else {
        // Second half: keep it on more
        await this.turnOn();
      }
      
      if (currentStep >= steps) {
        clearInterval(interval);
        await this.turnOn(); // Ensure it's on at the end
      }
    }, stepMs);
    
    return interval;
  }

  async requestPermissions() {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }
}

export default new FlashlightController();
