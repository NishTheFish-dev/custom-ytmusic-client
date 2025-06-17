# YouTube Music Desktop Client

An unofficial custom desktop client for YouTube Music built with React.js and Electron. Built from the ground up, this project aims to bring the experience of the mobile UI of YouTube Music to a desktop application, allowing for users to enjoy YouTube Music to its fullest.

## Current Features

- Seamless YouTube account authentication and high-quality playback via hidden YouTube IFrame
- PlayerBar with play/pause, previous/next, seek slider, volume control, and queue panel
- Playlist browsing with virtualised track list for smooth scrolling of large playlists
- Dynamic up-next queue: double-click or play any track and the remainder auto-queues
- Global search (songs, videos, artists) with immediate playback and queue support
- Dark-themed, responsive UI built with MUI + React

## Planned Features

- Discord Rich Presence – show track title, artist, progress in status
- Download / cache tracks for offline listening
- Equalizer & audio effects panel
- Light theme & theme switcher
- Lyrics fetcher (YT captions / external services)
- Settings window with hot-key customisation

## Version History

| Version | Date       | Highlights |
|---------|------------|------------|
| v0.2.4  | 2025-06-16 | • Draggable top bar for window movement  <br>• Minor UI refinements across player and lists  <br>• General bug-fixes and stability improvements |
| v0.2.3  | 2025-06-14 | • New authentication screen with "Sign in with YouTube" button  <br>• Personalized home screen welcomes you by Google username  <br>• Auto-loads stored user info on app start & robust username fetch  |
| v0.2.2  | 2025-06-14 | • Added responsive title truncation based on queue state  <br>• Fixed playlist scroll area to extend fully to bottom player bar  <br>• Added consistent bottom padding across all scrollable areas  <br>• Improved layout behavior when queue is toggled  <br>• Slight bugfix for removing invisible buttons from songs in queue |
| v0.2.1  | 2025-06-14 | • Added play & overflow controls to search results  <br>• Fixed duration/progress not updating when playing from search  <br>• Instant UI reset when switching tracks |
| v0.2.0  | 2025-06-14 | Initial search feature: query typing, result list, playback, queue building |
| v0.1.2  | 2025-06-13 | Minor UI polish, better error handling |
| v0.1.1  | 2025-06-13 | Bug-fixes: progress slider desync, HTML entity decoding |
| v0.1.0  | 2025-06-12 | Core song playback, PlayerBar, playlists & queue |
| v0.0.0  | 2025-06-10 | Project scaffold: Electron + React + Vite setup |
