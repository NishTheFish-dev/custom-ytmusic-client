import { ipcRenderer } from 'electron';

class PlaybackService {
  constructor() {
    this.currentTrack = null;
    this.isPlaying = false;
    this.volume = 1;
    this.currentTime = 0;
    this.duration = 0;
  }

  async play(track) {
    try {
      this.currentTrack = track;
      await ipcRenderer.invoke('play-track', track);
      this.isPlaying = true;
      return true;
    } catch (error) {
      console.error('Error playing track:', error);
      return false;
    }
  }

  async pause() {
    try {
      await ipcRenderer.invoke('pause-track');
      this.isPlaying = false;
      return true;
    } catch (error) {
      console.error('Error pausing track:', error);
      return false;
    }
  }

  async resume() {
    try {
      await ipcRenderer.invoke('resume-track');
      this.isPlaying = true;
      return true;
    } catch (error) {
      console.error('Error resuming track:', error);
      return false;
    }
  }

  async setVolume(volume) {
    try {
      await ipcRenderer.invoke('set-volume', volume);
      this.volume = volume;
      return true;
    } catch (error) {
      console.error('Error setting volume:', error);
      return false;
    }
  }

  async seekTo(time) {
    try {
      await ipcRenderer.invoke('seek-to', time);
      this.currentTime = time;
      return true;
    } catch (error) {
      console.error('Error seeking:', error);
      return false;
    }
  }

  getCurrentTrack() {
    return this.currentTrack;
  }

  getPlaybackState() {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration,
      volume: this.volume
    };
  }
}

export const playbackService = new PlaybackService(); 