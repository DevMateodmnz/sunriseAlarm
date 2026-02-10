import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as KeepAwake from 'expo-keep-awake';
import alarmManager from '../services/alarmManager';
import { SUNRISE_COLORS } from '../services/sunriseController';

const { width, height } = Dimensions.get('window');

export default function AlarmRingingScreen({ navigation, route }) {
  const alarm = route.params?.alarm;
  
  const [currentColor, setCurrentColor] = useState(SUNRISE_COLORS[0]);
  const [progress, setProgress] = useState(0);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Keep screen awake
    KeepAwake.activateKeepAwakeAsync();

    // Update current time
    const timeInterval = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    }, 1000);

    // Listen to alarm manager events
    const unsubscribe = alarmManager.subscribe((event, data) => {
      if (event === 'sunriseProgress') {
        setCurrentColor(data.color);
        setProgress(data.progress);
      } else if (event === 'alarmTriggered') {
        setIsAlarmRinging(true);
        startPulseAnimation();
      }
    });

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    return () => {
      clearInterval(timeInterval);
      unsubscribe();
      KeepAwake.deactivateKeepAwake();
    };
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleSnooze = async () => {
    await alarmManager.snooze(9);
    navigation.goBack();
  };

  const handleDismiss = async () => {
    await alarmManager.dismiss();
    navigation.goBack();
  };

  const getGradientColors = () => {
    const { r, g, b } = currentColor;
    const baseColor = `rgb(${r}, ${g}, ${b})`;
    const lighterColor = `rgb(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)})`;
    const darkerColor = `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`;
    
    return [darkerColor, baseColor, lighterColor, baseColor];
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={getGradientColors()}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Sun Circle */}
          <Animated.View
            style={[
              styles.sunContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={styles.sun}>
              <View style={styles.sunInner} />
            </View>
          </Animated.View>

          {/* Time Display */}
          <View style={styles.timeContainer}>
            <Text style={styles.currentTime}>{currentTime}</Text>
            {alarm?.label && (
              <Text style={styles.alarmLabel}>{alarm.label}</Text>
            )}
          </View>

          {/* Progress Info */}
          <View style={styles.infoContainer}>
            {!isAlarmRinging ? (
              <>
                <Text style={styles.statusText}>Sunrise in progress</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progress * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(progress * 100)}%
                </Text>
              </>
            ) : (
              <Text style={styles.statusText}>Time to wake up!</Text>
            )}
          </View>

          {/* Control Buttons */}
          {isAlarmRinging && (
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.snoozeButton]}
                onPress={handleSnooze}
              >
                <Text style={styles.buttonText}>Snooze</Text>
                <Text style={styles.buttonSubtext}>9 minutes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.dismissButton]}
                onPress={handleDismiss}
              >
                <Text style={styles.buttonText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 60,
  },
  sunContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sun: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 20,
  },
  sunInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  timeContainer: {
    alignItems: 'center',
  },
  currentTime: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  alarmLabel: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  infoContainer: {
    alignItems: 'center',
    width: width * 0.8,
  },
  statusText: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 15,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  buttonsContainer: {
    width: width * 0.8,
    gap: 15,
  },
  button: {
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  snoozeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dismissButton: {
    backgroundColor: 'rgba(255, 107, 53, 0.9)',
  },
  buttonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
});
