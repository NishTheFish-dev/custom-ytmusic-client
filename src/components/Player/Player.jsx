import React, { useState } from 'react';
import { Box, IconButton, Slider, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import RepeatIcon from '@mui/icons-material/Repeat';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import PictureInPictureIcon from '@mui/icons-material/PictureInPicture';

const Player = ({
  currentTrack,
  isPlaying,
  progress,
  volume,
  onPlayPause,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleQueue,
  onToggleMiniPlayer,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      onVolumeChange(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      onVolumeChange(0);
      setIsMuted(true);
    }
  };

  return (
    <Box
      className="player"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 90,
        backgroundColor: 'var(--background-base)',
        borderTop: '1px solid var(--background-highlight)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        zIndex: 1000,
      }}
    >
      {/* Track Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', width: '30%' }}>
        {currentTrack?.thumbnail && (
          <img
            src={currentTrack.thumbnail}
            alt={currentTrack.title}
            style={{ width: 56, height: 56, marginRight: 14, borderRadius: 4 }}
          />
        )}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              color: 'var(--text-base)',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            {currentTrack?.title || 'No track playing'}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'var(--text-subdued)',
              fontSize: '0.75rem',
            }}
          >
            {currentTrack?.artist || ''}
          </Typography>
        </Box>
      </Box>

      {/* Playback Controls */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '40%',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <IconButton
            size="small"
            sx={{ color: 'var(--text-subdued)' }}
            onClick={onPrevious}
          >
            <SkipPreviousIcon />
          </IconButton>
          <IconButton
            sx={{
              color: 'var(--text-base)',
              '&:hover': { transform: 'scale(1.1)' },
            }}
            onClick={onPlayPause}
          >
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton
            size="small"
            sx={{ color: 'var(--text-subdued)' }}
            onClick={onNext}
          >
            <SkipNextIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Typography
            variant="caption"
            sx={{ color: 'var(--text-subdued)', width: 40 }}
          >
            {formatTime(progress)}
          </Typography>
          <Slider
            value={progress}
            onChange={(_, value) => onSeek(value)}
            sx={{
              mx: 2,
              color: 'var(--text-base)',
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: '0px 0px 0px 8px rgba(29, 185, 84, 0.16)',
                },
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{ color: 'var(--text-subdued)', width: 40 }}
          >
            {formatTime(currentTrack?.duration || 0)}
          </Typography>
        </Box>
      </Box>

      {/* Volume and Queue Controls */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          width: '30%',
        }}
      >
        <IconButton
          size="small"
          sx={{ color: 'var(--text-subdued)' }}
          onClick={handleMuteToggle}
        >
          {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
        </IconButton>
        <Slider
          value={volume}
          onChange={(_, value) => onVolumeChange(value)}
          sx={{
            width: 100,
            mx: 2,
            color: 'var(--text-base)',
            '& .MuiSlider-thumb': {
              width: 12,
              height: 12,
            },
          }}
        />
        <IconButton
          size="small"
          sx={{ color: 'var(--text-subdued)' }}
          onClick={onToggleQueue}
        >
          <QueueMusicIcon />
        </IconButton>
        <IconButton
          size="small"
          sx={{ color: 'var(--text-subdued)' }}
          onClick={onToggleMiniPlayer}
        >
          <PictureInPictureIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Player; 