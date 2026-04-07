# MMM-DriveVideos

## Preview

![MMM-DriveVideos Screenshot](screenshot.png)

MagicMirror module that plays videos from a Google Drive folder using rclone.

No API keys. No Google developer setup. Simple browser-based authentication.

---

## Features

- Plays videos from Google Drive
- Uses rclone with no API keys required
- Automatic background syncing with no cron needed
- Simple setup for non-technical users
- Supports linear and random playback
- Optional sound control
- Touch, swipe, and arrow-based video navigation

---

## Installation

Navigate to your MagicMirror modules folder:

cd ~/MagicMirror/modules

Clone the repository:

git clone https://github.com/Dresch360/MMM-DriveVideos.git

Make the setup script executable:

chmod +x MMM-DriveVideos/connect

---

## Configuration

Add this to your config.js:
```js
{
  module: "MMM-DriveVideos",
  position: "fullscreen_above",
  config: {
    driveRemote: "drive:mirror-videos",
    videoPath: "/home/pi/MagicMirror/modules/MMM-DriveVideos/public/videos",
    updateInterval: 2 * 60 * 1000,
    playMode: "linear",        // "linear" or "random"
    muted: true,               // true or false
    showArrows: true,          // show left/right navigation arrows
    arrowOpacity: 0.3,         // controls arrow visibility (0.0 to 1.0)
    arrowFontSize: 40,         // controls arrow size in pixels
    objectFit: "cover",        // "cover" or "contain"
    enableSwipe: true,         // enable swipe navigation
    enableTapPause: true       // tap to pause/resume playback
  }
},
```
---
## Configuration Options

| Option            | Description                                      | Default                 |
| ----------------- | ------------------------------------------------ | ----------------------- |
| `driveRemote`     | Google Drive folder to sync from                 | `"drive:mirror-videos"` |
| `updateInterval`  | How often to sync videos (ms)                    | `2 * 60 * 1000`         |
| `playMode`        | Playback order for videos                        | `"linear"`              |
| `muted`           | Start videos muted or with sound                 | `true`                  |
| `showArrows`      | Show or hide left/right navigation arrows        | `true`                  |
| `arrowOpacity`    | Controls arrow visibility (0.0 to 1.0)           | `0.3`                   |
| `arrowFontSize`   | Controls arrow size in pixels                    | `40`                    |
| `objectFit`       | Video fit mode (`"cover"` or `"contain"`)        | `"cover"`               |
---
### Playback Modes

- `linear` = plays videos in order  
- `random` = randomizes the next video  
- `cover` = fills screen (may crop)  
- `contain` = shows full video (may have borders)
  
## Setup (First Time)

1. Minimize MagicMirror  
   Press: Ctrl + m

2. Open Terminal

3. Run:

```bash

~/MagicMirror/modules/MMM-DriveVideos/connect

```

4. When prompted, type exactly:

- Use web browser? → y  
- Shared Drive? → n  

A browser window will open. Sign into your Google account and click Continue.

---

## Adding Videos

### Smartphone

1. Open the Google Drive app  
2. Open the folder: mirror-videos  
3. Tap + then Upload  
4. Select your videos  

Videos will appear automatically within a few minutes.

### Computer

1. Go to https://drive.google.com  
2. Open the folder: mirror-videos  
3. Drag and drop your videos  

---

## Notes

- The Google Drive folder mirror-videos is created automatically during setup  
- Folder name must be exactly mirror-videos in lowercase  
- Only MP4 files are supported  
- Recommended maximum resolution: 1080p  
- Videos autoplay  
- Playlist updates apply after the current video ends  
- Updates happen automatically about every 2 minutes  

---

## Reset

To remove videos and disconnect Google Drive:

```bash
rm -rf ~/MagicMirror/modules/MMM-DriveVideos/public/videos/*
rm -f ~/.config/rclone/rclone.conf
pm2 restart MagicMirror
```
 
---

## License

MIT License
