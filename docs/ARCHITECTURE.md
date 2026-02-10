# 🏗️ Architecture Documentation

## Overview

The Sunrise Alarm app is built using React Native with Expo, following a service-oriented architecture where business logic is separated from UI components.

## Tech Stack

### Core
- **React Native** - Mobile framework
- **Expo** - Development platform and tools
- **JavaScript** - Primary language

### UI & Navigation
- **React Navigation** - Screen navigation
- **Expo Linear Gradient** - Sunrise color effects
- **React Native Animated API** - Animations

### Data & Storage
- **AsyncStorage** - Local alarm data persistence
- **Expo Notifications** - Alarm scheduling
- **Expo SecureStore** - Secure data (if needed)

### Hardware Integration
- **Expo Camera** - Flashlight control
- **Expo Brightness** - Screen brightness control
- **Expo AV** - Audio playback
- **Expo Keep Awake** - Prevent screen sleep

## Project Structure

```
sunrise-alarm-app/
│
├── App.js                        # Main app entry, navigation setup
│
├── screens/                      # UI Screens
│   ├── HomeScreen.js            # Alarm list view
│   ├── AddAlarmScreen.js        # Create/edit alarm form
│   └── AlarmRingingScreen.js    # Active alarm display
│
├── services/                     # Business Logic Layer
│   ├── alarmStorage.js          # CRUD operations for alarms
│   ├── notificationService.js   # System notification scheduling
│   ├── flashlightController.js # Phone flashlight control
│   ├── sunriseController.js     # Color progression logic
│   ├── audioService.js          # Sound playback & fade-in
│   └── alarmManager.js          # Orchestrates all services
│
├── assets/                       # Static Resources
│   ├── sounds/                  # MP3 alarm sounds
│   └── (icons, images)
│
└── (config files)
```

## Architecture Patterns

### 1. Service Layer Pattern

All business logic is encapsulated in service modules that can be used across screens:

```
Screens → Services → Native APIs
```

**Benefits:**
- Reusable logic
- Easier testing
- Clean separation of concerns
- Single source of truth

### 2. Singleton Services

Services like `alarmManager`, `audioService`, and `sunriseController` are singletons:

```javascript
class AlarmManager {
  constructor() { /* ... */ }
  // methods
}

export default new AlarmManager();
```

**Why?**
- Share state across the app
- Prevent multiple instances
- Easy global access

### 3. Event-Driven Communication

The `alarmManager` uses an observer pattern for communication:

```javascript
alarmManager.subscribe((event, data) => {
  if (event === 'alarmTriggered') {
    // Handle alarm trigger
  }
});
```

**Events:**
- `sunriseStarted` - Sunrise begins
- `sunriseProgress` - Color/brightness update
- `sunriseComplete` - Sunrise finished
- `alarmTriggered` - Alarm sound starts
- `alarmSnoozed` - User snoozed
- `alarmDismissed` - User dismissed

## Data Flow

### Alarm Creation Flow

```
User Input (AddAlarmScreen)
    ↓
Validation
    ↓
alarmStorage.addAlarm()
    ↓
Save to AsyncStorage
    ↓
notificationService.scheduleAlarmNotification()
    ↓
System Notification Scheduled
    ↓
Navigate back to HomeScreen
    ↓
Refresh alarm list
```

### Alarm Trigger Flow

```
System Time Check (alarmManager.checkAlarms())
    ↓
Is it sunrise time?
    ↓ YES
sunriseController.start()
    ├─ Update screen colors (LinearGradient)
    ├─ Update brightness (Expo Brightness API)
    └─ Control flashlight (Camera API)
    ↓
Emit 'sunriseProgress' events
    ↓
Is it alarm time?
    ↓ YES
audioService.loadSound() + fadeIn()
    ↓
Emit 'alarmTriggered' event
    ↓
Show AlarmRingingScreen
    ↓
User action (Snooze or Dismiss)
    ↓
sunriseController.reset() + audioService.stop()
```

## Service Details

### 1. alarmStorage.js

**Purpose:** CRUD operations for alarm data

**Key Methods:**
- `loadAlarms()` - Get all alarms
- `addAlarm(alarm)` - Create new alarm
- `updateAlarm(id, updates)` - Modify existing alarm
- `deleteAlarm(id)` - Remove alarm
- `toggleAlarm(id)` - Enable/disable alarm

**Data Structure:**
```javascript
{
  id: "1234567890",
  time: "07:30",
  label: "Work Day",
  repeat: [1, 2, 3, 4, 5], // Mon-Fri
  sunriseDuration: 30,
  sound: "birds",
  enabled: true,
  notificationId: "notification_123",
  createdAt: "2024-01-01T00:00:00Z"
}
```

### 2. notificationService.js

**Purpose:** Schedule system notifications for alarms

**Key Methods:**
- `requestPermissions()` - Get notification access
- `scheduleAlarmNotification(alarm)` - Create scheduled notification
- `cancelAlarmNotification(id)` - Remove notification

**How it works:**
- Uses Expo Notifications API
- Schedules based on alarm time and repeat pattern
- Handles recurring vs one-time alarms
- Returns notification ID for tracking

### 3. flashlightController.js

**Purpose:** Control phone's flashlight/torch

**Key Methods:**
- `turnOn()` - Enable flashlight
- `turnOff()` - Disable flashlight
- `pulse(speed)` - Blink at interval
- `startGradualIncrease(duration)` - Fade from off to on

**Implementation:**
- Uses Camera API (Android native)
- Simulates brightness by pulse speed
- Faster pulse = appears brighter

### 4. sunriseController.js

**Purpose:** Manage sunrise color progression

**Color Progression:**
```javascript
[
  { r: 10, g: 10, b: 20 },    // Deep night
  { r: 30, g: 30, b: 60 },    // Pre-dawn
  { r: 120, g: 70, b: 100 },  // Purple dawn
  { r: 200, g: 100, b: 60 },  // Orange sunrise
  { r: 255, g: 255, b: 255 }  // Full daylight
]
```

**Key Methods:**
- `start(duration, onColorChange, onComplete)` - Begin sunrise
- `stop()` - Halt sunrise
- `reset()` - Return to normal state
- `getProgress()` - Current completion %

### 5. audioService.js

**Purpose:** Play alarm sounds with fade-in

**Key Methods:**
- `loadSound(soundFile)` - Prepare audio
- `play()` - Start playback
- `stop()` - Stop playback
- `fadeIn(seconds)` - Gradually increase volume
- `fadeOut(seconds)` - Gradually decrease volume

**Sound Management:**
- Uses Expo AV (Audio/Video API)
- Loops alarm sounds
- Volume ranges from 0.0 to 1.0
- Fade implemented with intervals

### 6. alarmManager.js

**Purpose:** Orchestrate all services and manage alarm lifecycle

**Key Methods:**
- `initialize()` - Set up services and listeners
- `checkAlarms()` - Every second, check if alarm should trigger
- `startSunrise(alarm)` - Begin sunrise effect
- `triggerAlarm(alarm)` - Start alarm sound
- `snooze(minutes)` - Delay alarm
- `dismiss()` - Stop alarm

**Responsibilities:**
- Coordinate between all services
- Emit events for UI updates
- Handle timing logic
- Manage active alarm state

## Screen Components

### HomeScreen.js

**Purpose:** Display list of alarms

**Features:**
- FlatList of alarm cards
- Toggle switches for enable/disable
- Pull-to-refresh
- Long-press to delete
- FAB (Floating Action Button) to add alarm

**State Management:**
- Local state for alarm list
- Refreshes on screen focus
- Updates on alarm toggle

### AddAlarmScreen.js

**Purpose:** Create or edit an alarm

**Features:**
- Time picker (native DateTimePicker)
- Label input
- Day selection (repeating alarms)
- Quick presets (weekdays, weekend, daily)
- Duration selection (10, 15, 20, 30, 45, 60 min)
- Sound selection

**Validation:**
- Ensures time is set
- Saves to storage
- Schedules notification
- Returns to home

### AlarmRingingScreen.js

**Purpose:** Display during active alarm

**Features:**
- Full-screen gradient (sunrise colors)
- Animated sun visualization
- Current time display
- Progress bar (during sunrise)
- Snooze button (9 minutes)
- Dismiss button

**Animations:**
- Pulse animation on sun icon
- Fade-in on mount
- Gradient transitions

## State Management

### Local State (useState)
Used in screens for UI-specific state:
- Form inputs
- Loading states
- Selected options

### Service State (Singleton Classes)
Persistent state across app:
- Active alarm
- Current sunrise progress
- Audio playback state

### AsyncStorage
Persistent data across app restarts:
- All alarm configurations
- User preferences

## Performance Considerations

### Optimization Strategies

1. **Interval Management**
   - Single 1-second interval for alarm checking
   - Cleared when app unmounts
   - Prevents multiple timers

2. **Memory Management**
   - Unload sounds when not needed
   - Clear intervals on component unmount
   - Reset brightness on dismiss

3. **Battery Efficiency**
   - Wake lock only during alarm
   - Background task limitations
   - Scheduled notifications (system handles timing)

### Known Limitations

1. **Background Execution**
   - iOS: Limited background time
   - Android: Battery optimization may kill process
   - Solution: System notifications + foreground service

2. **Flashlight Control**
   - iOS: Limited API access via Expo
   - May require bare workflow for full control

3. **Precise Timing**
   - 1-second intervals may drift slightly
   - System notifications are more reliable
   - User should keep app in background (not force-close)

## Platform Differences

### iOS
- Time picker: Spinner style
- Notifications: More restrictive background
- Flashlight: Limited control
- Brightness: Full control

### Android
- Time picker: Modal dialog
- Notifications: Need exact alarm permission
- Flashlight: Full torch API
- Brightness: Full control

## Future Enhancements

### Architectural Improvements
1. **TypeScript** - Add type safety
2. **Redux/Context** - Global state management
3. **React Query** - Data fetching/caching
4. **Background Tasks** - Expo Task Manager

### Feature Additions
1. **Cloud Sync** - Add backend (MERN stack)
2. **Smart Features** - ML-based wake time
3. **Health Integration** - Sleep tracking
4. **Widgets** - Home screen quick actions

### Performance
1. **Code Splitting** - Lazy load screens
2. **Image Optimization** - Compress assets
3. **Audio Preloading** - Cache sounds
4. **Background Service** - Native module for Android

## Testing Strategy

### Unit Tests
- Service methods (alarmStorage, audioService)
- Utility functions
- Data transformations

### Integration Tests
- Alarm creation flow
- Notification scheduling
- Audio playback

### E2E Tests
- Full alarm lifecycle
- User interactions
- Screen navigation

### Manual Testing
- Different devices
- Various alarm times
- Edge cases (midnight, DST)

## Security Considerations

### Data Privacy
- All data stored locally (no cloud by default)
- No analytics tracking
- Minimal permissions required

### Permissions
- Notifications: Required for alarms
- Camera: Required for flashlight
- Storage: Automatic (AsyncStorage)

## Deployment

### Build Process
1. Update version in `app.json`
2. Build with EAS or Expo classic
3. Submit to app stores

### Release Checklist
- [ ] Test on multiple devices
- [ ] Verify all sounds included
- [ ] Check permissions work
- [ ] Test alarm scheduling
- [ ] Validate sunrise effect
- [ ] Check battery usage

---

This architecture provides a solid foundation for a reliable, performant sunrise alarm app while maintaining code quality and extensibility.
