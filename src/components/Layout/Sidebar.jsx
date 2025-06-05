import React, { useState, useEffect, useRef } from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Box, Avatar, Typography, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { playlistService } from '../../services/playlistService';
import { preferencesService } from '../../services/preferencesService';

const Sidebar = ({ currentView, setCurrentView, onPlaylistClick }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);
  const maxWidth = 400; // 1/4 of default app width (1600)

  useEffect(() => {
    loadPlaylists();
  }, []);

  useEffect(() => {
    const loadPreferences = async () => {
      const preferences = await preferencesService.getPreferences();
      setSidebarWidth(preferences.sidebarWidth);
    };
    loadPreferences();
  }, []);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await playlistService.getUserPlaylists();
      setPlaylists(data);
    } catch (err) {
      setError('Failed to load playlists');
      console.error('Error loading playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = async (e) => {
      if (!isResizing) return;

      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
        await preferencesService.updateSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, maxWidth]);

  return (
    <Box
      ref={sidebarRef}
      sx={{
        width: sidebarWidth,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--background-base)',
        borderRight: '1px solid var(--background-tinted-base)',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          cursor: 'col-resize',
          '&:hover': {
            backgroundColor: 'var(--essential-bright-accent)',
          },
          backgroundColor: isResizing ? 'var(--essential-bright-accent)' : 'transparent',
        }}
        onMouseDown={handleMouseDown}
      />
      
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1 }}>
        <Typography variant="h6" sx={{ color: 'var(--text-base)', px: 1, mb: 1, fontWeight: 700 }}>
          Your Playlists
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
            <CircularProgress size={24} sx={{ color: 'var(--text-base)' }} />
          </Box>
        ) : error ? (
          <Typography sx={{ color: 'var(--text-subdued)', px: 2 }}>{error}</Typography>
        ) : (
          <List>
            {playlists.map((playlist) => (
              <ListItem
                key={playlist.id}
                button
                onClick={() => onPlaylistClick(playlist)}
                sx={{ borderRadius: 1, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 56 }}>
                  <Avatar src={playlist.thumbnail} alt={playlist.title} variant="square" sx={{ width: 40, height: 40, borderRadius: 1 }} />
                </ListItemIcon>
                <ListItemText
                  sx={{ ml: 1.5 }}
                  primary={
                    <Typography sx={{ color: 'var(--text-base)', fontWeight: 500, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {playlist.title}
                    </Typography>
                  }
                  secondary={
                    <Typography sx={{ color: 'var(--text-subdued)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {playlist.channelTitle}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Box sx={{ p: 2 }}>
        <ListItem
          button
          sx={{
            borderRadius: 1,
            backgroundColor: 'var(--background-highlight)',
            '&:hover': {
              backgroundColor: 'var(--background-highlight)',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'var(--text-base)' }}>
            <AddIcon />
          </ListItemIcon>
          <ListItemText
            primary="Create Playlist"
            primaryTypographyProps={{ sx: { fontSize: '0.9rem' } }}
          />
        </ListItem>
      </Box>
    </Box>
  );
};

export default Sidebar; 