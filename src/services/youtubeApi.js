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
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  async getAuthUrl() {
    try {
      console.log('Requesting auth URL...');
      const authUrl = await window.electronAPI.youtube.getAuthUrl();
      console.log('Auth URL received:', authUrl);
      return authUrl;
    } catch (error) {
      console.error('Error getting auth URL:', error);
      throw new Error(`Failed to start authentication process: ${error.message}`);
    }
  }

  async getTokens(code) {
    try {
      console.log('Requesting tokens...');
      const tokens = await window.electronAPI.youtube.getTokens(code);
      if (tokens) {
        this._isAuthenticated = true;
        console.log('Successfully authenticated');
      }
      return tokens;
    } catch (error) {
      console.error('Error getting tokens:', error);
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
}

export const youtubeApi = new YouTubeApi(); 