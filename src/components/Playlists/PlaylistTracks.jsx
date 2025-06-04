import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, CircularProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { playlistService } from '../../services/playlistService';

const PlaylistTracks = ({ playlist, onPlayClick }) => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTracks = async () => {
      try {
        setLoading(true);
        const items = await playlistService.getPlaylistItems(playlist.id);
        setTracks(items);
      } catch (err) {
        setError('Failed to load playlist tracks');
        console.error('Error loading playlist tracks:', err);
      } finally {
        setLoading(false);
      }
    };

    if (playlist) {
      loadTracks();
    }
  }, [playlist]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!tracks.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No tracks found in this playlist</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {tracks.map((track, index) => (
        <Box
          key={track.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 1,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <Typography
            sx={{
              width: 40,
              textAlign: 'center',
              color: 'var(--text-subdued)',
            }}
          >
            {index + 1}
          </Typography>
          
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flex: 1,
              ml: 2,
            }}
          >
            <img
              src={track.thumbnail}
              alt={track.title}
              style={{
                width: 40,
                height: 40,
                objectFit: 'cover',
                marginRight: 16,
              }}
            />
            <Box>
              <Typography
                sx={{
                  color: 'var(--text-base)',
                  fontSize: '0.875rem',
                }}
              >
                {track.title}
              </Typography>
              <Typography
                sx={{
                  color: 'var(--text-subdued)',
                  fontSize: '0.75rem',
                }}
              >
                {track.artist}
              </Typography>
            </Box>
          </Box>

          <Typography
            sx={{
              color: 'var(--text-subdued)',
              fontSize: '0.875rem',
              width: 100,
              textAlign: 'right',
            }}
          >
            {track.duration}
          </Typography>

          <IconButton
            size="small"
            onClick={() => onPlayClick(track)}
            sx={{ ml: 2 }}
          >
            <PlayArrowIcon />
          </IconButton>

          <IconButton size="small">
            <MoreVertIcon />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
};

export default PlaylistTracks; 