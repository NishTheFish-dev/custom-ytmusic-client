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
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const QueuePanel = ({
  queue,
  currentTrack,
  onTrackClick,
  onTrackPlay,
  onTrackRemove,
}) => {
  return (
    <Box className="queue-panel"
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 'calc(var(--player-height) + 6px)',
        width: 'var(--queue-width)',
        backgroundColor: 'var(--background-base)',
        borderLeft: '1px solid var(--background-highlight)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 900,
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography
          variant="h6"
          sx={{
            color: 'var(--text-base)',
            fontSize: '1rem',
            fontWeight: 700,
          }}
        >
          Queue
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'var(--background-highlight)' }} />

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
            <ListItem
              sx={{
                px: 0,
                '&:hover': {
                  backgroundColor: 'var(--background-highlight)',
                },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  variant="square"
                  sx={{ width: 40, height: 40, borderRadius: 1 }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={currentTrack.title}
                secondary={currentTrack.artist}
                primaryTypographyProps={{
                  sx: {
                    color: 'var(--text-base)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  },
                }}
                secondaryTypographyProps={{
                  sx: {
                    color: 'var(--text-subdued)',
                    fontSize: '0.75rem',
                  },
                }}
              />
            </ListItem>
          </Box>

          <Divider sx={{ borderColor: 'var(--background-highlight)' }} />
        </>
      )}

      <List sx={{ flex: 1, overflow: 'auto', pb: 'calc(var(--player-height) + 6px)' }}>
        {queue.map((track, index) => (
          <ListItem
            key={track.id}
            sx={{
              px: 2,
              '&:hover': {
                backgroundColor: 'var(--background-highlight)',
              },
            }}
          >
            <ListItemAvatar>
              <Avatar
                src={track.thumbnail}
                alt={track.title}
                variant="square"
                sx={{ width: 40, height: 40, borderRadius: 1 }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={track.title}
              secondary={track.artist}
              primaryTypographyProps={{
                sx: {
                  color: 'var(--text-base)',
                  fontSize: '0.875rem',
                },
              }}
              secondaryTypographyProps={{
                sx: {
                  color: 'var(--text-subdued)',
                  fontSize: '0.75rem',
                },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default QueuePanel; 