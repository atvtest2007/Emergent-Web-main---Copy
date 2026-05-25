# Maxx Player — Product Requirements (PRD)

## Original Problem Statement
Build "Maxx Player": a premium cross-platform OTT/IPTV streaming player inspired by Netflix, Tivimate, OTT Navigator, VLC, MX Player, Kodi. Required: Xtream login, M3U playlist, multi-player switching, advanced player controls (subs/audio/PiP/cast/speed/aspect/brightness), Live TV, Movies, Series, VOD, EPG, OTT metadata, favorites/history/watch-progress, trailer support, search, settings panel, premium glassmorphic OTT UI.

## Architecture (web-based delivery, since Electron/native bridges aren't viable in browser)
- React 19 + Tailwind + shadcn/ui (frontend)
- FastAPI + Motor (Mongo) (backend)
- HLS.js + Video.js + Native HTML5 (player engines)
- Outfit / Manrope fonts; crimson #E50914 accent on cinematic dark theme

## Personas
- IPTV power user with their own Xtream account
- Casual user testing with the bundled demo library
- Cord-cutter seeking a unified player for M3U playlists

## Implemented (v1 — 2026-02)
- Xtream login (server validated, credentials saved per-playlist)
- M3U playlist (URL or file upload, parsed server-side)
- Demo Library (8 channels, 8 movies, 4 series with public HLS streams)
- Live TV grid with category filters + search
- Movies catalog + details page with backdrop, metadata, favorite, play
- Series catalog + details with seasons, episodes (with progress bars)
- VOD catalog
- EPG grid (sticky timeline + now line + program tooltips)
- Custom Video Player (HLS.js / Video.js / Native engine switcher, auto-fallback)
  - Play/Pause, Seek ±10s, volume, mute, fullscreen, PiP, casting attempt
  - Subtitles toggle, audio track toggle, quality (auto + HLS levels)
  - Playback speed (0.5×–2×), aspect ratio, brightness, dropdown settings
  - Keyboard shortcuts (Space/k, ←/→, ↑/↓, m, f, p)
- Watch page with resume position + auto-save progress every 5s
- Favorites (add/remove + by-type sections)
- Continue Watching / History (with delete entries)
- Global search (live + movies + series) with voice search (where supported)
- Settings panel (Playback / Decoder / Subtitle / Audio / Network / Cache / Interface / Accounts / Privacy)
- Glass sidebar nav + mobile bottom tab bar
- Stream proxy endpoint for CORS-blocked manifests

## Deferred / Future
- Native ExoPlayer / VLC / MX Player bridges (require Electron/Android wrapper)
- DLNA / AirPlay (web platform limitation)
- Hardware FFmpeg decode (web limitation)
- Real Chromecast SDK integration (currently uses Remote Playback API)
- TMDB metadata enrichment (would need API key)
- Multi-profile + PIN lock + Kids mode (single local profile currently)
- Audio equalizer, surround output, audio sync delay UI
- Catch-up TV, EPG reminders, advanced recording
- Sleep timer
- True virtualized lists for >10k playlists

## Next Action Items
- Add TMDB integration for richer movie metadata
- Multi-profile support + PIN lock
- Improved EPG with multi-day timeline
- Sleep timer + reminders
