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

    }
  }

  async createPlaylist(name, description = '', isPrivate = false) {
    try {
      const playlist = await youtubeApi.createPlaylist(name, description, isPrivate);
      this.playlists.push(playlist);
      await this.savePlaylists();
      return playlist;
    } catch (error) {

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

    }
  }

  async syncWithYouTube() {
    try {
      const youtubePlaylists = await youtubeApi.getUserPlaylists();
      this.playlists = youtubePlaylists;
      await this.savePlaylists();
      return true;
    } catch (error) {

      return false;
    }
  }

  // Fetch playlists created by the user (ownership)
  async getUserPlaylists() {
    try {
      const response = await window.electronAPI.youtube.getUserPlaylists();
      return response.items.map(playlist => ({
        id: playlist.id,
        title: playlist.snippet.title,
        description: playlist.snippet.description,
        thumbnail: playlist.snippet.thumbnails?.maxres?.url || 
                  playlist.snippet.thumbnails?.high?.url || 
                  playlist.snippet.thumbnails?.default?.url,
        itemCount: playlist.contentDetails.itemCount,
        channelTitle: playlist.snippet.channelTitle,
      }));
    } catch (error) {

      throw error;
    }
  }

  // Fetch playlists that the user has saved (but may not own)
  async getLibraryPlaylists() {
    try {
      const response = await window.electronAPI.youtube.getLibraryPlaylists();
      const items = response.items || response; // bridge might already map
      return items.map(this._mapPlaylist);
    } catch (error) {
      throw error;
    }
  }

  // Fetch playlists that the user has explicitly liked (thumbs-up on playlist)
  async getLikedPlaylists() {
    try {
      const response = await window.electronAPI.youtube.getLikedPlaylists();
      const items = response.items || response;
      return items.map(this._mapPlaylist);
    } catch (error) {
      throw error;
    }
  }

  // Convenience: merge all three playlist categories
  async getAllPlaylists() {
    const [created, saved, liked] = await Promise.all([
      this.getUserPlaylists(),
      this.getLibraryPlaylists(),
      this.getLikedPlaylists(),
    ]);
    // Deduplicate by id (liked/saved could overlap)
    const map = new Map();
    [...created, ...saved, ...liked].forEach(pl => {
      if (!map.has(pl.id)) map.set(pl.id, pl);
    });
    return Array.from(map.values());
  }

  // Internal helper to normalise API playlist objects
  _mapPlaylist(playlist) {
    return {
      id: playlist.id,
      title: playlist.snippet?.title ?? playlist.title,
      description: playlist.snippet?.description ?? playlist.description,
      thumbnail:
        playlist.snippet?.thumbnails?.maxres?.url ||
        playlist.snippet?.thumbnails?.high?.url ||
        playlist.snippet?.thumbnails?.default?.url ||
        playlist.thumbnail,
      itemCount: playlist.contentDetails?.itemCount ?? playlist.itemCount,
      channelTitle: playlist.snippet?.channelTitle ?? playlist.channelTitle,
    };
  }

  async getPlaylistItems(playlistId) {
    try {
      const response = await window.electronAPI.youtube.getPlaylistItems(playlistId);
      return response.items.map(item => ({
        id: item.contentDetails.videoId,
        title: item.snippet.title,
        artist: item.snippet.videoOwnerChannelTitle,
        thumbnail: item.snippet.thumbnails?.maxres?.url || 
                  item.snippet.thumbnails?.high?.url || 
                  item.snippet.thumbnails?.default?.url,
        duration: item.contentDetails.duration,
      }));
    } catch (error) {

      throw error;
    }
  }

  async getPlaylistItemsIncremental(playlistId, onPageLoaded) {
    let allItems = [];
    let nextPageToken = null;
    let first = true;
    let error = null;
    do {
      const response = await window.electronAPI.youtube.getPlaylistItems(playlistId, nextPageToken);
      if (response.error) {
        error = response.error;
        break;
      }
      const items = Array.isArray(response.items) ? response.items.map(item => ({
        id: item.contentDetails?.videoId,
        title: item.snippet?.title,
        artist: item.snippet?.videoOwnerChannelTitle,
        thumbnail: item.snippet?.thumbnails?.maxres?.url || 
                  item.snippet?.thumbnails?.high?.url || 
                  item.snippet?.thumbnails?.default?.url,
        duration: item.contentDetails?.duration,
      })) : [];
      allItems = allItems.concat(items);
      if (onPageLoaded) onPageLoaded([...allItems], items, response.nextPageToken, first, null);
      first = false;
      nextPageToken = response.nextPageToken;
    } while (nextPageToken);
    if (error && onPageLoaded) onPageLoaded([...allItems], [], null, first, error);
    if (!error && allItems.length === 0 && onPageLoaded) onPageLoaded([], [], null, true, null);
    return allItems;
  }

  // Fetch a single page of playlist items
  async getPlaylistItemsPage(playlistId, pageToken = null) {
    try {
      const response = await window.electronAPI.youtube.getPlaylistItems(playlistId, pageToken);
      const items = Array.isArray(response.items)
        ? response.items.map(item => ({
            id: item.contentDetails?.videoId,
            title: item.snippet?.title,
            artist: item.snippet?.videoOwnerChannelTitle,
            thumbnail:
              item.snippet?.thumbnails?.maxres?.url ||
              item.snippet?.thumbnails?.high?.url ||
              item.snippet?.thumbnails?.default?.url,
            duration: item.contentDetails?.duration,
          }))
        : [];
      return { items, nextPageToken: response.nextPageToken };
    } catch (error) {

      return { items: [], nextPageToken: null };
    }
  }
}

export const playlistService = new PlaylistService(); 