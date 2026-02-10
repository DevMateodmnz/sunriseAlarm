import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Alert } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import AddAlarmScreen from './screens/AddAlarmScreen';
import AlarmRingingScreen from './screens/AlarmRingingScreen';
import alarmManager from './services/alarmManager';
import { requestPermissions } from './services/notificationService';

const Stack = createStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Request notification permissions
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        Alert.alert(
          'Permissions Required',
          'This app needs notification permissions to work properly. Please enable them in settings.',
          [{ text: 'OK' }]
        );
      }

      // Initialize alarm manager
      await alarmManager.initialize();

      // Listen for alarm events
      alarmManager.subscribe((event, data) => {
        if (event === 'alarmTriggered') {
          // Navigate to alarm ringing screen
          // This would require a navigation ref, for now we'll handle it in the screen
        }
      });

      setIsReady(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsReady(true);
    }
  };

  if (!isReady) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#1a1a2e' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen 
          name="AddAlarm" 
          component={AddAlarmScreen}
          options={{
            presentation: 'modal',
          }}
        />
        <Stack.Screen 
          name="EditAlarm" 
          component={AddAlarmScreen}
          options={{
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="AlarmRinging"
          component={AlarmRingingScreen}
          options={{
            presentation: 'fullScreenModal',
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
