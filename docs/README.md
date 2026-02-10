# 🌅 Sunrise Alarm Clock App

A beautiful React Native alarm clock that wakes you up naturally with a simulated sunrise using your phone's screen and flashlight.

## Features

✨ **Sunrise Simulation**
- Screen gradually transitions from dark blue → orange → yellow → white
- Phone flashlight gradually increases in intensity
- Configurable sunrise duration (10-60 minutes)

🔊 **Natural Alarm Sounds**
- Multiple nature sounds (birds, ocean, rain, forest, wind chimes)
- Sound fades in gradually over 30 seconds

⏰ **Full Alarm Management**
- Multiple alarms
- Recurring alarms (daily, weekdays, weekends, custom days)
- Snooze functionality (9 minutes)
- Custom labels for each alarm

📱 **Mobile Features**
- Works on both iOS and Android
- Keep screen awake during alarm
- Background notifications
- Beautiful gradient UI

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. **Install dependencies**
```bash
npm install
# or
yarn install
```

2. **Add alarm sound files**

You need to add MP3 files to `assets/sounds/` directory:
- `birds.mp3` - Bird chirping sounds
- `ocean.mp3` - Ocean waves
- `rain.mp3` - Rain sounds
- `forest.mp3` - Forest ambience
- `chimes.mp3` - Wind chimes

You can find free nature sounds at:
- https://freesound.org/
- https://pixabay.com/sound-effects/
- https://www.zapsplat.com/

**Important:** Make sure files are named exactly as listed above.

3. **Add app icons (optional)**

Create or download icon images and place them in the `assets/` directory:
- `icon.png` (1024x1024) - App icon
- `splash.png` (1284x2778) - Splash screen
- `adaptive-icon.png` (1024x1024) - Android adaptive icon
- `favicon.png` (48x48) - Web favicon
- `notification-icon.png` (96x96) - Notification icon

For now, you can use placeholder images or skip this step.

### Running the App

**Start the development server:**
```bash
npm start
# or
expo start
```

**Run on iOS:**
```bash
npm run ios
```

**Run on Android:**
```bash
npm run android
```

**Run on web (limited functionality):**
```bash
npm run web
```

## How to Use

### Creating an Alarm

1. Tap the **+** button on the home screen
2. Set your desired wake-up time
3. (Optional) Add a label for the alarm
4. Select which days to repeat (or leave empty for one-time alarm)
5. Choose sunrise duration (how long before alarm time the light should start)
6. Select your preferred alarm sound
7. Tap **Save**

### During Sunrise

- The screen will gradually brighten starting from the configured duration before your alarm
- The flashlight will start pulsing and increase in intensity
- When the alarm time is reached, the sound will fade in

### When Alarm Rings

- **Snooze**: Delays alarm by 9 minutes
- **Dismiss**: Stops the alarm completely

### Managing Alarms

- **Toggle On/Off**: Use the switch on each alarm card
- **Edit**: Tap on an alarm to edit it
- **Delete**: Long-press an alarm and confirm deletion

## Permissions Required

The app requires the following permissions:

### iOS
- Notifications (for alarm alerts)
- Camera (for flashlight control)

### Android
- Notifications
- Camera/Flashlight
- Wake Lock (keep screen on)
- Schedule Exact Alarms

## Project Structure

```
sunrise-alarm-app/
├── App.js                          # Main app component with navigation
├── screens/
│   ├── HomeScreen.js              # List of alarms
│   ├── AddAlarmScreen.js          # Create/edit alarm
│   └── AlarmRingingScreen.js      # Sunrise effect & alarm ringing
├── services/
│   ├── alarmStorage.js            # AsyncStorage for alarm data
│   ├── notificationService.js     # Schedule notifications
│   ├── flashlightController.js   # Control phone flashlight
│   ├── sunriseController.js       # Sunrise color progression
│   ├── audioService.js            # Sound playback & fade-in
│   └── alarmManager.js            # Coordinate all services
└── assets/
    └── sounds/                     # MP3 alarm sounds
```

## Technologies Used

- **React Native** with **Expo**
- **React Navigation** for screen navigation
- **AsyncStorage** for local data persistence
- **Expo Notifications** for alarm scheduling
- **Expo AV** for audio playback
- **Expo Camera** for flashlight control
- **Expo Linear Gradient** for sunrise colors
- **Expo Brightness** for screen brightness control

## Known Limitations

### iOS
- Flashlight control is limited in Expo. For full flashlight functionality, you may need to eject to bare React Native and use native modules.
- Background task limitations may affect alarm precision when app is fully closed.

### Android
- Some devices may have battery optimization that affects background alarms.
- Users may need to disable battery optimization for the app in settings.

## Future Enhancements

- [ ] Vibration patterns during sunrise
- [ ] Smart snooze (increasing difficulty)
- [ ] Sleep tracking integration
- [ ] Sunset mode for bedtime
- [ ] Weather-based wake-up sounds
- [ ] Bluetooth speaker support
- [ ] Widget support
- [ ] Cloud backup of alarms

## Troubleshooting

**Alarm doesn't ring when app is closed**
- Make sure you've granted all permissions
- On Android, disable battery optimization for the app
- Keep the app in background (don't force close it)

**Flashlight doesn't work**
- Grant camera permissions
- On iOS, flashlight control via Expo is limited

**Sounds don't play**
- Make sure all sound files are in `assets/sounds/`
- Check that files are named correctly
- Verify audio permissions are granted

**Sunrise colors don't show**
- This is expected behavior in the web version
- Test on a physical device for best results

## Contributing

Feel free to submit issues and pull requests!

## License

MIT License - feel free to use this project for personal or commercial purposes.

---

**Made with ☀️ by developers who hate jarring alarm sounds**
