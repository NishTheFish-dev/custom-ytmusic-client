import React from 'react';
import { Box, Typography, Card, CardContent, CardMedia } from '@mui/material';
import './AlbumCard.css';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

/*
 * AlbumGrid – displays playlist/album cards in a responsive grid.
 * Copied from previous backup implementation without functional changes.
 */
const AlbumGrid = ({ items, onItemClick, onPlayClick }) => {
  return (
    <Box
      className="playlist-card"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '12px',
        padding: '8px 16px',
        overflowY: 'auto',
        height: '100%',
      }}
    >
      {items.map(item => (
        <Card
          key={item.id}
          className="album-card"
          sx={{
            backgroundColor: 'var(--background-elevated-base, #181818)',
            borderRadius: '8px',
            transition: 'background-color 0.3s ease, transform 0.2s ease',
            '&:hover': {
              backgroundColor: 'var(--background-elevated-highlight, #282828)',
              transform: 'translateY(-4px)',
              '& .play-button': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
            cursor: 'pointer',
            position: 'relative',
            padding: '8px',
            width: '100%',
            height: '100%',
            minHeight: '220px',
            boxSizing: 'border-box',
            boxShadow: '0 8px 24px rgba(0,0,0,.5)',
          }}
          onClick={() => onItemClick(item)}
        >
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                paddingBottom: '100%',
                marginBottom: '16px',
                borderRadius: '4px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,.5)',
              }}
            >
              <CardMedia
                component="img"
                image={item.thumbnail}
                alt={item.title}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  boxShadow: '0 8px 24px rgba(0,0,0,.5)',
                }}
              />
            </Box>
            <Box
              className="play-button"
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                backgroundColor: 'var(--essential-accent)',
                borderRadius: '50%',
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transform: 'translateY(8px)',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(0,0,0,.5)',
                '&:hover': {
                  transform: 'scale(1.06)',
                },
              }}
              onClick={e => {
                e.stopPropagation();
                onPlayClick(item);
              }}
            >
              <PlayArrowIcon sx={{ color: 'var(--text-base)' }} />
            </Box>
          </Box>
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: 'var(--text-base)',
                fontSize: '0.9rem',
                fontWeight: 700,
                mb: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.title}
            </Typography>
            <Typography
              variant="body2"
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
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default AlbumGrid;
