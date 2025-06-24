import axios from 'axios';
import { youtubeApi } from './youtubeApi';

class SearchService {
  constructor() {
    this.searchResults = [];
    this.searchHistory = [];
  }

  async search(query, type = 'all') {
    try {
      let combined = [];

      if (type === 'all') {
        try {
          const res = await youtubeApi.searchAll(query, 25);
          const items = Array.isArray(res) ? res : res.items || res.data?.items || [];
          combined = items.map(item => {
            const resultType = item.id?.kind?.includes('playlist') || item.id?.playlistId ? 'playlist' : 'video';
            return { ...item, _resultType: resultType };
          });
        } catch (err) {
          // Fallback to separate calls if unified search fails (older token scopes, etc.)
          console.warn('searchAll failed, falling back to separate calls', err);
          type = 'fallback';
        }
      }
      if (type !== 'all' && type !== 'fallback') {
        // handled above
      }
      if (type === 'fallback') {

        const tasks = [];
        // After failure of unified search, fetch both videos and playlists separately
        const includeVideos = true;
        const includePlaylists = true;

        if (includeVideos) {
          tasks.push(
            youtubeApi.searchVideos(query, 25).then(res => {
              const items = Array.isArray(res) ? res : res.items || res.data?.items || [];
              return items.map(item => ({ ...item, _resultType: 'video' }));
            })
          );
        }
        if (includePlaylists) {
          tasks.push(
            youtubeApi.searchPlaylists(query, 25).then(res => {
              const items = Array.isArray(res) ? res : res.items || res.data?.items || [];
              return items.map(item => ({ ...item, _resultType: 'playlist' }));
            })
          );
        }
        const nested = await Promise.all(tasks);
        combined = nested.flat();
      }

      this.searchResults = combined;
      this.addToSearchHistory(query);
      return this.searchResults;
    } catch (error) {
      throw error;
    }
  }

  addToSearchHistory(query) {
    if (!this.searchHistory.includes(query)) {
      this.searchHistory.unshift(query);
      // Keep only last 10 searches
      if (this.searchHistory.length > 10) {
        this.searchHistory.pop();
      }
    }
  }

  getSearchHistory() {
    return this.searchHistory;
  }

  clearSearchHistory() {
    this.searchHistory = [];
  }

  async getSuggestions(query) {
    try {
      const response = await axios.get(`https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}`);
      return response.data[1];
    } catch (error) {

      return [];
    }
  }
}

export const searchService = new SearchService(); 