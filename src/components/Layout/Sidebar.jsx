import React, { useState, useEffect, useRef } from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Box, Avatar, Typography, CircularProgress, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { playlistService } from '../../services/playlistService';
import { preferencesService } from '../../services/preferencesService';

const Sidebar = ({ currentView, setCurrentView, onPlaylistClick }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  

  useEffect(() => {
    loadPlaylists();
  }, []);

  useEffect(() => {
    const loadPreferences = async () => {
      const preferences = await preferencesService.getPreferences();
      // apply saved sidebar width if available
      if (preferences.sidebarWidth) {
        document.documentElement.style.setProperty('--sidebar-width', `${preferences.sidebarWidth}px`);
      }
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





  return (
    <Box
      className="sidebar"
      sx={{
        width: 'var(--sidebar-width)',
        height: 'calc(100vh - var(--topbar-height) - var(--player-height))',
        marginTop: 'var(--topbar-height)',
        marginRight: 'var(--sidebar-gap)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--background-elevated-base)',
        border: '1px solid var(--background-highlight)',
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
      }}
    >

      
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        px: 0,
        pb: 0,
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Sticky header */}
        <Box sx={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--background-elevated-base)' }}>
          <Box sx={{ px: 2, py: 1, borderBottom: '1px solid var(--background-highlight)' }}>
            <Typography
              variant="h6"
              sx={{
                color: 'var(--text-base)',
                fontSize: '1rem',
                fontWeight: 700,
                lineHeight: 1.5,
              }}
            >
              Your Playlists
            </Typography>
          </Box>
        </Box>
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
    </Box>
  );
};

export default Sidebar; 