import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AuthComponent from './components/Auth/AuthComponent';
import Sidebar from './components/Layout/Sidebar';
import TopNav from './components/Layout/TopNav';
import Player from './components/Player/Player';
import QueuePanel from './components/Queue/QueuePanel';
import UserProfile from './components/User/UserProfile';
import Playlists from './components/Playlists/Playlists';
import PlaylistTracks from './components/Playlists/PlaylistTracks';
import { youtubeApi } from './services/youtubeApi';
import './index.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1DB954',
    },
    background: {
      default: '#121212',
      paper: '#181818',
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(100);
  const [showQueue, setShowQueue] = useState(false);
  const [queue, setQueue] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await youtubeApi.isAuthenticated();
        setIsAuthenticated(authStatus);
        if (authStatus) {
          setUser({
            name: 'User',
            avatar: 'https://via.placeholder.com/40',
          });
        }
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

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    // TODO: Implement previous track logic
  };

  const handleNext = () => {
    // TODO: Implement next track logic
  };

  const handleSeek = (value) => {
    setProgress(value);
  };

  const handleVolumeChange = (value) => {
    setVolume(value);
  };

  const handleToggleQueue = () => {
    setShowQueue(!showQueue);
  };

  const handleToggleMiniPlayer = () => {
    // TODO: Implement mini player logic
  };

  const handleTrackPlay = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handleTrackRemove = (track) => {
    setQueue(queue.filter(t => t.id !== track.id));
  };

  const handleSidebarPlaylistClick = (playlist) => {
    setCurrentView('playlist');
    setSelectedPlaylist(playlist);
  };

  const handleSearch = (query) => {
    // TODO: Implement search functionality
    console.log('Search query:', query);
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
        return <Box sx={{ p: 3 }}>Search Content</Box>;
      case 'library':
        return <Playlists onPlaylistClick={handleSidebarPlaylistClick} onPlayClick={handleTrackPlay} />;
      case 'playlist':
        return selectedPlaylist ? (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <img
                src={selectedPlaylist.thumbnail}
                alt={selectedPlaylist.title}
                style={{
                  width: 232,
                  height: 232,
                  objectFit: 'cover',
                  marginRight: 24,
                }}
              />
              <Box>
                <Typography variant="h4" sx={{ color: 'var(--text-base)', mb: 1 }}>
                  {selectedPlaylist.title}
                </Typography>
                <Typography sx={{ color: 'var(--text-subdued)', mb: 2 }}>
                  {selectedPlaylist.description}
                </Typography>
                <Typography sx={{ color: 'var(--text-subdued)' }}>
                  {selectedPlaylist.itemCount} songs
                </Typography>
              </Box>
            </Box>
            <PlaylistTracks
              playlist={selectedPlaylist}
              onPlayClick={handleTrackPlay}
            />
          </Box>
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

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className="app-container">
        {!isAuthenticated ? (
          <AuthComponent onAuthSuccess={handleAuthSuccess} />
        ) : (
          <>
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              <Sidebar currentView={currentView} setCurrentView={setCurrentView} onPlaylistClick={handleSidebarPlaylistClick} />
              <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <TopNav onHomeClick={handleHomeClick} onSearch={handleSearch} />
                <div className="content" style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                  {renderContent()}
                </div>
              </div>
            </div>

            {showQueue && (
              <QueuePanel
                queue={queue}
                currentTrack={currentTrack}
                onTrackClick={handleTrackPlay}
                onTrackPlay={handleTrackPlay}
                onTrackRemove={handleTrackRemove}
              />
            )}

            <Player
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              progress={progress}
              volume={volume}
              onPlayPause={handlePlayPause}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSeek={handleSeek}
              onVolumeChange={handleVolumeChange}
              onToggleQueue={handleToggleQueue}
              onToggleMiniPlayer={handleToggleMiniPlayer}
            />

            <UserProfile user={user} onLogout={() => setIsAuthenticated(false)} />
          </>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App; 