import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { loadAlarms, toggleAlarm, deleteAlarm } from '../services/alarmStorage';
import { scheduleAlarmNotification, cancelAlarmNotification } from '../services/notificationService';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function HomeScreen({ navigation }) {
  const [alarms, setAlarms] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAlarmsData();
    
    // Refresh when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadAlarmsData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadAlarmsData = async () => {
    setRefreshing(true);
    const data = await loadAlarms();
    setAlarms(data);
    setRefreshing(false);
  };

  const handleToggle = async (alarm) => {
    const updated = await toggleAlarm(alarm.id);
    if (updated) {
      // Reschedule or cancel notification
      if (updated.enabled) {
        const notificationId = await scheduleAlarmNotification(updated);
        // Update with notification ID would go here
      } else {
        await cancelAlarmNotification(alarm.notificationId);
      }
      await loadAlarmsData();
    }
  };

  const handleDelete = (alarm) => {
    Alert.alert(
      'Delete Alarm',
      'Are you sure you want to delete this alarm?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await cancelAlarmNotification(alarm.notificationId);
            await deleteAlarm(alarm.id);
            await loadAlarmsData();
          },
        },
      ]
    );
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const renderAlarm = ({ item }) => (
    <TouchableOpacity
      style={styles.alarmCard}
      onPress={() => navigation.navigate('EditAlarm', { alarm: item })}
      onLongPress={() => handleDelete(item)}
    >
      <View style={styles.alarmMain}>
        <View style={styles.alarmInfo}>
          <Text style={[styles.alarmTime, !item.enabled && styles.disabledText]}>
            {formatTime(item.time)}
          </Text>
          {item.label && (
            <Text style={[styles.alarmLabel, !item.enabled && styles.disabledText]}>
              {item.label}
            </Text>
          )}
          {item.repeat && item.repeat.length > 0 && (
            <View style={styles.daysContainer}>
              {DAYS.map((day, index) => (
                <Text
                  key={index}
                  style={[
                    styles.dayText,
                    item.repeat.includes(index) && styles.activeDayText,
                    !item.enabled && styles.disabledText,
                  ]}
                >
                  {day}
                </Text>
              ))}
            </View>
          )}
          <Text style={[styles.sunriseInfo, !item.enabled && styles.disabledText]}>
            🌅 {item.sunriseDuration || 30} min sunrise
          </Text>
        </View>
        <Switch
          value={item.enabled}
          onValueChange={() => handleToggle(item)}
          trackColor={{ false: '#767577', true: '#ffa500' }}
          thumbColor={item.enabled ? '#ff6b35' : '#f4f3f4'}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sunrise Alarm</Text>
        <Text style={styles.headerSubtitle}>Wake up naturally</Text>
      </View>

      {alarms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>☀️</Text>
          <Text style={styles.emptyText}>No alarms yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button to create your first sunrise alarm
          </Text>
        </View>
      ) : (
        <FlatList
          data={alarms}
          renderItem={renderAlarm}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={loadAlarmsData}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddAlarm')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: '#16213e',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffa500',
  },
  listContainer: {
    padding: 15,
  },
  alarmCard: {
    backgroundColor: '#0f3460',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ffa500',
  },
  alarmMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alarmInfo: {
    flex: 1,
  },
  alarmTime: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  alarmLabel: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayText: {
    color: '#555',
    marginRight: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  activeDayText: {
    color: '#ffa500',
  },
  sunriseInfo: {
    fontSize: 14,
    color: '#888',
  },
  disabledText: {
    opacity: 0.4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 25,
    bottom: 35,
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#ff6b35',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  addButtonText: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
  },
});
