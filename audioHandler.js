const { ipcMain } = require('electron');
const { app } = require('electron');
const { join } = require('path');
const https = require('https');
const { createWriteStream } = require('fs');

class AudioHandler {
  constructor() {
    this.currentTrack = null;
    this.isPlaying = false;
    this.volume = 1;
    this.cacheDir = join(app.getPath('userData'), 'cache');
    this.setupIpcHandlers();
  }

  setupIpcHandlers() {
    ipcMain.handle('audio:play', async (event, track) => {
      try {
        await this.play(track);
        return true;
      } catch (error) {
        console.error('Error playing audio:', error);
        throw error;
      }
    });

    ipcMain.handle('audio:pause', () => this.pause());
    ipcMain.handle('audio:resume', () => this.resume());
    ipcMain.handle('audio:stop', () => this.stop());
    ipcMain.handle('audio:seek', (event, time) => this.seek(time));
    ipcMain.handle('audio:setVolume', (event, volume) => this.setVolume(volume));
    ipcMain.handle('audio:getCurrentTime', () => this.getCurrentTime());
  }

  async play(track) {
    try {
      // Stop any existing playback
      this.stop();

      // Store track info
      this.currentTrack = {
        id: track.id,
        title: track.title,
        duration: track.duration,
        artist: track.artist,
        thumbnail: track.thumbnail
      };

      // Get stream URL
      const streamUrl = await this.getStreamUrl(track.id);
      
      // Start playback
      this.isPlaying = true;
      ipcMain.emit('audio:playing', {
        ...this.currentTrack,
        streamUrl
      });

    } catch (error) {
      console.error('Error in play:', error);
      throw error;
    }
  }

  async getStreamUrl(videoId) {
    return new Promise((resolve, reject) => {
      const url = `https://www.youtube.com/watch?v=${videoId}`;
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            // Extract player config
            const configMatch = data.match(/ytplayer\.config\s*=\s*({.+?});/);
            if (!configMatch) {
              throw new Error('Could not extract player config');
            }
            
            // Parse the config safely
            let playerConfig;
            try {
              playerConfig = JSON.parse(configMatch[1]);
            } catch (parseError) {
              console.error('Error parsing player config:', parseError);
              throw new Error('Invalid player config format');
            }

            if (!playerConfig.streamingData || !playerConfig.streamingData.adaptiveFormats) {
              throw new Error('No streaming data found in player config');
            }

            const formats = playerConfig.streamingData.adaptiveFormats;
            
            // Get the best audio format
            const audioFormat = formats
              .filter(format => format.mimeType && format.mimeType.includes('audio'))
              .sort((a, b) => b.bitrate - a.bitrate)[0];

            if (!audioFormat) {
              throw new Error('No suitable audio format found');
            }

            resolve(audioFormat.url);
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', (error) => {
        console.error('Error fetching video page:', error);
        reject(error);
      });
    });
  }

  pause() {
    this.isPlaying = false;
    ipcMain.emit('audio:paused');
  }

  resume() {
    this.isPlaying = true;
    ipcMain.emit('audio:resumed');
  }

  stop() {
    this.isPlaying = false;
    this.currentTrack = null;
    ipcMain.emit('audio:stopped');
  }

  seek(time) {
    if (!this.currentTrack) return;
    ipcMain.emit('audio:seeked', time);
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    ipcMain.emit('audio:volume', this.volume);
  }

  getCurrentTime() {
    return this.currentTrack ? this.currentTrack.currentTime || 0 : 0;
  }
}

module.exports = new AudioHandler(); 