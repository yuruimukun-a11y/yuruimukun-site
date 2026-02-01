# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ゆるいむくん Music Streaming Site - a music streaming web application for HLS (HTTP Live Streaming) audio delivery. The site serves 30+ original tracks across multiple genres with play count analytics.

**Live site:** https://yuruimukun.com

## Commands

```bash
# Start local development server (port 3000)
npm start

# Convert WAV to HLS format
ffmpeg -y -i "input.wav" -c:a aac -b:a 256k -ar 48000 -ac 2 \
  -f hls -hls_time 10 -hls_list_size 0 \
  -hls_segment_filename "output/segment_%03d.ts" \
  -hls_playlist_type vod "output/playlist.m3u8"

# Upload to Cloudflare R2
wrangler r2 object put "yuruimukun-music/songname/playlist.m3u8" --file "playlist.m3u8" --remote
wrangler r2 object put "yuruimukun-music/songname/segment_000.ts" --file "segment_000.ts" --remote
```

## Architecture

### Technology Stack
- **Frontend:** Vanilla JavaScript (ES5), HTML5, CSS3
- **Audio Streaming:** HLS.js (CDN)
- **Analytics:** Firebase Realtime Database (play counts)
- **Music CDN:** Cloudflare R2
- **Deployment:** Vercel (static site, zero build step)
- **No npm dependencies** - uses CDN for external libraries

### Key Files
- `js/player.js` - Core player logic (IIFE pattern), playlist data, HLS management, genre filtering
- `css/style.css` - Main styles with CSS custom properties (pink theme)
- `server/server.js` - Local dev server with CORS, range requests, play count API
- `index.html` - Main player page with embedded Firebase config
- `public/tracks/*.html` - Individual track description pages (dark/green theme)

### Audio Delivery
- Format: HLS with AAC codec (256kbps, 48kHz stereo)
- Segment length: 10 seconds
- Storage: Cloudflare R2 bucket `yuruimukun-music`
- Public URL: `https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/`

### Player Architecture
The player uses an IIFE pattern with centralized state management:
- `PLAYLIST` array contains all track metadata with R2 URLs
- Genre filtering with collapsible UI (vocal/instrument sections)
- Shuffle uses Fisher-Yates algorithm with index mapping
- Play count sends once per track load (`hasCountedPlay` flag)
- Media Session API for OS lock screen controls

### Firebase Integration
- Project: `yuruimukun-bb86c` (asia-southeast1)
- Data structure: `playCounts/{trackId}` and `dailyLogs/{date}/{trackId}`
- Security: Write-only (`.write: true`, `.read: false`)
- Function: `window.firebasePlayCount(trackId)` exposed globally

## Adding New Songs

1. Place WAV in `wav_input/[genre]/[songname].wav`
2. Convert to HLS using ffmpeg command above
3. Add entry to `PLAYLIST` array in `js/player.js`:
   ```javascript
   {
     id: 'songname',
     title: '曲名',
     artist: 'ゆるいむくん',
     genre: 'genre-name',
     description: '説明文',
     src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/songname/playlist.m3u8'
   }
   ```
4. Upload all HLS files to R2
5. Commit and push (Vercel auto-deploys)

## Track Pages

Individual track pages in `public/tracks/` use a different theme (dark/green) for AdSense compliance. Each page should have 500-800 characters of content. Template: `public/tracks/ninja.html`

## Git Ignored Files
- `wav_input/` - Source WAV files
- `music/` - Local HLS files (R2 is source of truth)
- `*-manual.md` - Operation manuals
- `SITE_STRUCTURE.md` - Architecture docs
