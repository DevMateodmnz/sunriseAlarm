import { Audio } from 'expo-av';

class AudioService {
  constructor() {
    this.sound = null;
    this.isPlaying = false;
    this.fadeInterval = null;
    this.currentVolume = 0;
  }

  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  async loadSound(soundFile) {
    try {
      // Unload previous sound if exists
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        soundFile,
        { 
          isLooping: true,
          volume: 0, // Start at 0 for fade-in
        }
      );

      this.sound = sound;
      this.currentVolume = 0;
      return true;
    } catch (error) {
      console.error('Error loading sound:', error);
      return false;
    }
  }

  async play() {
    try {
      if (this.sound && !this.isPlaying) {
        await this.sound.playAsync();
        this.isPlaying = true;
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  async pause() {
    try {
      if (this.sound && this.isPlaying) {
        await this.sound.pauseAsync();
        this.isPlaying = false;
      }
    } catch (error) {
      console.error('Error pausing sound:', error);
    }
  }

  async stop() {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        this.isPlaying = false;
        this.currentVolume = 0;
        
        if (this.fadeInterval) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
      }
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  }

  async fadeIn(durationSeconds = 30) {
    try {
      if (!this.sound) return;

      await this.play();
      
      const steps = 100;
      const stepDuration = (durationSeconds * 1000) / steps;
      const volumeIncrement = 1 / steps;

      if (this.fadeInterval) {
        clearInterval(this.fadeInterval);
      }

      this.fadeInterval = setInterval(async () => {
        this.currentVolume = Math.min(1, this.currentVolume + volumeIncrement);
        
        if (this.sound) {
          await this.sound.setVolumeAsync(this.currentVolume);
        }

        if (this.currentVolume >= 1) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
      }, stepDuration);
    } catch (error) {
      console.error('Error fading in sound:', error);
    }
  }

  async fadeOut(durationSeconds = 5) {
    try {
      if (!this.sound) return;

      const steps = 50;
      const stepDuration = (durationSeconds * 1000) / steps;
      const volumeDecrement = this.currentVolume / steps;

      if (this.fadeInterval) {
        clearInterval(this.fadeInterval);
      }

      this.fadeInterval = setInterval(async () => {
        this.currentVolume = Math.max(0, this.currentVolume - volumeDecrement);
        
        if (this.sound) {
          await this.sound.setVolumeAsync(this.currentVolume);
        }

        if (this.currentVolume <= 0) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
          await this.stop();
        }
      }, stepDuration);
    } catch (error) {
      console.error('Error fading out sound:', error);
    }
  }

  async setVolume(volume) {
    try {
      if (this.sound) {
        this.currentVolume = Math.max(0, Math.min(1, volume));
        await this.sound.setVolumeAsync(this.currentVolume);
      }
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }

  async unload() {
    try {
      await this.stop();
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }
    } catch (error) {
      console.error('Error unloading sound:', error);
    }
  }
}

export default new AudioService();

// Available alarm sounds
export const ALARM_SOUNDS = {
  birds: require('../assets/sounds/birds.mp3'),
  ocean: require('../assets/sounds/ocean.mp3'),
  rain: require('../assets/sounds/rain.mp3'),
  forest: require('../assets/sounds/forest.mp3'),
  chimes: require('../assets/sounds/chimes.mp3'),
};

export const ALARM_SOUND_NAMES = {
  birds: 'Birds Chirping',
  ocean: 'Ocean Waves',
  rain: 'Gentle Rain',
  forest: 'Forest Ambience',
  chimes: 'Wind Chimes',
};
