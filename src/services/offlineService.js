import Store from 'electron-store';
import { ipcRenderer } from 'electron';
import { youtubeApi } from './youtubeApi';

class OfflineService {
  constructor() {
    this.store = new Store();
    this.offlineData = this.store.get('offlineData') || {
      tracks: [],
      playlists: [],
      albums: [],
      artists: []
    };
    this.isOfflineMode = false;
  }

  async enableOfflineMode() {
    try {
      this.isOfflineMode = true;
      this.store.set('isOfflineMode', true);
      return true;
    } catch (error) {

      return false;
    }
  }

  disableOfflineMode() {
    try {
      this.isOfflineMode = false;
      this.store.set('isOfflineMode', false);
      return true;
    } catch (error) {

      return false;
    }
  }

  async downloadTrack(track) {
    try {
      const trackData = await youtubeApi.getTrackData(track.id);
      const audioData = await ipcRenderer.invoke('download-audio', trackData.streamUrl);
      
      const offlineTrack = {
        ...track,
        offlineData: audioData,
        downloadedAt: new Date().toISOString()
      };

      this.offlineData.tracks.push(offlineTrack);
      this.saveOfflineData();
      return offlineTrack;
    } catch (error) {

      throw error;
    }
  }

  async downloadPlaylist(playlist) {
    try {
      const tracks = await youtubeApi.getPlaylistTracks(playlist.id);
      const downloadedTracks = [];

      for (const track of tracks) {
        try {
          const downloadedTrack = await this.downloadTrack(track);
          downloadedTracks.push(downloadedTrack);
        } catch (error) {
          console.error(`Error downloading track ${track.id}:`, error);
        }
      }

      const offlinePlaylist = {
        ...playlist,
        tracks: downloadedTracks,
        downloadedAt: new Date().toISOString()
      };

      this.offlineData.playlists.push(offlinePlaylist);
      this.saveOfflineData();
      return offlinePlaylist;
    } catch (error) {

      throw error;
    }
  }

  async downloadAlbum(album) {
    try {
      const tracks = await youtubeApi.getAlbumTracks(album.id);
      const downloadedTracks = [];

      for (const track of tracks) {
        try {
          const downloadedTrack = await this.downloadTrack(track);
          downloadedTracks.push(downloadedTrack);
        } catch (error) {
          console.error(`Error downloading track ${track.id}:`, error);
        }
      }

      const offlineAlbum = {
        ...album,
        tracks: downloadedTracks,
        downloadedAt: new Date().toISOString()
      };

      this.offlineData.albums.push(offlineAlbum);
      this.saveOfflineData();
      return offlineAlbum;
    } catch (error) {

      throw error;
    }
  }

  removeOfflineTrack(trackId) {
    try {
      this.offlineData.tracks = this.offlineData.tracks.filter(track => track.id !== trackId);
      this.saveOfflineData();
      return true;
    } catch (error) {

      return false;
    }
  }

  removeOfflinePlaylist(playlistId) {
    try {
      this.offlineData.playlists = this.offlineData.playlists.filter(playlist => playlist.id !== playlistId);
      this.saveOfflineData();
      return true;
    } catch (error) {

      return false;
    }
  }

  removeOfflineAlbum(albumId) {
    try {
      this.offlineData.albums = this.offlineData.albums.filter(album => album.id !== albumId);
      this.saveOfflineData();
      return true;
    } catch (error) {

      return false;
    }
  }

  getOfflineTrack(trackId) {
    return this.offlineData.tracks.find(track => track.id === trackId);
  }

  getOfflinePlaylist(playlistId) {
    return this.offlineData.playlists.find(playlist => playlist.id === playlistId);
  }

  getOfflineAlbum(albumId) {
    return this.offlineData.albums.find(album => album.id === albumId);
  }

  getAllOfflineTracks() {
    return this.offlineData.tracks;
  }

  getAllOfflinePlaylists() {
    return this.offlineData.playlists;
  }

  getAllOfflineAlbums() {
    return this.offlineData.albums;
  }

  isTrackOffline(trackId) {
    return this.offlineData.tracks.some(track => track.id === trackId);
  }

  isPlaylistOffline(playlistId) {
    return this.offlineData.playlists.some(playlist => playlist.id === playlistId);
  }

  isAlbumOffline(albumId) {
    return this.offlineData.albums.some(album => album.id === albumId);
  }

  saveOfflineData() {
    this.store.set('offlineData', this.offlineData);
  }

  getOfflineModeStatus() {
    return this.isOfflineMode;
  }
}

export const offlineService = new OfflineService(); 