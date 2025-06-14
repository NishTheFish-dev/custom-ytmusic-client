import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AuthComponent from './components/Auth/AuthComponent';
import Sidebar from './components/Layout/Sidebar';
import TopNav from './components/Layout/TopNav';
import QueuePanel from './components/Queue/QueuePanel';
import Playlists from './components/Playlists/Playlists';
import PlaylistTracks from './components/Playlists/PlaylistTracks';
import PlayerBar from './components/Player/PlayerBar';
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
  const [showQueue, setShowQueue] = useState(false);
  // queue handled by AudioContext
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await youtubeApi.isAuthenticated();
        setIsAuthenticated(authStatus);
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
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
        return <Box sx={{ p: 3 }}>Home Content</Box>;
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
        return <Box sx={{ p: 3 }}>Home Content</Box>;
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
      <div className={`app-container ${showQueue ? 'queue-open' : ''}`}>
        {!isAuthenticated ? (
          <AuthComponent onAuthSuccess={handleAuthSuccess} />
        ) : (
          <>
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              <Sidebar
                currentView={currentView}
                setCurrentView={setCurrentView}
                onPlaylistClick={handleSidebarPlaylistClick}
                sidebarWidth={sidebarWidth}
                onWidthChange={setSidebarWidth}
              />
              <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <TopNav onHomeClick={handleHomeClick} onSearch={handleSearch} />
                <div className="content" style={{ 
                  flex: 1, 
                  overflow: currentView === 'playlist' ? 'hidden' : 'auto', 
                  padding: '24px'
                }}>
                  {renderContent()}
                </div>
              </div>
            </div>

            <PlayerBar onToggleQueue={handleToggleQueue} />

            {showQueue && (
              <QueuePanel
                queue={queue}
                currentTrack={currentTrack}
              />
            )}
          </>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App; 