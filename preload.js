const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    ipcRenderer: {
      invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
      on: (channel, callback) => {
        ipcRenderer.on(channel, callback);
      },
      removeListener: (channel, callback) => {
        ipcRenderer.removeListener(channel, callback);
      }
    },
    // Audio API
    play: (track) => ipcRenderer.invoke('audio:play', track),
    pause: () => ipcRenderer.invoke('audio:pause'),
    resume: () => ipcRenderer.invoke('audio:resume'),
    stop: () => ipcRenderer.invoke('audio:stop'),
    setVolume: (volume) => ipcRenderer.invoke('audio:setVolume', volume),
    getCurrentTime: () => ipcRenderer.invoke('audio:getCurrentTime'),
    
    // Audio event listeners
    onFileReady: (callback) => {
      ipcRenderer.on('audio:fileReady', (_, data) => callback(data));
      return () => ipcRenderer.removeListener('audio:fileReady', callback);
    },
    onPaused: (callback) => {
      ipcRenderer.on('audio:paused', () => callback());
      return () => ipcRenderer.removeListener('audio:paused', callback);
    },
    onResumed: (callback) => {
      ipcRenderer.on('audio:resumed', () => callback());
      return () => ipcRenderer.removeListener('audio:resumed', callback);
    },
    onVolumeChanged: (callback) => {
      ipcRenderer.on('audio:volumeChanged', (_, data) => callback(data));
      return () => ipcRenderer.removeListener('audio:volumeChanged', callback);
    },
    onProgress: (callback) => {
      ipcRenderer.on('audio:progress', (_, progress) => callback(progress));
      return () => ipcRenderer.removeListener('audio:progress', callback);
    },
    onError: (callback) => {
      ipcRenderer.on('audio:error', (_, error) => callback(error));
      return () => ipcRenderer.removeListener('audio:error', callback);
    },
    onStopped: (callback) => {
      ipcRenderer.on('audio:stopped', () => callback());
      return () => ipcRenderer.removeListener('audio:stopped', callback);
    }
  }
);

// Expose YouTube API functionality
contextBridge.exposeInMainWorld(
  'electronAPI',
  {
    youtube: {
      getAuthUrl: () => ipcRenderer.invoke('youtube:getAuthUrl'),
      getTokens: (code) => ipcRenderer.invoke('youtube:getTokens', code),
      searchVideos: (query, maxResults) => ipcRenderer.invoke('youtube:searchVideos', { query, maxResults }),
      getVideoDetails: (videoId) => ipcRenderer.invoke('youtube:getVideoDetails', videoId),
      getUserPlaylists: () => ipcRenderer.invoke('youtube:getUserPlaylists'),
      getPlaylistItems: (playlistId, pageToken) => ipcRenderer.invoke('youtube:getPlaylistItems', playlistId, pageToken),
      isAuthenticated: () => ipcRenderer.invoke('youtube:isAuthenticated'),
      getCookies: () => ipcRenderer.invoke('youtube:getCookies')
    },
    auth: {
      getStoredUser: () => ipcRenderer.invoke('auth:getStoredUser'),
      login: () => ipcRenderer.invoke('auth:login'),
      logout: () => ipcRenderer.invoke('auth:logout'),
      refreshAccessToken: () => ipcRenderer.invoke('auth:refreshAccessToken'),
      getUserInfo: () => ipcRenderer.invoke('auth:getUserInfo')
    },
    playlist: {
      getStoredPlaylists: () => ipcRenderer.invoke('playlist:getStoredPlaylists'),
      savePlaylists: (playlists) => ipcRenderer.invoke('playlist:savePlaylists', playlists),
      createPlaylist: (name, description, isPrivate) => ipcRenderer.invoke('playlist:create', { name, description, isPrivate }),
      deletePlaylist: (playlistId) => ipcRenderer.invoke('playlist:delete', playlistId),
      addToPlaylist: (playlistId, trackId) => ipcRenderer.invoke('playlist:addTrack', { playlistId, trackId }),
      removeFromPlaylist: (playlistId, trackId) => ipcRenderer.invoke('playlist:removeTrack', { playlistId, trackId }),
      updatePlaylist: (playlistId, details) => ipcRenderer.invoke('playlist:update', { playlistId, ...details }),
      reorderPlaylist: (playlistId, trackIds) => ipcRenderer.invoke('playlist:reorder', { playlistId, trackIds })
    },
    onOAuthCallback: (callback) => {
      ipcRenderer.on('oauth-callback', callback);
    },
    removeOAuthCallback: (callback) => {
      ipcRenderer.removeListener('oauth-callback', callback);
    },
    onAuthSuccess: (callback) => {
      ipcRenderer.on('auth-success', callback);
    },
    removeAuthSuccess: (callback) => {
      ipcRenderer.removeListener('auth-success', callback);
    },
    getEnv: () => ipcRenderer.invoke('get-env'),
    preferences: {
      get: () => ipcRenderer.invoke('preferences:get'),
      set: (preferences) => ipcRenderer.invoke('preferences:set', preferences)
    }
  }
); 