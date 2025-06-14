import React from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useAudio } from '../../context/AudioContext';
import { youtubeApi } from '../../services/youtubeApi';

import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  IconButton,
} from '@mui/material';

/**
 * Display YouTube search results.
 *
 * props:
 *   results: array – array of video objects returned from YouTube search
 *   query: string – original search query (used for heading)
 */
const SearchResults = ({ results = [], query = '', isQueueOpen = false }) => {
  const truncateTitle = (title) => {
    if (!isQueueOpen) return title;
    const maxLength = 30; // Match the same length as PlaylistTracks
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  };
  const { playTrack, setQueue } = useAudio();
  if (!query) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Start typing to search for music</Typography>
      </Box>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">No results found for “{query}”</Typography>
      </Box>
    );
  }

  const decodeHtml = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  const getTitle = (item) => decodeHtml(item?.snippet?.title ?? item?.title ?? 'Unknown Title');
  const getThumbnail = (item) =>
    item?.snippet?.thumbnails?.default?.url || item?.thumbnail || '';
  const getChannel = (item) => decodeHtml(item?.snippet?.channelTitle ?? item?.channelTitle ?? '');

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Results for “{query}”
      </Typography>
      <List>
        {results.map((item, index) => {
          const track = {
            id: item.id?.videoId || item.videoId || item.id,
            title: getTitle(item),
            artist: getChannel(item),
            thumbnail: getThumbnail(item),
            // duration not available from search; could fetch details later
            duration: '',
          };
          const isoToSeconds = (iso) => {
            // PT#M#S etc
            if (!iso) return 0;
            const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
            if (!match) return 0;
            const [, h, m, s] = match.map((x) => Number(x) || 0);
            return h * 3600 + m * 60 + s;
          };

          const fetchDuration = async (vid) => {
            try {
              const details = await youtubeApi.getVideoDetails(vid);
              const iso = details?.contentDetails?.duration;
              const secs = isoToSeconds(iso);
              return secs ? `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}` : '';
            } catch (_) {
              return '';
            }
          };

          const handlePlayClick = async () => {
            // fetch duration for the clicked track
            const dur = await fetchDuration(track.id);
            const trackWithDur = { ...track, duration: dur };
            playTrack(trackWithDur);
            // build queue starting from next items
            const rest = results.slice(index + 1).map((it) => ({
              id: it.id?.videoId || it.videoId || it.id,
              title: getTitle(it),
              artist: getChannel(it),
              thumbnail: getThumbnail(it),
              duration: '',
            }));
            setQueue(rest);
          };
          return (
            <ListItem
              key={track.id || index}
              sx={{
                '&:hover': {
                  backgroundColor: 'var(--background-highlight)',
                },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  variant="square"
                  src={track.thumbnail}
                  alt={track.title}
                  sx={{ width: 56, height: 56, mr: 2 }}
                />
              </ListItemAvatar>
              <ListItemText
              sx={{ minWidth: 0 }}
                primary={truncateTitle(track.title)}
                secondary={track.artist}
                primaryTypographyProps={{ sx: { color: 'var(--text-base)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}
                secondaryTypographyProps={{ color: 'var(--text-subdued)' }}
              />
              <IconButton size="small" onClick={handlePlayClick} sx={{ ml: 1 }}>
                <PlayArrowIcon />
              </IconButton>
              <IconButton size="small" sx={{ ml: 0.5 }}>
                <MoreVertIcon />
              </IconButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default SearchResults;
