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
        left: 'var(--sidebar-width)',
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
        '& > *': {
          WebkitAppRegion: 'no-drag',
        },
      }}
    >
      <IconButton
        onClick={onHomeClick}
        sx={{
          color: 'var(--text-base)',
          '&:hover': {
            backgroundColor: 'var(--background-highlight)',
          },
          WebkitAppRegion: 'no-drag',
        }}
      >
        <HomeIcon />
      </IconButton>

      <TextField
        placeholder="Search for songs, artists, or playlists"
        variant="outlined"
        size="small"
        fullWidth
        sx={{ maxWidth: 600 }}
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
                sx={{
                  WebkitAppRegion: 'no-drag',
                }}
              >
                <SearchIcon sx={{ color: 'var(--text-subdued)' }} />
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
              '&::placeholder': {
                color: 'var(--text-subdued)',
                opacity: 1,
              },
            },
          },
        }}
      />
    </Box>
  );
};

export default TopNav; 