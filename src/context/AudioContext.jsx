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
  const progressInterval = useRef(null);

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
    setProgress(0);
    setDuration(parseDurationToSeconds(track.duration));
    setIsPlaying(false);
    setCurrentTrack(track);
    // apply volume first so playback starts at desired level
    await YouTubePlayer.play(track.id, volume);
  }, [volume]);

  const togglePlay = useCallback(async () => {
    await YouTubePlayer.toggle();
  }, []);

  const pause = useCallback(async () => {
    await YouTubePlayer.pause();
  }, []);

  const seek = useCallback(async (percentage) => {
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

  // events from player
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
      // auto next
      if (queue.length) {
        const [next, ...rest] = queue;
        setQueue(rest);
        playTrack(next);
      }
    };
    YouTubePlayer.on('play', onPlay);
    YouTubePlayer.on('pause', onPause);
    YouTubePlayer.on('ended', onEnded);
    return () => {
      YouTubePlayer.off('play', onPlay);
      YouTubePlayer.off('pause', onPause);
      YouTubePlayer.off('ended', onEnded);
      clearProgressTimer();
    };
  }, [queue, playTrack]);

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
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const useAudio = () => useContext(AudioContext);
