# Sound Files Setup Guide

This app requires 5 nature sound MP3 files to be placed in the `assets/sounds/` directory.

## Required Files

You need to create or download the following MP3 files:

1. **birds.mp3** - Bird chirping sounds (morning birds, forest birds)
2. **ocean.mp3** - Ocean waves sounds
3. **rain.mp3** - Gentle rain or rainfall sounds
4. **forest.mp3** - Forest ambience (birds, wind, trees)
5. **chimes.mp3** - Wind chimes or gentle chimes

## Where to Find Free Nature Sounds

### Recommended Sources (Free & Legal):

1. **Freesound.org**
   - https://freesound.org/
   - Create free account
   - Search for: "birds morning", "ocean waves", "rain", "forest ambience", "wind chimes"
   - Download WAV files and convert to MP3

2. **Pixabay**
   - https://pixabay.com/sound-effects/
   - No account needed
   - Royalty-free sounds
   - Direct MP3 downloads

3. **Zapsplat**
   - https://www.zapsplat.com/
   - Free account required
   - High-quality nature sounds
   - Download as MP3

4. **YouTube Audio Library**
   - https://www.youtube.com/audiolibrary
   - Free for use
   - Download and convert to MP3

## File Requirements

- **Format**: MP3
- **Length**: 30 seconds minimum (they will loop)
- **Quality**: 128kbps or higher recommended
- **Size**: Keep under 5MB per file for app size

## Converting Audio Files

If you download WAV or other formats, you can convert to MP3 using:

**Online Converters:**
- https://cloudconvert.com/wav-to-mp3
- https://online-audio-converter.com/

**Command Line (FFmpeg):**
```bash
ffmpeg -i input.wav -codec:a libmp3lame -b:a 192k output.mp3
```

**Desktop Apps:**
- Audacity (free, cross-platform)
- iTunes/Music (Mac)
- Windows Media Player (Windows)

## Quick Setup Commands

After downloading your MP3 files:

```bash
# Make sure you're in the project root
cd sunrise-alarm-app

# Place files in the sounds directory
mv ~/Downloads/birds.mp3 assets/sounds/
mv ~/Downloads/ocean.mp3 assets/sounds/
mv ~/Downloads/rain.mp3 assets/sounds/
mv ~/Downloads/forest.mp3 assets/sounds/
mv ~/Downloads/chimes.mp3 assets/sounds/
```

## Verify Setup

Check that all files are in place:

```bash
ls -lh assets/sounds/
```

You should see:
```
birds.mp3
ocean.mp3
rain.mp3
forest.mp3
chimes.mp3
```

## Recommended Sound Characteristics

### Birds (birds.mp3)
- Morning songbirds
- Peaceful, not too loud
- Natural fade-in if possible

### Ocean (ocean.mp3)
- Gentle waves, not crashing
- Steady rhythm
- Calming and continuous

### Rain (rain.mp3)
- Soft rainfall, not thunderstorm
- Steady patter
- No sudden loud sounds

### Forest (forest.mp3)
- Mix of light wind and distant birds
- Natural ambience
- Peaceful atmosphere

### Chimes (chimes.mp3)
- Soft, melodic wind chimes
- Not too metallic or harsh
- Gentle tones

## Testing Your Sounds

After adding the files, test each one:

1. Run the app
2. Create a new alarm
3. Select each sound option
4. The sound should load and play when the alarm triggers

## Troubleshooting

**"Cannot find module" error:**
- Make sure file names match exactly (lowercase, .mp3 extension)
- Files must be in `assets/sounds/` directory
- Restart the Expo server after adding files

**Sound doesn't play:**
- Check file format is MP3
- Verify file isn't corrupted
- Try converting to a different bitrate

**App size too large:**
- Compress MP3 files to 128kbps
- Trim files to 30-60 seconds
- Use mono instead of stereo if possible

## Alternative: Placeholder Sounds

If you want to test the app without sounds immediately, you can:

1. Create silent MP3 files (1 second of silence)
2. Use any MP3 file duplicated 5 times with different names
3. Download from: https://www.soundjay.com/nature-sounds.html

Just remember to replace them with actual nature sounds later!
