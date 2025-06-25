import React, { useEffect, useState } from 'react';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/* Internal imports */
import AuthComponent from './components/Auth/AuthComponent';
import GlobalControls from './components/GlobalControls';
import PlaylistCard from './components/Layout/PlaylistCard';
import ContentCard from './components/Layout/ContentCard';
import QueueCard from './components/Layout/QueueCard';
import MainLayout from './components/Layout/MainLayout';
import Playlists from './components/Playlists/Playlists';
import SettingsModal from './components/SettingsModal';
import { playlistService } from './services/playlistService';
import PlaylistTracks from './components/Playlists/PlaylistTracks';
import SearchResults from './components/Search/SearchResults';
import { authService } from './services/authService';
import { youtubeApi } from './services/youtubeApi';
import { searchService } from './services/searchService';
import { useAudio } from './context/AudioContext';

import './index.css';

/* Theme */
const darkTheme = createTheme({
  typography: {
    fontFamily: ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(',')
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff0000'
    },
    background: {
      default: '#121212',
      paper: '#181818'
    }
  }
});

function App() {
  /* Context */
  const { currentTrack, queue, playTrack, setQueue, setFullPlaylist, shuffle } = useAudio();

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  /* State */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('home');
  const [history, setHistory] = useState([{ view: 'home' }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showQueue, setShowQueue] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  /* Effects */
  useEffect(() => {
    const initialise = async () => {
      try {
        const authStatus = await youtubeApi.isAuthenticated();
        setIsAuthenticated(authStatus);
      } finally {
        setIsLoading(false);
      }
    };
    initialise();
  }, []);

  /* Fetch username when already authenticated */
  useEffect(() => {
    if (isAuthenticated && !googleUser) {
      const stored = authService.getUser();
      if (stored) {
        setGoogleUser(
          stored.name || stored.displayName || stored.given_name || stored.email || null
        );
      } else {
        authService
          .getUserInfo()
          .then(info =>
            setGoogleUser(info?.name || info?.displayName || info?.given_name || info?.email || null)
          )
          .catch(() => {});
      }
    }
  }, [isAuthenticated, googleUser]);

  /* Handlers */
  const handleAuthSuccess = async () => {
    setIsAuthenticated(true);
    try {
      const info = await authService.getUserInfo();
      setGoogleUser(info?.name || info?.displayName || null);
    } catch (_) {}
  };

  const pushHistory = (entry) => {
    setHistory(prev => {
      const truncated = prev.slice(0, historyIndex + 1);
      return [...truncated, entry];
    });
    setHistoryIndex(prev => prev + 1);
  };

  const handleSidebarPlaylistClick = playlist => {
    pushHistory({ view: 'playlist', playlist });
    setCurrentView('playlist');
    setSelectedPlaylist(playlist);
  };

  const handleSearch = async query => {
    setSearchQuery(query);
    if (!query || query.trim().length === 0) {
      pushHistory({ view: 'home' });
      setCurrentView('home');
      return;
    }
    try {
      const results = await searchService.search(query);
      setSearchResults(results);
      pushHistory({ view: 'search', query, results });
      setCurrentView('search');
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleHomeClick = () => {
    pushHistory({ view: 'home' });
    setCurrentView('home');
    setSelectedPlaylist(null);
  };

  const handleToggleQueue = () => setShowQueue(prev => !prev);
  const handleToggleSettings = () => setShowSettings(prev => !prev);

  // Play entire playlist starting from first track
  const handlePlaylistPlay = async (playlist) => {
    if (!playlist?.id) return;
    try {
      const tracks = await playlistService.getPlaylistItems(playlist.id);
      if (!tracks || tracks.length === 0) return;
      // Store full playlist for shuffle reference etc.
      setFullPlaylist(tracks);
      // Play first track
      playTrack(tracks[0]);
      // Build queue with remaining tracks
      let rest = tracks.slice(1);
      if (shuffle) {
        rest = [...rest];
        for (let i = rest.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [rest[i], rest[j]] = [rest[j], rest[i]];
        }
      }
      setQueue(rest);

    } catch (err) {
      console.error('Failed to play playlist:', err);
    }
  };

  /* Render helpers */
  const handleBack = () => {
    if (historyIndex === 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    const entry = history[newIndex];
    applyHistoryEntry(entry);
  };

  const handleForward = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    const entry = history[newIndex];
    applyHistoryEntry(entry);
  };

  const applyHistoryEntry = (entry) => {
    switch (entry.view) {
      case 'home':
        setCurrentView('home');
        setSelectedPlaylist(null);
        break;
      case 'search':
        setCurrentView('search');
        setSearchQuery(entry.query || '');
        setSearchResults(entry.results || []);
        break;
      case 'playlist':
        setCurrentView('playlist');
        setSelectedPlaylist(entry.playlist || null);
        break;
      case 'library':
        setCurrentView('library');
        break;
      default:
        break;
    }
  };

  const renderCenterContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <Box sx={{ p: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {`Welcome${googleUser ? ', ' + googleUser : ''}`}
            </Typography>
          </Box>
        );
      case 'search':
        return (
          <SearchResults
            results={searchResults}
            query={searchQuery}
            isQueueOpen={showQueue}
            onPlaylistClick={handleSidebarPlaylistClick}
          />
        );
      case 'library':
        return <Playlists onPlaylistClick={handleSidebarPlaylistClick} />;
      case 'playlist':
        return selectedPlaylist ? (
          <PlaylistTracks playlist={selectedPlaylist} isQueueOpen={showQueue} />
        ) : null;
      default:
        return null;
    }
  };

  /* Loading screen */
  if (isLoading) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#121212'
          }}
        >
          <Typography variant="h6" sx={{ color: '#fff' }}>
            Loading...
          </Typography>
        </Box>
            <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </ThemeProvider>
    );
  }

  /* Main App UI */
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {!isAuthenticated ? (
        <AuthComponent onAuthSuccess={handleAuthSuccess} />
      ) : (
        <Box className="app-container">
          {/* Top bar */}
          <Box className="global-controls-wrapper">
            <GlobalControls
              onSettingsClick={handleToggleSettings}
              onHomeClick={handleHomeClick}
              onSearch={handleSearch}
              onToggleQueue={handleToggleQueue}
              onNavigateBack={handleBack}
              onNavigateForward={handleForward}
              canGoBack={historyIndex > 0}
              canGoForward={historyIndex < history.length - 1}
            />
          </Box>

          {/* Three-column layout between top and bottom */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              overflow: 'hidden',
              mt: 'var(--topbar-height)', // ensure aligns when GlobalControls is fixed; adjust if not fixed
              mb: 'var(--player-height)'
            }}
          >
            <MainLayout
              left={<PlaylistCard onPlaylistSelect={handleSidebarPlaylistClick} onPlayClick={handlePlaylistPlay} />}
              center={<ContentCard>{renderCenterContent()}</ContentCard>}
              right={<QueueCard queue={queue} currentTrack={currentTrack} />}
              isQueueOpen={showQueue}
            />
          </Box>
        </Box>
      )}
          <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </ThemeProvider>
  );
}

export default App;
