# 🚀 Quick Start Guide

Get your Sunrise Alarm app running in 5 minutes!

## Prerequisites

- Node.js installed (v14+)
- npm or yarn
- A smartphone or emulator

## Step-by-Step Setup

### 1. Install Expo CLI (if you don't have it)

```bash
npm install -g expo-cli
```

### 2. Navigate to the project

```bash
cd sunrise-alarm-app
```

### 3. Install dependencies

```bash
npm install
```

This will install all required packages including:
- React Native
- Expo modules
- Navigation
- Audio/Video libraries
- etc.

### 4. Add Sound Files

**Quick option - Download a sample pack:**

Visit these sites and download 5 nature sound MP3 files:
- Birds: https://pixabay.com/sound-effects/search/birds/
- Ocean: https://pixabay.com/sound-effects/search/ocean/
- Rain: https://pixabay.com/sound-effects/search/rain/
- Forest: https://pixabay.com/sound-effects/search/forest/
- Chimes: https://pixabay.com/sound-effects/search/chimes/

**Name them exactly:**
- `birds.mp3`
- `ocean.mp3`
- `rain.mp3`
- `forest.mp3`
- `chimes.mp3`

**Place them in:**
```
assets/sounds/
```

**OR temporarily use placeholders:**

You can duplicate any MP3 file 5 times with these names to test the app, then replace with real sounds later.

### 5. Start the app

```bash
npm start
```

Or:
```bash
expo start
```

### 6. Run on your device

**Option A: Use Expo Go app (Easiest)**

1. Install "Expo Go" app from App Store or Google Play
2. Scan the QR code shown in terminal/browser
3. App will load on your phone

**Option B: iOS Simulator**

```bash
npm run ios
```

**Option C: Android Emulator**

```bash
npm run android
```

## First Use

1. **Grant Permissions**: The app will ask for:
   - Notifications (required for alarms)
   - Camera (for flashlight)
   
2. **Create Your First Alarm**:
   - Tap the orange **+** button
   - Set a time a few minutes from now to test
   - Choose a sunrise duration (try 2-5 minutes for testing)
   - Select a sound
   - Tap Save

3. **Test It**:
   - Wait for the alarm time
   - Watch the sunrise effect on your screen
   - Flashlight should activate
   - Sound should play

## Common Issues

### "Cannot find module" errors

**Solution:**
```bash
rm -rf node_modules
npm install
```

### Sound files not working

**Check:**
```bash
ls assets/sounds/
```

Should show all 5 MP3 files. If not, add them!

### Expo command not found

**Install Expo CLI:**
```bash
npm install -g expo-cli
```

### iOS build errors

**Clear cache:**
```bash
expo start -c
```

### Android permissions issues

Make sure you grant all permissions when prompted. If you denied them:
- Go to phone Settings > Apps > Sunrise Alarm > Permissions
- Enable Camera and Notifications

## Testing Tips

### Quick Test (2 minutes)
1. Set alarm for 2 minutes from now
2. Set sunrise duration to 1 minute
3. Watch the screen gradient change
4. Flashlight should pulse then stay on
5. Sound fades in

### Full Test (30 minutes)
1. Set alarm for 30 minutes from now
2. Set sunrise duration to 30 minutes
3. Leave phone on table
4. Come back in 30 minutes
5. Experience full sunrise effect

## Next Steps

- **Customize**: Create multiple alarms for different days
- **Explore Sounds**: Try different nature sounds
- **Set Recurring Alarms**: Set up weekday wake-up routine
- **Adjust Duration**: Find your perfect sunrise length

## Development Commands

```bash
# Start development server
npm start

# Start with cache cleared
expo start -c

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web (limited features)
npm run web
```

## Building for Production

### iOS (requires Mac + Xcode)
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

### Using EAS Build (recommended)
```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

## Getting Help

- Check `README.md` for detailed documentation
- Check `SOUNDS_SETUP.md` for sound file help
- Expo documentation: https://docs.expo.dev/
- React Native docs: https://reactnative.dev/

## Enjoy Your Sunrise Alarm! 🌅

Happy waking up naturally! ☀️
