import React from 'react';
import { Box, IconButton, Slider, Typography, useTheme } from '@mui/material';
import { PlayArrow, Pause, SkipPrevious, SkipNext, VolumeUp, VolumeOff, QueueMusic, Shuffle, Repeat, RepeatOne } from '@mui/icons-material';

import { useAudio } from '../../context/AudioContext';

const PlayerBar = ({ onToggleQueue }) => {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    togglePlay,
    seek,
    changeVolume,
    playTrack,
    queue,
    setQueue,
    shuffle,
    repeatMode,
    toggleShuffle,
    cycleRepeat,
  } = useAudio();
  const [prevVolume, setPrevVolume] = React.useState(volume);
  const theme = useTheme();
  const parseDurationToSeconds = (dur) => {
    if (typeof dur === 'number') return dur;
    if (typeof dur !== 'string') return 0;
    const parts = dur.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  const hasTrack = Boolean(currentTrack);
  const durationSeconds = hasTrack ? (duration || parseDurationToSeconds(currentTrack?.duration)) : 0;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // theme already called above

  const handleNext = () => {
    if (queue.length) {
      const [next, ...rest] = queue;
      setQueue(rest);
      playTrack(next);
    }
  };

  const handlePrevious = () => {
    // For simplicity, restart current track
    seek(0);
  };

  
  return (
    <Box
      className="player"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '96px',
        paddingTop: '4px',
        backgroundColor: 'var(--background-base)',
        borderTop: '1px solid var(--background-tinted-base)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        zIndex: 1000,
        '@media (max-width: 600px)': {
          padding: '0 8px',
          '& .MuiTypography-caption': {
            fontSize: '0.7rem',
          },
          '& .MuiIconButton-root': {
            padding: '6px',
          },
        },
      }}
    >
      {/* Track Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', width: '30%', minWidth: 0, flexShrink: 1 }}>
        {hasTrack ? (
          <>
            <img
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              style={{ width: '56px', height: '56px', objectFit: 'cover', marginRight: '16px' }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  fontSize: '1rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: { xs: '140px', sm: '220px', md: '280px', lg: '320px' },
                }}
              >
                {currentTrack.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: '0.9rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: { xs: '140px', sm: '220px', md: '280px', lg: '320px' },
                }}
              >
                {currentTrack.artist}
              </Typography>
            </Box>
          </>
        ) : (
          <Typography variant="subtitle1" sx={{ color: 'var(--text-subdued)', fontSize: '1rem' }}>
            Nothing playing
          </Typography>
        )}
      </Box>


      {/* Player Controls */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
        maxWidth: '40%',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mt: '4px' }}>
          <IconButton size="small" onClick={toggleShuffle} sx={{ color: shuffle ? theme.palette.primary.main : 'inherit' }} disabled={!hasTrack}>
            <Shuffle />
          </IconButton>
          <IconButton size="small" onClick={handlePrevious} disabled={!hasTrack}>
            <SkipPrevious />
          </IconButton>
          <IconButton
            size="large"
            onClick={hasTrack ? togglePlay : undefined}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
          <IconButton size="small" onClick={handleNext} disabled={!hasTrack}>
            <SkipNext />
          </IconButton>
          <IconButton size="small" onClick={cycleRepeat} sx={{ color: repeatMode ? theme.palette.primary.main : 'inherit' }} disabled={!hasTrack}>
            {repeatMode === 2 ? <RepeatOne /> : <Repeat />}
          </IconButton>
        </Box>
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: '40px' }}>
            {hasTrack ? formatTime(progress * durationSeconds / 100) : '--:--'}
          </Typography>
          <Slider
            value={hasTrack ? progress : 0}
            onChange={(_, value) => hasTrack && seek(value)}
            size="small"
            sx={{
              color: theme.palette.primary.main,
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: `0px 0px 0px 8px ${theme.palette.primary.main}29`,
                },
              },
              '& .MuiSlider-rail': {
                opacity: 0.3,
                backgroundColor: '#4f4f4f',
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: '40px' }}>
            {hasTrack ? formatTime(durationSeconds) : '--:--'}
          </Typography>
        </Box>
      </Box>

      {/* Volume and Queue Controls */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '30%',
        gap: '16px',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '120px' }}>
          <IconButton onClick={() => {
            if (volume === 0) {
              changeVolume(prevVolume || 50);
            } else {
              setPrevVolume(volume);
              changeVolume(0);
            }
          }} size="small" sx={{ mr: 1 }}>
            {volume === 0 ? <VolumeOff /> : <VolumeUp />}
          </IconButton>
          <Slider
            value={volume}
            onChange={(_, value) => changeVolume(value)}
            disabled={!hasTrack}
            size="small"
            sx={{
              color: 'primary.main',
              '& .MuiSlider-thumb': {
                width: 10,
                height: 10,
              },
            }}
          />
        </Box>
        <IconButton onClick={onToggleQueue}>
          <QueueMusic />
        </IconButton>
      </Box>
    </Box>
  );
};

export default PlayerBar;
