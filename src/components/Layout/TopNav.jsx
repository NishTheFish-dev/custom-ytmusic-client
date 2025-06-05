import React from 'react';
import { Box, IconButton, TextField, InputAdornment } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';

const TopNav = ({ onHomeClick, onSearch }) => {
  return (
    <Box
      sx={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        backgroundColor: 'var(--background-base)',
        borderBottom: '1px solid var(--background-highlight)',
        gap: 2,
      }}
    >
      <IconButton
        onClick={onHomeClick}
        sx={{
          color: 'var(--text-base)',
          '&:hover': {
            backgroundColor: 'var(--background-highlight)',
          },
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
        onChange={(e) => onSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'var(--text-subdued)' }} />
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