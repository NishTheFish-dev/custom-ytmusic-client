import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { YouTubePlayer } from '../player/YouTubePlayer';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null); // {id,title,artist,thumbnail,duration}
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('volume');
    return saved !== null ? Number(saved) : 100;
  });
  const [progress, setProgress] = useState(0); // 0-100 percentage
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState([]);
  const [shuffle, setShuffle] = useState(false); // shuffle enable flag
  const fullPlaylistRef = useRef([]); // stores entire playlist when user initiates playback
  // store tracks that have already been played in the current session/playlist
  const playedHistoryRef = useRef([]);
  const [repeatMode, setRepeatMode] = useState(0); // 0 = none, 1 = all, 2 = one
  const originalQueueRef = useRef([]); // keep snapshot for repeat all
  const progressInterval = useRef(null);
  const lastSeekAtRef = useRef(0);
  // refs to keep latest mutable values inside event callbacks
  const queueRef = useRef(queue);
  const repeatModeRef = useRef(repeatMode);
  const currentTrackRef = useRef(currentTrack);

  // --- helpers ---
  const clearProgressTimer = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const startProgressTimer = () => {
    clearProgressTimer();
    progressInterval.current = setInterval(async () => {
      try {
        const dur = await YouTubePlayer.getDuration();
        if (!dur) return;
        const cur = await YouTubePlayer.getCurrentTime();
        setDuration(dur);
        // If a seek occurred very recently, skip one update to prevent rubber-band
      if (Date.now() - lastSeekAtRef.current < 800) return;
      setProgress((cur / dur) * 100);
      } catch (_) {}
    }, 1000);
  };

  // --- playback api exposed to consumers ---
  const parseDurationToSeconds = (dur) => {
    if (typeof dur === 'number') return dur;
    if (typeof dur !== 'string') return 0;
    const parts = dur.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  const playTrack = useCallback(async (track) => {
    if (!track) return;
    // Stop existing timers and reset UI immediately
    clearProgressTimer();
    // keep track of what we have already played (excluding first load)
    if (currentTrack) {
      // avoid duplicates – only push if not last in history
      const last = playedHistoryRef.current[playedHistoryRef.current.length - 1];
      if (!last || last.id !== currentTrack.id) {
        playedHistoryRef.current.push(currentTrack);
      }
    }
    setProgress(0);
    const initialDur = parseDurationToSeconds(track.duration);
    setDuration(initialDur);
    setIsPlaying(false);
    setCurrentTrack(track);
    // start playback
    await YouTubePlayer.play(track.id, volume);
    if (!initialDur) {
      // get actual duration once metadata loaded
      const dur = await YouTubePlayer.getDuration();
      if (dur) setDuration(dur);
    }
  }, [volume]);

  const togglePlay = useCallback(async () => {
    await YouTubePlayer.toggle();
  }, []);

  const pause = useCallback(async () => {
    await YouTubePlayer.pause();
  }, []);

  const seek = useCallback(async (percentage) => {
    lastSeekAtRef.current = Date.now();
    if (!currentTrack) return;
    const duration = await YouTubePlayer.getDuration();
    const seconds = (percentage / 100) * duration;
    await YouTubePlayer.seek(seconds);
    setProgress(percentage);
  }, [currentTrack]);

  const changeVolume = useCallback(async (vol) => {
    setVolume(vol);
    localStorage.setItem('volume', vol);
    await YouTubePlayer.setVolume(vol);
  }, []);

  // sync refs
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);

  // keep original queue snapshot when not shuffling
  useEffect(() => {
    if (!shuffle) {
      originalQueueRef.current = queue;
    }
  }, [queue, shuffle]);

  // events from player – register once
  useEffect(() => {
    const onPlay = () => {
      setIsPlaying(true);
      startProgressTimer();
    };
    const onPause = () => {
      setIsPlaying(false);
      clearProgressTimer();
    };
    const onEnded = () => {
      setIsPlaying(false);
      clearProgressTimer();
      const mode = repeatModeRef.current;
  const q = queueRef.current;
  const trackNow = currentTrackRef.current;
  if (mode === 2) {
        // repeat single – clone object to force state update
        playTrack({ ...trackNow });
        return;
      }
      if (q.length) {
        const [next, ...rest] = q;
        setQueue(rest);
        playTrack(next);
      } else if (mode === 1 && originalQueueRef.current.length) {
        // repeat all
        const [first, ...rest] = originalQueueRef.current;
        setQueue(rest);
        playTrack(first);
      }
    };
    YouTubePlayer.on('play', onPlay);
    YouTubePlayer.on('pause', onPause);
    YouTubePlayer.on('ended', onEnded);
    return () => {
      YouTubePlayer.off('play', onPlay);
      YouTubePlayer.off('pause', onPause);
      YouTubePlayer.off('ended', onEnded);
      // do not clear progress timer here; onPause/onEnded will manage
    };
  }, []);

  const setFullPlaylist = (arr = []) => { fullPlaylistRef.current = arr; };

  const value = {
    currentTrack,
    isPlaying,
    volume,
    progress,
    duration,
    queue,
    playTrack,
    togglePlay,
    pause,
    seek,
    changeVolume,
    setQueue,
    setFullPlaylist,
    shuffle,
    repeatMode,
    toggleShuffle: () => setShuffle(prev => {
      if (!prev) {
        // turning ON: snapshot current order and shuffle queue
        // Build a list containing every other song in the playlist except the current track
        const baseList = fullPlaylistRef.current.length ? fullPlaylistRef.current : [...playedHistoryRef.current, ...queue, currentTrack].filter(Boolean);
        const others = baseList.filter(t => t.id !== currentTrack?.id);
        originalQueueRef.current = others;
        const shuffled = [...others];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setQueue(shuffled);
      } else {
        // turning OFF: restore original order continuing after current track
        if (originalQueueRef.current.length) {
          const idx = originalQueueRef.current.findIndex(t => t.id === currentTrack?.id);
          const nextQueue = idx >= 0 ? originalQueueRef.current.slice(idx + 1) : originalQueueRef.current;
          setQueue(nextQueue);
        }
      }
      return !prev;
    }),
    cycleRepeat: () => setRepeatMode(prev => (prev + 1) % 3),
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const useAudio = () => useContext(AudioContext);
