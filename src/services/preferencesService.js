class PreferencesService {
  constructor() {
    this.preferences = null;
    this.initialize();
  }

  async initialize() {
    try {
      this.preferences = await window.electronAPI.preferences.get();
    } catch (error) {

      this.preferences = {
        windowBounds: {
          width: 1600,
          height: 1000
        },
        sidebarWidth: 240
      };
    }
  }

  async getPreferences() {
    if (!this.preferences) {
      await this.initialize();
    }
    return this.preferences;
  }

  async setPreferences(preferences) {
    try {
      await window.electronAPI.preferences.set(preferences);
      this.preferences = preferences;
      return true;
    } catch (error) {

      return false;
    }
  }

  async updateSidebarWidth(width) {
    const preferences = await this.getPreferences();
    preferences.sidebarWidth = width;
    return this.setPreferences(preferences);
  }
}

export const preferencesService = new PreferencesService(); 