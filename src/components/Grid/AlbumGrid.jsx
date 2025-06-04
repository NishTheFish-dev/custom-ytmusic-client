import React from 'react';
import { Box, Typography, Card, CardContent, CardMedia } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const AlbumGrid = ({ items, onItemClick, onPlayClick }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 3,
        padding: 3,
      }}
    >
      {items.map((item) => (
        <Card
          key={item.id}
          sx={{
            backgroundColor: 'var(--background-elevated-base)',
            transition: 'background-color 0.3s ease',
            '&:hover': {
              backgroundColor: 'var(--background-elevated-highlight)',
              '& .play-button': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
            cursor: 'pointer',
            position: 'relative',
          }}
          onClick={() => onItemClick(item)}
        >
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              image={item.thumbnail}
              alt={item.title}
              sx={{
                aspectRatio: '1',
                objectFit: 'cover',
                boxShadow: '0 8px 24px rgba(0,0,0,.5)',
              }}
            />
            <Box
              className="play-button"
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                backgroundColor: 'var(--background-base)',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transform: 'translateY(8px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  backgroundColor: 'var(--background-highlight)',
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                onPlayClick(item);
              }}
            >
              <PlayArrowIcon sx={{ color: 'var(--text-base)' }} />
            </Box>
          </Box>
          <CardContent sx={{ p: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: 'var(--text-base)',
                fontSize: '0.875rem',
                fontWeight: 500,
                mb: 0.5,
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