class YouTubeApi {
  constructor() {
    this._isAuthenticated = false;
  }

  async isAuthenticated() {
    try {
      const result = await window.electronAPI.youtube.isAuthenticated();
      this._isAuthenticated = result;
      return result;
    } catch (error) {

      return false;
    }
  }

  async getAuthUrl() {
    try {

      const authUrl = await window.electronAPI.youtube.getAuthUrl();

      return authUrl;
    } catch (error) {

      throw new Error(`Failed to start authentication process: ${error.message}`);
    }
  }

  async getTokens(code) {
    try {

      const tokens = await window.electronAPI.youtube.getTokens(code);
      if (tokens) {
        this._isAuthenticated = true;

      }
      return tokens;
    } catch (error) {

      throw new Error(`Failed to get authentication tokens: ${error.message}`);
    }
  }

  async searchVideos(query, maxResults = 10) {
    return await window.electronAPI.youtube.searchVideos(query, maxResults);
  }

  async getVideoDetails(videoId) {
    return await window.electronAPI.youtube.getVideoDetails(videoId);
  }

  async getUserPlaylists() {
    return await window.electronAPI.youtube.getUserPlaylists();
  }

  async getPlaylistItems(playlistId) {
    return await window.electronAPI.youtube.getPlaylistItems(playlistId);
  }

  // New: playlists that the user has saved/subscribed to (not created)
  async getLibraryPlaylists() {
    return await window.electronAPI.youtube.getLibraryPlaylists();
  }

  // New: playlists explicitly marked as "liked" by the user ("👍" on a playlist)
  async getLikedPlaylists() {
    return await window.electronAPI.youtube.getLikedPlaylists();
  }

  // Mixed search (videos + playlists in single call)
  async searchAll(query, maxResults = 25) {
    return await window.electronAPI.youtube.searchAll(query, maxResults);
  }

  // Search playlists
  async searchPlaylists(query, maxResults = 15) {
    return await window.electronAPI.youtube.searchPlaylists(query, maxResults);
  }

}

export const youtubeApi = new YouTubeApi(); 