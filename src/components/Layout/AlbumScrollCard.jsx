import React from 'react';
import Box from '@mui/material/Box';
import Playlists from '../Playlists/Playlists';

/**
 * AlbumScrollCard – scrollable container inside PlaylistCard that hosts playlists/albums.
 */
const AlbumScrollCard = ({ onPlaylistClick, onPlayClick }) => {
  return (
    <Box sx={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto', p: 0 }}>
      <Playlists onPlaylistClick={onPlaylistClick} onPlayClick={onPlayClick} />
    </Box>
  );
};

export default AlbumScrollCard;
