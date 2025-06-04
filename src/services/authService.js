class AuthService {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
  }

  async initialize() {
    try {
      const storedUser = await window.electronAPI.auth.getStoredUser();
      if (storedUser) {
        this.user = storedUser;
        this.isAuthenticated = true;
      }
    } catch (error) {
      console.error('Error initializing auth service:', error);
      throw error;
    }
  }

  async login() {
    try {
      const user = await window.electronAPI.auth.login();
      this.user = user;
      this.isAuthenticated = true;
      return user;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await window.electronAPI.auth.logout();
      this.user = null;
      this.isAuthenticated = false;
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  }

  async refreshAccessToken() {
    try {
      const user = await window.electronAPI.auth.refreshAccessToken();
      this.user = user;
      return true;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      this.logout();
      return false;
    }
  }

  async getUserInfo() {
    try {
      return await window.electronAPI.auth.getUserInfo();
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }

  getUser() {
    return this.user;
  }

  isUserAuthenticated() {
    return this.isAuthenticated;
  }
}

export const authService = new AuthService(); 