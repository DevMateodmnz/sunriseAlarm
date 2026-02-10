import AsyncStorage from '@react-native-async-storage/async-storage';

const ALARMS_KEY = '@sunrise_alarms';

export const saveAlarms = async (alarms) => {
  try {
    await AsyncStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
    return true;
  } catch (error) {
    console.error('Error saving alarms:', error);
    return false;
  }
};

export const loadAlarms = async () => {
  try {
    const alarmsJson = await AsyncStorage.getItem(ALARMS_KEY);
    return alarmsJson ? JSON.parse(alarmsJson) : [];
  } catch (error) {
    console.error('Error loading alarms:', error);
    return [];
  }
};

export const addAlarm = async (alarm) => {
  try {
    const alarms = await loadAlarms();
    const newAlarm = {
      ...alarm,
      id: Date.now().toString(),
      enabled: true,
      createdAt: new Date().toISOString(),
    };
    alarms.push(newAlarm);
    await saveAlarms(alarms);
    return newAlarm;
  } catch (error) {
    console.error('Error adding alarm:', error);
    return null;
  }
};

export const updateAlarm = async (id, updates) => {
  try {
    const alarms = await loadAlarms();
    const index = alarms.findIndex(alarm => alarm.id === id);
    if (index !== -1) {
      alarms[index] = { ...alarms[index], ...updates };
      await saveAlarms(alarms);
      return alarms[index];
    }
    return null;
  } catch (error) {
    console.error('Error updating alarm:', error);
    return null;
  }
};

export const deleteAlarm = async (id) => {
  try {
    const alarms = await loadAlarms();
    const filtered = alarms.filter(alarm => alarm.id !== id);
    await saveAlarms(filtered);
    return true;
  } catch (error) {
    console.error('Error deleting alarm:', error);
    return false;
  }
};

export const toggleAlarm = async (id) => {
  try {
    const alarms = await loadAlarms();
    const index = alarms.findIndex(alarm => alarm.id === id);
    if (index !== -1) {
      alarms[index].enabled = !alarms[index].enabled;
      await saveAlarms(alarms);
      return alarms[index];
    }
    return null;
  } catch (error) {
    console.error('Error toggling alarm:', error);
    return null;
  }
};
