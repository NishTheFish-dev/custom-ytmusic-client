import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from '@mui/material';
import './QueuePanel.css';

/**
 * QueuePanel – displays the current track and upcoming queue list.
 * This is copied from the previous implementation (.bak) without functional changes.
 */
const QueuePanel = ({ queue, currentTrack, onTrackClick, onTrackPlay, onTrackRemove }) => {
  return (
    <Box
      className="queue-container"
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden',
      }}
    >
      <Box
        className="queue-panel"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box sx={{ pt: 3, pb: 2, px: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Queue
          </Typography>
        </Box>
        <Divider sx={{ borderColor: 'var(--background-tinted-base)' }} />

        {/* Now Playing */}
        {currentTrack && (
          <>
            <Box sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'var(--text-subdued)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Now Playing
              </Typography>
              <ListItem sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar
                    src={currentTrack.thumbnail}
                    alt={currentTrack.title}
                    variant="square"
                    sx={{ width: 40, height: 40, borderRadius: 1 }}
                  />
                </ListItemAvatar>
                <ListItemText primary={currentTrack.title} secondary={currentTrack.artist} />
              </ListItem>
            </Box>
            <Divider sx={{ borderColor: 'var(--background-tinted-base)' }} />
          </>
        )}

        {/* Upcoming */}
        <List sx={{ flex: 1, overflow: 'auto' }}>
          {queue.map(track => (
            <ListItem key={track.id} sx={{ px: 2 }}>
              <ListItemAvatar>
                <Avatar
                  src={track.thumbnail}
                  alt={track.title}
                  variant="square"
                  sx={{ width: 40, height: 40, borderRadius: 1 }}
                />
              </ListItemAvatar>
              <ListItemText primary={track.title} secondary={track.artist} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default QueuePanel;
