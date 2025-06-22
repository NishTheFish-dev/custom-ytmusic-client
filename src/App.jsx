import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AuthComponent from './components/Auth/AuthComponent';
import { authService } from './services/authService';
import Sidebar from './components/Layout/Sidebar';
import GlobalControls from './components/GlobalControls';
import QueuePanel from './components/Queue/QueuePanel';
import Playlists from './components/Playlists/Playlists';
import PlaylistTracks from './components/Playlists/PlaylistTracks';
// (Removed PlayerBar import – now handled by GlobalControls) from './components/Player/PlayerBar';
import { useAudio } from './context/AudioContext';
import { youtubeApi } from './services/youtubeApi';
import './index.css';
import AutoSizer from 'react-virtualized-auto-sizer';
import SearchResults from './components/Search/SearchResults';
import { searchService } from './services/searchService';

const darkTheme = createTheme({
  typography: {
    fontFamily: ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff0000'
    },
    background: {
      default: '#121212',
      paper: '#181818',
    },
  },
});

function App() {
  const { currentTrack, queue } = useAudio();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  // currentTrack handled by AudioContext
  const [showQueue, setShowQueue] = useState(true);
  // queue handled by AudioContext
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [googleUser, setGoogleUser] = useState(null);

  // Ensure username is loaded when app initializes and user already authenticated
  useEffect(() => {
    if (isAuthenticated && !googleUser) {
      const stored = authService.getUser();
      if (stored) {
        setGoogleUser(stored.name || stored.displayName || stored.given_name || stored.email || null);
      } else {
        authService.getUserInfo()
          .then(info => setGoogleUser(info?.name || info?.displayName || info?.given_name || info?.email || null))
          .catch(() => {});
      }
    }
  }, [isAuthenticated, googleUser]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await youtubeApi.isAuthenticated();
        setIsAuthenticated(authStatus);
      } catch (error) {

      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleAuthSuccess = async () => {
    setIsAuthenticated(true);
    try {
      const info = await authService.getUserInfo();
      setGoogleUser(info?.name || info?.displayName || null);
    } catch (e) {

    }
  };

  const handleSidebarPlaylistClick = (playlist) => {
    setCurrentView('playlist');
    setSelectedPlaylist(playlist);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query || query.trim().length === 0) {
      setCurrentView('home');
      return;
    }
    try {
      const results = await searchService.search(query);
      setSearchResults(results);
      setCurrentView('search');
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleHomeClick = () => {
    setCurrentView('home');
    setSelectedPlaylist(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <Box sx={{ p: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {`Welcome${googleUser ? ", " + googleUser : ""}`}
            </Typography>
          </Box>
        );
      case 'search':
        return <SearchResults results={searchResults} query={searchQuery} isQueueOpen={showQueue} />;
      case 'library':
        return <Playlists onPlaylistClick={handleSidebarPlaylistClick} />;
      case 'playlist':
        return selectedPlaylist ? (
          <PlaylistTracks
            playlist={selectedPlaylist}
            isQueueOpen={showQueue}
          />
        ) : null;
      default:
        return (
          <Box sx={{ p: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {`Welcome${googleUser ? ", " + googleUser : ""}`}
            </Typography>
          </Box>
        );
    }
  };

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
            backgroundColor: '#121212',
          }}
        >
          <Typography variant="h6" sx={{ color: '#fff' }}>
            Loading...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  const handleToggleQueue = () => setShowQueue(prev => !prev);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className="app-container">
        {!isAuthenticated ? (
          <AuthComponent onAuthSuccess={handleAuthSuccess} />
        ) : (
          <>
            <div className="app-layout">
              <Sidebar
                currentView={currentView}
                setCurrentView={setCurrentView}
                onPlaylistClick={handleSidebarPlaylistClick}
                sidebarWidth={sidebarWidth}
                onWidthChange={setSidebarWidth}
              />
              <div className="main-content">
                <div className="global-controls-wrapper">
                  <GlobalControls onHomeClick={handleHomeClick} onSearch={handleSearch} onToggleQueue={handleToggleQueue} />
                </div>
                <div className="content">
                  {renderContent()}
                </div>
              </div>
            </div>

            <Box sx={{
              position: 'fixed',
              top: 'var(--topbar-height)',
              right: showQueue ? 0 : 'var(--queue-width, 0px)',
              bottom: 'var(--player-height, 0px)',
              width: 'var(--queue-width, 0px)',
              zIndex: 900,
              backgroundColor: 'var(--background-base)',
              borderLeft: 'none',
              overflowY: 'auto',
              visibility: showQueue ? 'visible' : 'hidden'
            }}>
              {showQueue && (
                <QueuePanel
                  queue={queue}
                  currentTrack={currentTrack}
                  onTrackClick={() => {}}
                  onTrackPlay={() => {}}
                  onTrackRemove={() => {}}
                />
              )}
            </Box>
          </>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;