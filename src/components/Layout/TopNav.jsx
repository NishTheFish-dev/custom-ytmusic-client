import React, { useState } from 'react';
import { Box, IconButton, TextField, InputAdornment } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';

const TopNav = ({ onHomeClick, onSearch }) => {
  const [searchText, setSearchText] = useState('');
  return (
    <Box
      className="topbar"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        backgroundColor: 'var(--background-base)',
        borderBottom: '1px solid var(--background-highlight)',
        gap: 2,
        WebkitAppRegion: 'drag',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >

      <Box sx={{ 
        position: 'relative',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        width: '100%',
        height: '100%',

      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          maxWidth: '600px',
          width: '100%',
          margin: '0 auto',
          padding: '0 24px',
        }}>
        <IconButton
          onClick={onHomeClick}
          sx={{
            color: 'var(--text-base)',
            '&:hover': {
              backgroundColor: 'var(--background-highlight)',
            },
            marginRight: 2,
            WebkitAppRegion: 'no-drag',
          }}
        >
          <HomeIcon />
        </IconButton>

        <Box sx={{ flex: 1, maxWidth: '600px' }}>
          <TextField
            placeholder="Search for songs, artists, or playlists"
            variant="outlined"
            size="small"
            fullWidth
            sx={{ WebkitAppRegion: 'no-drag' }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearch(searchText);
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton 
                    onClick={() => { if (searchText.trim()) onSearch(searchText); }}
                    edge="start"
                    sx={{
                      color: 'var(--text-subdued)',
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                    }}
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                backgroundColor: 'var(--background-elevated-base)',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--background-highlight)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--essential-bright-accent)',
                },
                '& input': {
                  color: 'var(--text-base)',
                  padding: '8.5px 0',
                  '&::placeholder': {
                    color: 'var(--text-subdued)',
                    opacity: 1,
                  },
                },
              },
            }}
          />
        </Box>
      </Box>
      </Box>
    </Box>
  );
};

export default TopNav; 