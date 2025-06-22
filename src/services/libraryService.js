import { youtubeApi } from './youtubeApi';
import Store from 'electron-store';

class LibraryService {
  constructor() {
    this.store = new Store();
    this.library = this.store.get('library') || {
      likedSongs: [],
      playlists: [],
      recentlyPlayed: [],
      albums: [],
      artists: []
    };
  }

  async addToLibrary(item, type) {
    try {
      switch (type) {
        case 'liked':
          if (!this.library.likedSongs.find(song => song.id === item.id)) {
            this.library.likedSongs.push(item);
          }
          break;
        case 'playlist':
          if (!this.library.playlists.find(playlist => playlist.id === item.id)) {
            this.library.playlists.push(item);
          }
          break;
        case 'album':
          if (!this.library.albums.find(album => album.id === item.id)) {
            this.library.albums.push(item);
          }
          break;
        case 'artist':
          if (!this.library.artists.find(artist => artist.id === item.id)) {
            this.library.artists.push(item);
          }
          break;
      }
      this.saveLibrary();
      return true;
    } catch (error) {

      return false;
    }
  }

  async removeFromLibrary(itemId, type) {
    try {
      switch (type) {
        case 'liked':
          this.library.likedSongs = this.library.likedSongs.filter(song => song.id !== itemId);
          break;
        case 'playlist':
          this.library.playlists = this.library.playlists.filter(playlist => playlist.id !== itemId);
          break;
        case 'album':
          this.library.albums = this.library.albums.filter(album => album.id !== itemId);
          break;
        case 'artist':
          this.library.artists = this.library.artists.filter(artist => artist.id !== itemId);
          break;
      }
      this.saveLibrary();
      return true;
    } catch (error) {

      return false;
    }
  }

  addToRecentlyPlayed(item) {
    try {
      this.library.recentlyPlayed = [
        item,
        ...this.library.recentlyPlayed.filter(song => song.id !== item.id)
      ].slice(0, 50); // Keep only last 50 items
      this.saveLibrary();
    } catch (error) {

    }
  }

  getLibrary() {
    return this.library;
  }

  saveLibrary() {
    this.store.set('library', this.library);
  }

  async syncWithYouTube() {
    try {
      // Fetch user's YouTube Music library
      const [likedSongs, playlists, albums, artists] = await Promise.all([
        youtubeApi.getLikedSongs(),
        youtubeApi.getUserPlaylists(),
        youtubeApi.getUserAlbums(),
        youtubeApi.getUserArtists()
      ]);

      this.library = {
        likedSongs,
        playlists,
        albums,
        artists,
        recentlyPlayed: this.library.recentlyPlayed // Preserve recently played
      };

      this.saveLibrary();
      return true;
    } catch (error) {

      return false;
    }
  }
}

export const libraryService = new LibraryService(); 