import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

/**
 * PlaylistList – renders playlists in a compact horizontal row layout similar to Spotify.
 * Each item shows a small thumbnail on the left, with title above subtitle on the right.
 * On hover the row background subtly highlights and the play button fades in.
 */
const THUMB_SIZE = 56; // px

const PlaylistList = ({ items, onItemClick, onPlayClick }) => {
  return (
    <Box
      className="playlist-card" // reuse existing scroll container styling
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        overflowY: 'auto',
        height: '100%',
        px: 1,
      }}
    >
      {items.map(item => (
        <Box
          key={item.id}
          onClick={() => onItemClick(item)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            borderRadius: '4px',
            cursor: 'pointer',
            py: 1,
            px: 1.5,
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: 'var(--background-elevated-highlight, #282828)',
              '& .play-btn': {
                opacity: 1,
                transform: 'translateX(0)',
              },
            },
          }}
        >
          {/* Left – Thumbnail */}
          <Box
            component="img"
            src={item.thumbnail}
            alt={item.title}
            sx={{
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              flexShrink: 0,
              borderRadius: '4px',
              objectFit: 'cover',
              boxShadow: '0 4px 20px rgba(0,0,0,.4)',
            }}
          />

          {/* Middle – Text */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              flex: 1,
              overflow: 'hidden',
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: 'var(--text-base)',
                fontWeight: 600,
                fontSize: '0.9rem',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.title}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'var(--text-subdued)',
                fontSize: '0.75rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.subtitle}
            </Typography>
          </Box>

          {/* Right – Play button */}
          <IconButton
            className="play-btn"
            size="small"
            onClick={e => {
              e.stopPropagation();
              onPlayClick && onPlayClick(item);
            }}
            sx={{
              backgroundColor: 'var(--essential-accent)',
              color: 'var(--text-base)',
              opacity: 0,
              transform: 'translateX(8px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'var(--essential-accent)',
              },
            }}
          >
            <PlayArrowIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
};

export default PlaylistList;
