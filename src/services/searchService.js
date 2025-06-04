import axios from 'axios';
import { youtubeApi } from './youtubeApi';

class SearchService {
  constructor() {
    this.searchResults = [];
    this.searchHistory = [];
  }

  async search(query, type = 'all') {
    try {
      const response = await youtubeApi.search(query, type);
      this.searchResults = response.data.items;
      this.addToSearchHistory(query);
      return this.searchResults;
    } catch (error) {
      console.error('Error searching:', error);
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
      console.error('Error getting suggestions:', error);
      return [];
    }
  }
}

export const searchService = new SearchService(); 