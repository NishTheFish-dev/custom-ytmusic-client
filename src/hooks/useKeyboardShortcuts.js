import { useEffect } from 'react';
import { useAudio } from '../context/AudioContext';

export const useKeyboardShortcuts = () => {
  const { 
    isPlaying, 
    togglePlay, 
    changeVolume, 
    volume,
    next,
    previous
  } = useAudio();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle if not in an input field
      if (document.activeElement.tagName === 'INPUT') return;

      // Ctrl + Shift + Space - Play/Pause
      if (e.ctrlKey && e.shiftKey && e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
      // Ctrl + Shift + PageUp - Next
      else if (e.ctrlKey && e.shiftKey && e.code === 'PageUp') {
        e.preventDefault();
        next();
      }
      // Ctrl + Shift + PageDown - Previous
      else if (e.ctrlKey && e.shiftKey && e.code === 'PageDown') {
        e.preventDefault();
        previous();
      }
      // Ctrl + Shift + ArrowUp - Increase Volume
      else if (e.ctrlKey && e.shiftKey && e.code === 'ArrowUp') {
        e.preventDefault();
        const newVolume = Math.min(100, volume + 5);
        changeVolume(newVolume);
      }
      // Ctrl + Shift + ArrowDown - Decrease Volume
      else if (e.ctrlKey && e.shiftKey && e.code === 'ArrowDown') {
        e.preventDefault();
        const newVolume = Math.max(0, volume - 5);
        changeVolume(newVolume);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [volume, togglePlay, changeVolume, next, previous]);

  return null; // This hook doesn't render anything
};
