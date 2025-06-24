import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAudio } from '../../context/AudioContext';

import { Box, Typography, IconButton, CircularProgress, Skeleton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import { playlistService } from '../../services/playlistService';
import { FixedSizeList as List, areEqual } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";

const BATCH_SIZE = 50;
const DEBOUNCE_MS = 150;
const PREFETCH_DISTANCE = 300;
const ITEM_HEIGHT = 64;
const WINDOW_SIZE = 30;
const WINDOW_BUFFER = 10;
const TRACK_ROW_HEIGHT = 68;
const FAST_SCROLL_SPEED = 8; // px per ms ~2000px/s
const PLAYER_BAR_HEIGHT = 90;
const STICKY_HEADER_HEIGHT = 152; // px (120px image + 2*16px py + margins)

const PlaylistTracks = ({ playlist, isQueueOpen }) => {
  // Recalculate row layout instantly when queue visibility toggles
  const listRef = useRef();
  
  const truncateTitle = (title) => {
    if (!isQueueOpen) return title;
    const maxLength = 30; // Adjust based on your layout
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  };
  const { playTrack, queue, setQueue, setFullPlaylist, shuffle } = useAudio();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageToken, setPageToken] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Use a requestId to prevent race conditions
  const requestIdRef = useRef(0);
  
  const [fastScroll, setFastScroll] = useState(false);
  const itemData = useMemo(() => ({ tracks, fastScroll }), [tracks, fastScroll]);

  // When the queue opens/closes, the list width changes. Prompt react-window to
  // recompute item positions immediately to avoid the brief "stuck" visuals.
  useEffect(() => {
    if (listRef.current && typeof listRef.current.resetAfterIndex === 'function') {
      // false => don't force a re-render of visible rows, just recalc sizes
      listRef.current.resetAfterIndex(0, false);
    }
  }, [isQueueOpen]);
  const lastScrollRef = useRef({ offset: 0, time: Date.now() });
  const scrollTimeoutRef = useRef(null);

  // Refs for always-latest state
  const pageTokenRef = useRef(null);
  const tracksRef = useRef([]);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const lastLoadedPageTokenRef = useRef(null);
  const initialLoadInProgressRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => { pageTokenRef.current = pageToken; }, [pageToken]);
  useEffect(() => { tracksRef.current = tracks; }, [tracks]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);

  // Simple initial load
  useEffect(() => {
    const fetchInitial = async () => {
      if (!playlist?.id) return;
      setLoading(true);
      try {
        const { items, nextPageToken } = await playlistService.getPlaylistItemsPage(
          playlist.id,
          null
        );
        setTracks(items);
        setPageToken(nextPageToken);
        setHasMore(!!nextPageToken);
        setInitialLoad(false);
      } catch (_) {
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, [playlist?.id]);

  // Stable function to load more tracks (initial and subsequent pages)
  const loadMoreTracks = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current || !playlist?.id) return;
    const currentPageToken = pageTokenRef.current;
    // Prevent loading the same pageToken twice, but allow the first load (when both are null)
    if (
      lastLoadedPageTokenRef.current !== null &&
      lastLoadedPageTokenRef.current === currentPageToken
    ) return;
    lastLoadedPageTokenRef.current = currentPageToken;
    loadingRef.current = true;
    setLoading(true);
    const thisRequestId = requestIdRef.current;
    const currentPlaylistId = playlist.id;
    try {
      const { items, nextPageToken } = await playlistService.getPlaylistItemsPage(
        currentPlaylistId,
        currentPageToken
      );
      if (requestIdRef.current !== thisRequestId || currentPlaylistId !== playlist.id) {
        return;
      }
      setTracks(prev => [...prev, ...items]);
      setPageToken(nextPageToken);
      setHasMore(!!nextPageToken);
      setInitialLoad(false);
      // Mark initial load as done after first batch
      if (initialLoadInProgressRef.current) initialLoadInProgressRef.current = false;
    } catch (err) {

      if (requestIdRef.current === thisRequestId) {
        setHasMore(false);
      }
    } finally {
      if (requestIdRef.current === thisRequestId) {
        setLoading(false);
      }
      loadingRef.current = false;
    }
  }, [playlist]);

  // Reset state when playlist changes and trigger first load
  useEffect(() => {
    requestIdRef.current++;
    setTracks([]);
    setPageToken(null);
    setHasMore(true);
    setInitialLoad(true);
    setLoading(false);
    pageTokenRef.current = null;
    tracksRef.current = [];
    hasMoreRef.current = true;
    loadingRef.current = false;
    lastLoadedPageTokenRef.current = null;
    initialLoadInProgressRef.current = false;
    if (listRef.current) {
      listRef.current.scrollToItem(0, 'start');
    }
    if (playlist?.id) {
      initialLoadInProgressRef.current = true;
      Promise.resolve().then(() => {
        loadMoreTracks();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlist?.id]);

  // Fallback: if initial paged fetch returns no items, try full fetch
  useEffect(() => {
    if (!initialLoad && !loading && tracks.length === 0 && playlist?.id) {
      (async () => {
        try {
          setLoading(true);
          const all = await playlistService.getPlaylistItems(playlist.id);
          setTracks(all);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [initialLoad, loading, tracks.length, playlist?.id]);

  // Scroll speed detection
  const handleScroll = ({ scrollOffset }) => {
    const now = Date.now();
    const deltaPx = Math.abs(scrollOffset - lastScrollRef.current.offset);
    const deltaT = now - lastScrollRef.current.time;
    const speed = deltaT ? deltaPx / deltaT : 0; // px per ms
    lastScrollRef.current = { offset: scrollOffset, time: now };

    if (speed > FAST_SCROLL_SPEED && !fastScroll) {
      setFastScroll(true);
    }
    // Clear previous timer and schedule turning fastScroll off
    clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => setFastScroll(false), 180);
  };

  // Infinite scroll handler
  const handleItemsRendered = useCallback(({ visibleStopIndex }) => {
    // Only allow infinite scroll if at least one track is loaded
    if (tracksRef.current.length === 0) return;
    if (
      hasMoreRef.current &&
      !loadingRef.current &&
      visibleStopIndex >= tracksRef.current.length - 10
    ) {
      loadMoreTracks();
    }
  }, [loadMoreTracks]);

  if (initialLoad && tracks.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress size={24} sx={{ color: 'var(--text-base)' }} />
      </Box>
    );
  }

  if (!initialLoad && !loading && !tracks.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No tracks found in this playlist</Typography>
      </Box>
    );
  }

  // Skeleton row for loading
  const SkeletonRow = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 1, height: TRACK_ROW_HEIGHT }}>
      <Skeleton variant="text" width={40} height={24} sx={{ mr: 2 }} />
      <Skeleton variant="rectangular" width={40} height={40} sx={{ mr: 2 }} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="40%" height={18} />
      </Box>
      <Skeleton variant="text" width={60} height={24} sx={{ ml: 2 }} />
      <Skeleton variant="circular" width={32} height={32} sx={{ ml: 2 }} />
      <Skeleton variant="circular" width={32} height={32} sx={{ ml: 1 }} />
    </Box>
  );

  // Row renderer for react-window
  // Row renderer for react-window (memoized for performance)
const Row = React.memo(({ index, style, data }) => {
  const { tracks: rowTracks, fastScroll: isFastScroll } = data;
  const track = rowTracks[index];
  if (!track) return null;

  // Placeholder during very fast scroll
  if (isFastScroll) {
    return (
      <Box style={style} sx={{ height: TRACK_ROW_HEIGHT, px: 2, display: 'flex', alignItems: 'center' }}>
        <Skeleton variant="rectangular" width="100%" height={40} />
      </Box>
    );
  }

  const handlePlayClick = () => {
    setFullPlaylist(rowTracks);
    if (!track.id) return;
    playTrack({
      id: track.id,
      title: track.title,
      artist: track.artist,
      thumbnail: track.thumbnail,
      duration: track.duration,
    });
    const rest = shuffle
      ? rowTracks.filter(t => t.id !== track.id).sort(() => Math.random() - 0.5)
      : rowTracks.slice(index + 1);
    setQueue(rest);
  };

  return (
    <Box
      style={style}
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 2,
        px: 1,
        height: TRACK_ROW_HEIGHT,
        '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
        '&:hover .track-number': { display: 'none' },
        '&:hover .play-btn': { visibility: 'visible' },
      }}
    >
      {/* Index / Play button */}
      <Box sx={{ width: 40, textAlign: 'center', position: 'relative' }}>
        <Typography className="track-number" sx={{ color: 'var(--text-subdued)', fontSize: '1.1rem' }}>
          {index + 1}
        </Typography>
        <IconButton
          className="play-btn"
          size="small"
          onClick={handlePlayClick}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            visibility: 'hidden',
            p: 0.5,
          }}
        >
          <PlayArrowIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Thumbnail and titles */}
      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, ml: 2 }}>
        <img
          src={track.thumbnail}
          alt={track.title}
          style={{ width: 40, height: 40, objectFit: 'cover', marginRight: 16 }}
        />
        <Box>
          <Typography
            sx={{
              color: 'var(--text-base)',
              fontSize: '1.05rem',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {truncateTitle(track.title)}
          </Typography>
          <Typography sx={{ color: 'var(--text-subdued)', fontSize: '0.95rem' }}>
            {track.artist}
          </Typography>
        </Box>
      </Box>

      {/* Duration */}
      <Typography sx={{ color: 'var(--text-subdued)', fontSize: '1.05rem', width: 100, textAlign: 'right' }}>
        {track.duration}
      </Typography>
    </Box>
  );
}, areEqual);



  // Main layout container
  return (
    <div className="playlist-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Playlist header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        px: 4, 
        py: 4, 
        position: 'sticky', 
        top: 0, 
        zIndex: 2, 
        background: 'var(--background-base)',
        borderBottom: '1px solid var(--background-tinted-base)'
      }}>
        <img
          src={playlist?.thumbnail}
          alt={playlist?.title}
          style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, marginRight: 32 }}
        />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {playlist?.title}
          </Typography>
          <Typography sx={{ color: 'var(--text-subdued)', fontSize: '0.9rem', mt: 0.5 }}>
            {playlist?.channelTitle} • {(tracks.length || playlist?.itemCount || 0)} songs
          </Typography>
        </Box>
      </Box>
      
      {/* Track List (react-window) */}
      <Box sx={{ flex: 1, minHeight: 0, height: '100%' }}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              width={width}
              itemCount={tracks.length}
              itemSize={TRACK_ROW_HEIGHT}
              itemData={itemData}
              overscanCount={12}
              onScroll={handleScroll}
              onItemsRendered={handleItemsRendered}
              itemKey={(index) => tracks[index]?.id || index}
              ref={listRef}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </Box>
    </div>
  );
};

export default PlaylistTracks; 