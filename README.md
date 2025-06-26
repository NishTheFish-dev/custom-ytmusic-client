# YouTube Music Desktop Client

An unofficial custom desktop client for YouTube Music built with React.js and Electron. Built from the ground up, this project aims to bring the experience of the mobile UI of YouTube Music to a desktop application, allowing for users to enjoy YouTube Music to its fullest.

## Features

- Seamless YouTube account authentication and high-quality playback via hidden YouTube IFrame
- PlayerBar with play/pause, previous/next, seek slider, volume control, and queue panel
- Playlist browsing with virtualised track list for smooth scrolling of large playlists
- Dynamic up-next queue: double-click or play any track and the remainder auto-queues
- Global search (songs, videos, artists) with immediate playback and queue support
- Dark-themed, responsive UI built with MUI + React
- Settings window with hot-key customisation

## Version History

| Version | Date       | Highlights |
|---------|------------|------------|
| v0.3.3  | 2025-06-24 | • Custom desktop taskbar icon and window icon that replaces the default Electron icon  <br>• Settings icon is now functional with the keybinds settings being the only working tab for now  <br>• Keyboard shortcuts added which now control most of the playback features |
| v0.3.2  | 2025-06-24 | • Unified video & playlist search, with songs first and playlists second  <br>• Search results clearly distinguish playlists vs songs with tags & icons  <br>• Playlist play button queues full playlist; dynamic track-count header  <br>• Added Back & Forward navigation buttons with history stack  <br>• Misc UI tweaks, bug fixes, and code cleanup |
| v0.3.1  | 2025-06-23 | • Playlist track list performance & pagination improvements  <br>• Skeleton placeholders only during fast scrolling  <br>• Fixed black-screen crash when opening playlists  <br>• Clickable duration toggles remaining time  <br>• Misc layout tweaks & code cleanup   <br>• Fixed some bugs with the player bar buttons|
| v0.3.0  | 2025-06-23 | • Complete UI rewrite across components, as well as making new files for each component  <br>• Enforced minimum application window size (1200×800)  <br>• Equal-height playlist, content & queue cards  <br>• Tighter spacing and structural refinements |
| v0.2.4  | 2025-06-16 | • Draggable top bar for window movement  <br>• Minor UI refinements across player and lists  <br>• General bug-fixes and stability improvements |
| v0.2.3  | 2025-06-14 | • New authentication screen with "Sign in with YouTube" button  <br>• Personalized home screen welcomes you by Google username  <br>• Auto-loads stored user info on app start & robust username fetch  |
| v0.2.2  | 2025-06-14 | • Added responsive title truncation based on queue state  <br>• Fixed playlist scroll area to extend fully to bottom player bar  <br>• Added consistent bottom padding across all scrollable areas  <br>• Improved layout behavior when queue is toggled  <br>• Slight bugfix for removing invisible buttons from songs in queue |
| v0.2.1  | 2025-06-14 | • Added play & overflow controls to search results  <br>• Fixed duration/progress not updating when playing from search  <br>• Instant UI reset when switching tracks |
| v0.2.0  | 2025-06-14 | Initial search feature: query typing, result list, playback, queue building |
| v0.1.2  | 2025-06-13 | Minor UI polish, better error handling |
| v0.1.1  | 2025-06-13 | Bug-fixes: progress slider desync, HTML entity decoding |
| v0.1.0  | 2025-06-12 | Core song playback, PlayerBar, playlists & queue |
| v0.0.0  | 2025-06-10 | Project scaffold: Electron + React + Vite setup |
