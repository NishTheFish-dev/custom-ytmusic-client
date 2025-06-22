import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import AlbumGrid from '../Grid/AlbumGrid';
import './PlaylistCard.css';
import { playlistService } from '../../services/playlistService';

const Playlists = ({ onPlaylistClick, onPlayClick }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await playlistService.getUserPlaylists();
      setPlaylists(data);
    } catch (err) {
      setError('Failed to load playlists');

    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          padding: 4,
        }}
      >
        <CircularProgress sx={{ color: 'var(--text-base)' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          padding: 4,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: 'var(--text-subdued)',
            textAlign: 'center',
          }}
        >
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Sticky header */}
      <Box
        sx={{
          px: 3,
          py: 3,
          position: 'sticky',
          top: 0,
          zIndex: 2,
          background: 'var(--background, #121212)',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: 'var(--text-base)',
            fontWeight: 700,
          }}
        >
          Your Playlists
        </Typography>
      </Box>

      {/* Scrollable playlists list */}
      <Box className="playlist-card" sx={{ flex: 1, overflowY: 'auto', px: 3, pb: 3 }}>
        {playlists.length === 0 ? (
          <Typography
            variant="body1"
            sx={{
              color: 'var(--text-subdued)',
              textAlign: 'center',
              marginTop: 4,
            }}
          >
            No playlists found. Create your first playlist on YouTube Music!
          </Typography>
        ) : (
          <AlbumGrid
            items={playlists.map(playlist => ({
              id: playlist.id,
              title: playlist.title,
              subtitle: `${playlist.itemCount} songs • ${playlist.channelTitle}`,
              thumbnail: playlist.thumbnail,
            }))}
            onItemClick={onPlaylistClick}
            onPlayClick={onPlayClick}
          />
        )}
      </Box>
    </Box>
  );
};

export default Playlists;