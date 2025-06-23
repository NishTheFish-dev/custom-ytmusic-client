import React from 'react';
import Box from '@mui/material/Box';
import AlbumScrollCard from './AlbumScrollCard';

/**
 * PlaylistCard – left column container that displays the user's playlists.
 * Relies on the existing <Playlists /> component for listing functionality.
 */
const PlaylistCard = ({ onPlaylistSelect }) => {
  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 0,
        backgroundColor: 'var(--background-elevated-base)',
        borderRadius: '12px',
        p: 0,
        m: 1,
      }}
    >
      <AlbumScrollCard onPlaylistClick={onPlaylistSelect} />
    </Box>
  );
};

export default PlaylistCard;
