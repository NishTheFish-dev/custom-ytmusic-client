import React, { useState } from 'react';
import {
  Box,
  IconButton,
  TextField,
  InputAdornment,
  Slider,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Settings,
  Home as HomeIcon,
  ArrowBackIosNew as ArrowBackIcon,
  ArrowForwardIos as ArrowForwardIcon,
  Search as SearchIcon,
  PlayArrow,
  Pause,
  SkipPrevious,
  SkipNext,
  VolumeUp,
  VolumeOff,
  QueueMusic,
  Shuffle,
  Repeat,
  RepeatOne,
} from '@mui/icons-material';

import { useAudio } from '../context/AudioContext';

/**
 * GlobalControls consolidates the previous TopNav and PlayerBar components into a single
 * file so their UI is rendered directly on the application "floor" (no raised nav bars).
 *
 * Props:
 * -       : () => void
 * - onSearch         : (query: string) => void
 * - onToggleQueue    : () => void   (toggles the queue sidebar)
 */
const GlobalControls = ({ onHomeClick, onSearch, onToggleQueue, onNavigateBack, onNavigateForward, canGoBack = false, canGoForward = false }) => {
  return (
    <>
      <TopControls
        onHomeClick={onHomeClick}
        onSearch={onSearch}
        onNavigateBack={onNavigateBack}
        onNavigateForward={onNavigateForward}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
      />
      <BottomPlayerControls onToggleQueue={onToggleQueue} />
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*                              Top (Search) Bar                              */
/* -------------------------------------------------------------------------- */
const TopControls = ({ onHomeClick, onSearch, onNavigateBack, onNavigateForward, canGoBack, canGoForward }) => {
  const [searchText, setSearchText] = useState('');

  return (
    <Box
      className="topbar"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--topbar-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        backgroundColor: 'var(--background-base)',
        // No borders or elevation – sits flush with the app background
        zIndex: 1100,
        gap: 2,
        WebkitAppRegion: 'drag',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          px: 0,
        }}
      >
        {/* Left cluster */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            sx={{
              color: 'var(--text-base)',
              '&:hover': { backgroundColor: 'var(--background-highlight)' },
              WebkitAppRegion: 'no-drag',
            }}
          >
            <Settings />
          </IconButton>
          <IconButton
            onClick={onHomeClick}
            sx={{
              color: 'var(--text-base)',
              '&:hover': { backgroundColor: 'var(--background-highlight)' },
              WebkitAppRegion: 'no-drag',
              mr: 2, // extra gap after Home
            }}
          >
            <HomeIcon />
          </IconButton>
          <IconButton
            onClick={onNavigateBack}
            disabled={!canGoBack}
            sx={{
              color: 'var(--text-base)',
              '&:hover': { backgroundColor: 'var(--background-highlight)' },
              WebkitAppRegion: 'no-drag',
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={onNavigateForward}
            disabled={!canGoForward}
            sx={{
              color: 'var(--text-base)',
              '&:hover': { backgroundColor: 'var(--background-highlight)' },
              WebkitAppRegion: 'no-drag',
            }}
          >
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Center search bar */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '46.4%',
            pointerEvents: 'auto',
          }}
        >
          <TextField
            placeholder="Search for songs, artists, or playlists"
            variant="outlined"
            size="small"
            fullWidth
            sx={{ WebkitAppRegion: 'no-drag' }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearch(searchText);
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton
                    onClick={() => {
                      if (searchText.trim()) onSearch(searchText);
                    }}
                    edge="start"
                    sx={{
                      color: 'var(--text-subdued)',
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                    }}
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                backgroundColor: 'var(--background-elevated-base)',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent !important',
                },
                '& input': {
                  color: 'var(--text-base)',
                  padding: '8.5px 0',
                  '&::placeholder': {
                    color: 'var(--text-subdued)',
                    opacity: 1,
                  },
                },
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

/* -------------------------------------------------------------------------- */
/*                        Bottom (Player / Transport) Bar                      */
/* -------------------------------------------------------------------------- */
const BottomPlayerControls = ({ onToggleQueue }) => {
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

  // toggle between total duration and time remaining
  const [showRemaining, setShowRemaining] = useState(false);

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
  const durationSeconds = hasTrack ? duration || parseDurationToSeconds(currentTrack?.duration) : 0;
  const elapsedSeconds = (progress * durationSeconds) / 100;
  const remainingSeconds = Math.max(durationSeconds - elapsedSeconds, 0);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleNext = () => {
    if (queue.length) {
      const [next, ...rest] = queue;
      setQueue(rest);
      playTrack(next);
    }
  };

  const handlePrevious = () => {
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
        height: 'var(--player-height)',
        paddingTop: '4px',
        backgroundColor: 'var(--background-base)',
        // No border/elevation, sits flush
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
          maxWidth: '40%',
        }}
      >
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
            {hasTrack ? formatTime((progress * durationSeconds) / 100) : '--:--'}
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
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ minWidth: '40px', cursor: hasTrack ? 'pointer' : 'default' }}
            onClick={() => hasTrack && setShowRemaining((prev) => !prev)}
          >
            {hasTrack
              ? showRemaining
                ? `-${formatTime(remainingSeconds)}`
                : formatTime(durationSeconds)
              : '--:--'}
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
          gap: '16px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '120px' }}>
          <IconButton
            onClick={() => {
              if (volume === 0) {
                changeVolume(prevVolume || 50);
              } else {
                setPrevVolume(volume);
                changeVolume(0);
              }
            }}
            size="small"
            sx={{ mr: 1 }}
          >
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

export default GlobalControls;
