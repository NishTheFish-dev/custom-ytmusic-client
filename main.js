require('dotenv').config();
const { app, BrowserWindow, ipcMain, protocol, shell, session } = require('electron');
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
const Store = require('electron-store');
const http = require('http');
const isDev = process.env.NODE_ENV === 'development';
const { spawn } = require('child_process');

// Add electron path resolution
const pathFile = path.join(__dirname, 'path.txt');

function getElectronPath() {
    let executablePath;
    if (fs.existsSync(pathFile)) {
        executablePath = fs.readFileSync(pathFile, 'utf-8');
    }
    if (process.env.ELECTRON_OVERRIDE_DIST_PATH) {
        return path.join(process.env.ELECTRON_OVERRIDE_DIST_PATH, executablePath || 'electron');
    }
    if (executablePath) {
        return path.join(__dirname, 'dist', executablePath);
    } else {
        throw new Error('Electron failed to install correctly, please delete node_modules/electron and try installing again');
    }
}

// Add IPC handler for environment variables
ipcMain.handle('get-env', () => {
  // Only expose necessary environment variables
  return {
    NODE_ENV: process.env.NODE_ENV,
    ELECTRON: true
  };
});

const store = new Store({
  name: 'auth',
  encryptionKey: 'your-encryption-key'
});

// Create a separate store for playlists
const playlistStore = new Store({
  name: 'playlists',
  encryptionKey: 'your-encryption-key'
});

// Create a store for user preferences
const preferencesStore = new Store({
  name: 'preferences',
  encryptionKey: 'your-encryption-key',
  defaults: {
    windowBounds: {
      width: 1600,
      height: 1000
    },
    sidebarWidth: 240
  }
});

let mainWindow = null;
const OAUTH_PORT = 51732; // You can use any free port

// Initialize YouTube API
const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  `http://localhost:${OAUTH_PORT}`
);

const youtube = google.youtube('v3');

// Check for existing tokens
const tokens = store.get('tokens');
if (tokens) {
  oauth2Client.setCredentials(tokens);
}

// Helper: Start a local server to listen for the OAuth callback
function listenForAuthCode() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, `http://localhost:${OAUTH_PORT}`);
      const code = url.searchParams.get('code');
      if (code) {
        res.end('Authentication successful! You can close this window.');
        server.close();
        resolve(code);
      } else {
        res.end('No code found.');
      }
    });
    server.listen(OAUTH_PORT);
  });
}

// Helper: Ensure valid token (refresh if expired)
async function ensureValidToken() {
  const tokens = store.get('tokens');
  if (!tokens) return false;
  oauth2Client.setCredentials(tokens);

  // If token is expired or about to expire, refresh it
  if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      store.set('tokens', credentials);
      oauth2Client.setCredentials(credentials);
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      store.delete('tokens');
      return false;
    }
  }
  return true;
}

// IPC handler to start OAuth flow
ipcMain.handle('youtube:getAuthUrl', async () => {
  try {
    if (!process.env.YOUTUBE_CLIENT_ID || !process.env.YOUTUBE_CLIENT_SECRET) {
      throw new Error('YouTube API credentials are not configured. Please check your .env file.');
    }

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/youtube.force-ssl'
      ],
      prompt: 'consent',
      response_type: 'code',
      include_granted_scopes: true
    });

    // Dynamically import and use the open package
    const open = (await import('open')).default;
    await open(authUrl);

    // Wait for the code from the local server
    const code = await listenForAuthCode();
    
    // Get tokens directly
    const { tokens } = await oauth2Client.getToken(code);
    store.set('tokens', tokens);
    oauth2Client.setCredentials(tokens);
    
    // Get user info and cookies
    const youtube = google.youtube('v3');
    const response = await youtube.channels.list({
      auth: oauth2Client,
      part: 'snippet',
      mine: true
    });

    const userInfo = response.data.items[0].snippet;
    const user = {
      ...userInfo,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date
    };

    store.set('user', user);

    // Get YouTube cookies for play-dl
    const cookies = await window.electronAPI.youtube.getCookies();
    if (cookies) {
      process.env.YOUTUBE_COOKIE = cookies;
    }
    
    // Send the auth success event to the renderer
    if (mainWindow) {
      mainWindow.webContents.send('auth-success', { user, tokens });
    }
    
    return { user, tokens };
  } catch (error) {
    console.error('Error during OAuth:', error);
    throw new Error(`Failed to start authentication process: ${error.message}`);
  }
});

ipcMain.handle('youtube:getTokens', async (event, code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    store.set('tokens', tokens);
    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error);
    throw error;
  }
});

ipcMain.handle('youtube:searchVideos', async (event, { query, maxResults }) => {
  try {
    await ensureValidToken();
    const response = await youtube.search.list({
      auth: oauth2Client,
      part: 'snippet',
      q: query,
      maxResults,
      type: 'video',
      videoCategoryId: '10',
      fields: 'items(id/videoId,snippet(title,description,thumbnails(maxres,high,default),channelTitle))'
    });
    return response.data;
  } catch (error) {
    console.error('Error searching videos:', error);
    throw error;
  }
});

ipcMain.handle('youtube:getVideoDetails', async (event, videoId) => {
  try {
    await ensureValidToken();
    const response = await youtube.videos.list({
      auth: oauth2Client,
      part: 'snippet,contentDetails,statistics',
      id: videoId
    });
    return response.data;
  } catch (error) {
    console.error('Error getting video details:', error);
    throw error;
  }
});

ipcMain.handle('youtube:getUserPlaylists', async () => {
  try {
    await ensureValidToken();
    const response = await youtube.playlists.list({
      auth: oauth2Client,
      part: 'snippet,contentDetails',
      mine: true,
      maxResults: 50
    });
    return response.data;
  } catch (error) {
    console.error('Error getting user playlists:', error);
    throw error;
  }
});

ipcMain.handle('youtube:getPlaylistItems', async (event, playlistId, pageToken = null) => {
  try {
    await ensureValidToken();
    const response = await youtube.playlistItems.list({
      auth: oauth2Client,
      part: 'snippet,contentDetails',
      playlistId,
      maxResults: 50,
      pageToken: pageToken || undefined
    });
    return {
      items: Array.isArray(response.data.items) ? response.data.items : [],
      nextPageToken: response.data.nextPageToken || null,
      totalResults: response.data.pageInfo?.totalResults || 0,
      error: null
    };
  } catch (error) {
    console.error('Error getting playlist items:', error);
    return {
      items: [],
      nextPageToken: null,
      totalResults: 0,
      error: error.message || 'Unknown error occurred while fetching playlist items.'
    };
  }
});

ipcMain.handle('youtube:isAuthenticated', async () => {
  try {
    const result = await ensureValidToken();
    return result;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
});

// Fetch playlists the user has saved/subscribed to (not owned)
ipcMain.handle('youtube:getLibraryPlaylists', async () => {
  try {
    await ensureValidToken();
    const response = await youtube.subscriptions.list({
      auth: oauth2Client,
      part: 'snippet',
      mine: true,
      maxResults: 50
    });
    const playlistSubs = (response.data.items || []).filter(item => item.snippet.resourceId.kind === 'youtube#playlist');
    // For each, fetch playlist details in batch
    const ids = playlistSubs.map(item => item.snippet.resourceId.playlistId).join(',');
    if (!ids) return { items: [] };
    const plRes = await youtube.playlists.list({
      auth: oauth2Client,
      part: 'snippet,contentDetails',
      id: ids,
      maxResults: 50
    });
    return plRes.data;
  } catch (error) {
    console.error('Error fetching library playlists:', error);
    return { items: [] };
  }
});

// Fetch playlists the user has liked (thumbs-up on a playlist) – not directly supported by API, fallback to empty
ipcMain.handle('youtube:getLikedPlaylists', async () => {
  return { items: [] }; // TODO: implement when API allows
});

// Search playlists
ipcMain.handle('youtube:searchAll', async (event, arg1, arg2) => {
  let query;
  let maxResults = 25;
  if (arg1 && typeof arg1 === 'object') {
    query = arg1.query;
    maxResults = arg1.maxResults ?? 25;
  } else {
    query = arg1;
    if (typeof arg2 === 'number') maxResults = arg2;
  }
  try {
    await ensureValidToken();
    const response = await youtube.search.list({
      auth: oauth2Client,
      part: 'snippet',
      q: query,
      maxResults,
      type: 'video,playlist',
      fields: 'items(id(kind,videoId,playlistId),snippet(title,description,thumbnails(default,high,maxres),channelTitle))'
    });
    return response.data;
  } catch (error) {
    console.error('Error searching videos+playlists:', error);
    return { items: [] };
  }
});

ipcMain.handle('youtube:searchPlaylists', async (event, arg1, arg2) => {
  // Support both legacy positional args (query, maxResults) and object style {query, maxResults}
  let query;
  let maxResults = 15;
  if (arg1 && typeof arg1 === 'object') {
    query = arg1.query;
    maxResults = arg1.maxResults ?? 15;
  } else {
    query = arg1;
    if (typeof arg2 === 'number') maxResults = arg2;
  }
  try {
    await ensureValidToken();
    const response = await youtube.search.list({
      auth: oauth2Client,
      part: 'snippet',
      q: query,
      maxResults,
      type: 'playlist',
      fields: 'items(id/playlistId,snippet(title,description,thumbnails(maxres,high,default),channelTitle))'
    });
    return response.data;
  } catch (error) {
    console.error('Error searching playlists:', error);
    return { items: [] };
  }
});

// Auth IPC handlers
ipcMain.handle('auth:getStoredUser', async () => {
  try {
    const user = store.get('user');
    return user || null;
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
});

ipcMain.handle('auth:login', async () => {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.force-ssl',
        'https://www.googleapis.com/auth/youtube.readonly'
      ]
    });

    const open = (await import('open')).default;
    await open(authUrl);

    const code = await listenForAuthCode();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const youtube = google.youtube('v3');
    const response = await youtube.channels.list({
      auth: oauth2Client,
      part: 'snippet',
      mine: true
    });

    const userInfo = response.data.items[0].snippet;
    const user = {
      ...userInfo,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date
    };

    store.set('user', user);
    store.set('tokens', tokens);

    // Send the auth success event to the renderer
    if (mainWindow) {
      mainWindow.webContents.send('auth-success', { user, tokens });
    }

    return user;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
});

ipcMain.handle('auth:logout', async () => {
  try {
    const user = store.get('user');
    if (user?.accessToken) {
      await oauth2Client.revokeToken(user.accessToken);
    }
    store.delete('user');
    store.delete('tokens');
    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    return false;
  }
});

ipcMain.handle('auth:refreshAccessToken', async () => {
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    const user = store.get('user');
    const updatedUser = {
      ...user,
      accessToken: credentials.access_token,
      expiryDate: credentials.expiry_date
    };
    store.set('user', updatedUser);
    return updatedUser;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
});

ipcMain.handle('auth:getUserInfo', async () => {
  try {
    const youtube = google.youtube('v3');
    const response = await youtube.channels.list({
      auth: oauth2Client,
      part: 'snippet',
      mine: true
    });
    return response.data.items[0].snippet;
  } catch (error) {
    console.error('Error getting user info:', error);
    throw error;
  }
});

// Playlist IPC handlers
ipcMain.handle('playlist:getStoredPlaylists', async () => {
  try {
    const playlists = playlistStore.get('playlists');
    return playlists || [];
  } catch (error) {
    console.error('Error getting stored playlists:', error);
    return [];
  }
});

ipcMain.handle('playlist:savePlaylists', async (event, playlists) => {
  try {
    playlistStore.set('playlists', playlists);
    return true;
  } catch (error) {
    console.error('Error saving playlists:', error);
    return false;
  }
});

ipcMain.handle('playlist:create', async (event, { name, description, isPrivate }) => {
  try {
    const response = await youtube.playlists.insert({
      auth: oauth2Client,
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title: name,
          description: description
        },
        status: {
          privacyStatus: isPrivate ? 'private' : 'public'
        }
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating playlist:', error);
    throw error;
  }
});

ipcMain.handle('playlist:delete', async (event, playlistId) => {
  try {
    await youtube.playlists.delete({
      auth: oauth2Client,
      id: playlistId
    });
    return true;
  } catch (error) {
    console.error('Error deleting playlist:', error);
    throw error;
  }
});

ipcMain.handle('playlist:addTrack', async (event, { playlistId, trackId }) => {
  try {
    const response = await youtube.playlistItems.insert({
      auth: oauth2Client,
      part: 'snippet',
      requestBody: {
        snippet: {
          playlistId: playlistId,
          resourceId: {
            kind: 'youtube#video',
            videoId: trackId
          }
        }
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding track to playlist:', error);
    throw error;
  }
});

ipcMain.handle('playlist:removeTrack', async (event, { playlistId, trackId }) => {
  try {
    // First, get the playlist item ID
    const response = await youtube.playlistItems.list({
      auth: oauth2Client,
      part: 'id',
      playlistId: playlistId,
      videoId: trackId
    });

    if (response.data.items.length > 0) {
      await youtube.playlistItems.delete({
        auth: oauth2Client,
        id: response.data.items[0].id
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error removing track from playlist:', error);
    throw error;
  }
});

ipcMain.handle('playlist:update', async (event, { playlistId, name, description, isPrivate }) => {
  try {
    const response = await youtube.playlists.update({
      auth: oauth2Client,
      part: 'snippet,status',
      requestBody: {
        id: playlistId,
        snippet: {
          title: name,
          description: description
        },
        status: {
          privacyStatus: isPrivate ? 'private' : 'public'
        }
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating playlist:', error);
    throw error;
  }
});

ipcMain.handle('playlist:reorder', async (event, { playlistId, trackIds }) => {
  try {
    // Get current playlist items
    const response = await youtube.playlistItems.list({
      auth: oauth2Client,
      part: 'id,snippet',
      playlistId: playlistId,
      maxResults: 50
    });

    const items = response.data.items;
    const updates = [];

    // Update positions for each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const newPosition = trackIds.indexOf(item.snippet.resourceId.videoId);
      if (newPosition !== -1) {
        updates.push(
          youtube.playlistItems.update({
            auth: oauth2Client,
            part: 'snippet',
            requestBody: {
              id: item.id,
              snippet: {
                playlistId: playlistId,
                resourceId: {
                  kind: 'youtube#video',
                  videoId: item.snippet.resourceId.videoId
                },
                position: newPosition
              }
            }
          })
        );
      }
    }

    // Execute all updates
    await Promise.all(updates);
    return true;
  } catch (error) {
    console.error('Error reordering playlist:', error);
    throw error;
  }
});

// Add cookie handling
ipcMain.handle('youtube:getCookies', async () => {
  try {
    const cookies = await session.defaultSession.cookies.get({
      domain: '.youtube.com'
    });
    
    // Format cookies for play-dl
    const cookieString = cookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');
    
    // Update environment variable
    process.env.YOUTUBE_COOKIE = cookieString;
    
    return cookieString;
  } catch (error) {
    console.error('Error getting cookies:', error);
    return null;
  }
});

async function createWindow() {
  const preloadPath = isDev 
    ? path.join(__dirname, 'preload.js')
    : path.join(process.resourcesPath, 'preload.js');

  // Get saved window bounds or use defaults
  const savedPreferences = preferencesStore.get('preferences') || preferencesStore.store;
  const { windowBounds, sidebarWidth } = savedPreferences;
  
  // Determine icon path for window/taskbar
  const iconPath = isDev
    ? path.join(__dirname, 'public', 'images', 'youtube-music-icon.ico')
    : path.join(process.resourcesPath, 'images', 'youtube-music-icon.ico');

  mainWindow = new BrowserWindow({
    width: windowBounds.width,
    height: windowBounds.height,
    minWidth: 1400,
    minHeight: 800,
    icon: iconPath,
    frame: true, // Keep the title bar
    titleBarStyle: 'hidden', // Hide the default title bar but keep window controls
    titleBarOverlay: {
      color: '#121212', // Match the app's background color
      symbolColor: '#ffffff' // Color of the window controls (minimize, maximize, close)
    },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      sandbox: true,
      preload: preloadPath,
      enableRemoteModule: false
    },
    backgroundColor: '#121212', // Match the app's background color
    show: false
  });

  // Save window bounds when window is resized
  mainWindow.on('resize', () => {
    const bounds = mainWindow.getBounds();
    preferencesStore.set('preferences.windowBounds', bounds);
  });

  // Log the preload script path for debugging
  console.log('Preload script path:', preloadPath);

  if (isDev) {
    mainWindow.loadURL('http://localhost:3001');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Register custom protocol
app.whenReady().then(async () => {
  protocol.registerHttpProtocol('ytmusic', (request) => {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    
    if (code && mainWindow) {
      mainWindow.webContents.send('oauth-callback', code);
    }
  });

  await createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Handle any uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Add IPC handlers for preferences
ipcMain.handle('preferences:get', () => {
  return preferencesStore.get('preferences') || preferencesStore.store;
});

ipcMain.handle('preferences:set', (event, preferences) => {
  preferencesStore.set('preferences', preferences);
  return true;
}); 