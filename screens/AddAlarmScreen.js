import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';
import { addAlarm, updateAlarm } from '../services/alarmStorage';
import { scheduleAlarmNotification } from '../services/notificationService';
import { ALARM_SOUND_NAMES } from '../services/audioService';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AddAlarmScreen({ navigation, route }) {
  const isEdit = route.params?.alarm != null;
  const existingAlarm = route.params?.alarm;

  const [time, setTime] = useState(
    existingAlarm
      ? new Date(`2000-01-01T${existingAlarm.time}:00`)
      : new Date()
  );
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [label, setLabel] = useState(existingAlarm?.label || '');
  const [repeatDays, setRepeatDays] = useState(existingAlarm?.repeat || []);
  const [sunriseDuration, setSunriseDuration] = useState(
    existingAlarm?.sunriseDuration || 30
  );
  const [selectedSound, setSelectedSound] = useState(
    existingAlarm?.sound || 'birds'
  );

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const toggleDay = (dayIndex) => {
    if (repeatDays.includes(dayIndex)) {
      setRepeatDays(repeatDays.filter((d) => d !== dayIndex));
    } else {
      setRepeatDays([...repeatDays, dayIndex].sort());
    }
  };

  const selectAllDays = () => {
    if (repeatDays.length === 7) {
      setRepeatDays([]);
    } else {
      setRepeatDays([0, 1, 2, 3, 4, 5, 6]);
    }
  };

  const selectWeekdays = () => {
    setRepeatDays([1, 2, 3, 4, 5]);
  };

  const selectWeekend = () => {
    setRepeatDays([0, 6]);
  };

  const handleSave = async () => {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    const alarmData = {
      time: timeString,
      label,
      repeat: repeatDays,
      sunriseDuration,
      sound: selectedSound,
      enabled: true,
    };

    try {
      let result;
      if (isEdit) {
        result = await updateAlarm(existingAlarm.id, alarmData);
      } else {
        result = await addAlarm(alarmData);
      }

      if (result) {
        // Schedule notification
        const notificationId = await scheduleAlarmNotification(result);
        if (notificationId) {
          await updateAlarm(result.id, { notificationId });
        }

        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to save alarm');
      }
    } catch (error) {
      console.error('Error saving alarm:', error);
      Alert.alert('Error', 'Failed to save alarm');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? 'Edit Alarm' : 'New Alarm'}
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.headerButton, styles.saveButton]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Time Picker */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.timeText}>
              {time.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </Text>
          </TouchableOpacity>

          {(showTimePicker || Platform.OS === 'ios') && (
            <DateTimePicker
              value={time}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              style={styles.timePicker}
              textColor="#fff"
            />
          )}
        </View>

        {/* Label */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Label</Text>
          <TextInput
            style={styles.input}
            placeholder="Alarm name (optional)"
            placeholderTextColor="#666"
            value={label}
            onChangeText={setLabel}
          />
        </View>

        {/* Repeat Days */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Repeat</Text>
          
          <View style={styles.quickSelectContainer}>
            <TouchableOpacity
              style={styles.quickSelectButton}
              onPress={selectWeekdays}
            >
              <Text style={styles.quickSelectText}>Weekdays</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickSelectButton}
              onPress={selectWeekend}
            >
              <Text style={styles.quickSelectText}>Weekend</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickSelectButton}
              onPress={selectAllDays}
            >
              <Text style={styles.quickSelectText}>
                {repeatDays.length === 7 ? 'Clear All' : 'Every Day'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.daysGrid}>
            {DAYS.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayButton,
                  repeatDays.includes(index) && styles.dayButtonActive,
                ]}
                onPress={() => toggleDay(index)}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    repeatDays.includes(index) && styles.dayButtonTextActive,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sunrise Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Sunrise Duration: {sunriseDuration} minutes
          </Text>
          <View style={styles.durationButtons}>
            {[10, 15, 20, 30, 45, 60].map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.durationButton,
                  sunriseDuration === duration && styles.durationButtonActive,
                ]}
                onPress={() => setSunriseDuration(duration)}
              >
                <Text
                  style={[
                    styles.durationButtonText,
                    sunriseDuration === duration && styles.durationButtonTextActive,
                  ]}
                >
                  {duration}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.helperText}>
            Light will start {sunriseDuration} minutes before alarm
          </Text>
        </View>

        {/* Sound Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alarm Sound</Text>
          {Object.keys(ALARM_SOUND_NAMES).map((soundKey) => (
            <TouchableOpacity
              key={soundKey}
              style={[
                styles.soundOption,
                selectedSound === soundKey && styles.soundOptionActive,
              ]}
              onPress={() => setSelectedSound(soundKey)}
            >
              <Text
                style={[
                  styles.soundOptionText,
                  selectedSound === soundKey && styles.soundOptionTextActive,
                ]}
              >
                {ALARM_SOUND_NAMES[soundKey]}
              </Text>
              {selectedSound === soundKey && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#16213e',
  },
  headerButton: {
    fontSize: 16,
    color: '#aaa',
  },
  saveButton: {
    color: '#ff6b35',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffa500',
    marginBottom: 15,
  },
  timeButton: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  timeText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#fff',
  },
  timePicker: {
    backgroundColor: '#0f3460',
  },
  input: {
    backgroundColor: '#0f3460',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#fff',
  },
  quickSelectContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  quickSelectButton: {
    flex: 1,
    backgroundColor: '#0f3460',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  quickSelectText: {
    color: '#ffa500',
    fontSize: 12,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dayButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#0f3460',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayButtonActive: {
    backgroundColor: '#ff6b35',
    borderColor: '#ffa500',
  },
  dayButtonText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 12,
  },
  dayButtonTextActive: {
    color: '#fff',
  },
  durationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  durationButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#0f3460',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  durationButtonActive: {
    backgroundColor: '#ff6b35',
    borderColor: '#ffa500',
  },
  durationButtonText: {
    color: '#888',
    fontWeight: 'bold',
  },
  durationButtonTextActive: {
    color: '#fff',
  },
  helperText: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  soundOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f3460',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  soundOptionActive: {
    backgroundColor: '#ff6b35',
  },
  soundOptionText: {
    color: '#aaa',
    fontSize: 16,
  },
  soundOptionTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkmark: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
