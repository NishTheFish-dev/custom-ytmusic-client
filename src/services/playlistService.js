import { youtubeApi } from './youtubeApi';

class PlaylistService {
  constructor() {
    this.playlists = [];
    this.initialize();
  }

  async initialize() {
    try {
      const storedPlaylists = await window.electronAPI.playlist.getStoredPlaylists();
      if (storedPlaylists) {
        this.playlists = storedPlaylists;
      }
    } catch (error) {
      console.error('Error initializing playlist service:', error);
    }
  }

  async createPlaylist(name, description = '', isPrivate = false) {
    try {
      const playlist = await youtubeApi.createPlaylist(name, description, isPrivate);
      this.playlists.push(playlist);
      await this.savePlaylists();
      return playlist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  }

  async deletePlaylist(playlistId) {
    try {
      await youtubeApi.deletePlaylist(playlistId);
      this.playlists = this.playlists.filter(playlist => playlist.id !== playlistId);
      await this.savePlaylists();
      return true;
    } catch (error) {
      console.error('Error deleting playlist:', error);
      return false;
    }
  }

  async addToPlaylist(playlistId, trackId) {
    try {
      await youtubeApi.addToPlaylist(playlistId, trackId);
      const playlist = this.playlists.find(p => p.id === playlistId);
      if (playlist) {
        playlist.tracks = playlist.tracks || [];
        playlist.tracks.push(trackId);
        await this.savePlaylists();
      }
      return true;
    } catch (error) {
      console.error('Error adding to playlist:', error);
      return false;
    }
  }

  async removeFromPlaylist(playlistId, trackId) {
    try {
      await youtubeApi.removeFromPlaylist(playlistId, trackId);
      const playlist = this.playlists.find(p => p.id === playlistId);
      if (playlist && playlist.tracks) {
        playlist.tracks = playlist.tracks.filter(id => id !== trackId);
        await this.savePlaylists();
      }
      return true;
    } catch (error) {
      console.error('Error removing from playlist:', error);
      return false;
    }
  }

  async updatePlaylistDetails(playlistId, { name, description, isPrivate }) {
    try {
      await youtubeApi.updatePlaylist(playlistId, { name, description, isPrivate });
      const playlist = this.playlists.find(p => p.id === playlistId);
      if (playlist) {
        Object.assign(playlist, { name, description, isPrivate });
        await this.savePlaylists();
      }
      return true;
    } catch (error) {
      console.error('Error updating playlist:', error);
      return false;
    }
  }

  async reorderPlaylistItems(playlistId, trackIds) {
    try {
      await youtubeApi.reorderPlaylistItems(playlistId, trackIds);
      const playlist = this.playlists.find(p => p.id === playlistId);
      if (playlist) {
        playlist.tracks = trackIds;
        await this.savePlaylists();
      }
      return true;
    } catch (error) {
      console.error('Error reordering playlist:', error);
      return false;
    }
  }

  getPlaylists() {
    return this.playlists;
  }

  getPlaylist(playlistId) {
    return this.playlists.find(playlist => playlist.id === playlistId);
  }

  async savePlaylists() {
    try {
      await window.electronAPI.playlist.savePlaylists(this.playlists);
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  }

  async syncWithYouTube() {
    try {
      const youtubePlaylists = await youtubeApi.getUserPlaylists();
      this.playlists = youtubePlaylists;
      await this.savePlaylists();
      return true;
    } catch (error) {
      console.error('Error syncing playlists with YouTube:', error);
      return false;
    }
  }

  async getUserPlaylists() {
    try {
      const response = await window.electronAPI.youtube.getUserPlaylists();
      return response.items.map(playlist => ({
        id: playlist.id,
        title: playlist.snippet.title,
        description: playlist.snippet.description,
        thumbnail: playlist.snippet.thumbnails?.default?.url,
        itemCount: playlist.contentDetails.itemCount,
        channelTitle: playlist.snippet.channelTitle,
      }));
    } catch (error) {
      console.error('Error fetching playlists:', error);
      throw error;
    }
  }

  async getPlaylistItems(playlistId) {
    try {
      const response = await window.electronAPI.youtube.getPlaylistItems(playlistId);
      return response.items.map(item => ({
        id: item.contentDetails.videoId,
        title: item.snippet.title,
        artist: item.snippet.videoOwnerChannelTitle,
        thumbnail: item.snippet.thumbnails?.default?.url,
        duration: item.contentDetails.duration,
      }));
    } catch (error) {
      console.error('Error fetching playlist items:', error);
      throw error;
    }
  }
}

export const playlistService = new PlaylistService(); 