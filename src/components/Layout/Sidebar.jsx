import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Divider, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';

const Sidebar = ({ currentView, setCurrentView }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: <HomeIcon /> },
    { id: 'search', label: 'Search', icon: <SearchIcon /> },
    { id: 'library', label: 'Your Library', icon: <LibraryMusicIcon /> },
  ];

  const libraryItems = [
    { id: 'playlists', label: 'Playlists', icon: <PlaylistPlayIcon /> },
    { id: 'liked', label: 'Liked Songs', icon: <FavoriteIcon /> },
    { id: 'offline', label: 'Offline', icon: <DownloadIcon /> },
  ];

  return (
    <Box className="sidebar" sx={{ 
      width: 240,
      height: '100%',
      backgroundColor: 'var(--background-base)',
      borderRight: '1px solid var(--background-highlight)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ p: 2 }}>
        <img src="/logo.png" alt="Logo" style={{ height: 40 }} />
      </Box>

      <List sx={{ px: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.id}
            button
            onClick={() => setCurrentView(item.id)}
            selected={currentView === item.id}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'var(--background-highlight)',
                '&:hover': {
                  backgroundColor: 'var(--background-highlight)',
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: 'var(--text-base)' }}>{item.icon}</ListItemIcon>
            <ListItemText 
              primary={item.label} 
              primaryTypographyProps={{
                sx: { 
                  fontSize: '0.9rem',
                  fontWeight: currentView === item.id ? 700 : 400,
                }
              }}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2, borderColor: 'var(--background-highlight)' }} />

      <List sx={{ px: 2 }}>
        {libraryItems.map((item) => (
          <ListItem
            key={item.id}
            button
            onClick={() => setCurrentView(item.id)}
            selected={currentView === item.id}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'var(--background-highlight)',
                '&:hover': {
                  backgroundColor: 'var(--background-highlight)',
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: 'var(--text-base)' }}>{item.icon}</ListItemIcon>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{
                sx: { 
                  fontSize: '0.9rem',
                  fontWeight: currentView === item.id ? 700 : 400,
                }
              }}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 'auto', p: 2 }}>
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
            primaryTypographyProps={{
              sx: { fontSize: '0.9rem' }
            }}
          />
        </ListItem>
      </Box>
    </Box>
  );
};

export default Sidebar; 