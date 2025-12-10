import API from './apiConfig';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.sessionId = null;
    this.authListeners = [];
  }

  // Authentication methods
  async login(username, password) {
    try {
      await API.post('/auth/login', { username, password });
      const me = await API.get('/auth/me');
      this.currentUser = me.data;
      this.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(this.currentUser));
      localStorage.setItem('isAuthenticated', 'true');
      this.notifyAuthListeners(true, this.currentUser);
      return { success: true, message: 'Login successful' };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async logout() {
    try {
      await API.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthState();
    }
  }

  async checkAuthentication() {
    try {
      const me = await API.get('/auth/me');
      if (me.status === 200) {
        this.currentUser = me.data;
        this.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(this.currentUser));
        localStorage.setItem('isAuthenticated', 'true');
        this.notifyAuthListeners(true, this.currentUser);
        return true;
      }
      this.clearAuthState();
      return false;
    } catch (error) {
      this.clearAuthState();
      return false;
    }
  }

  async getCurrentUser() {
    if (this.currentUser) return this.currentUser;
    try {
      const me = await API.get('/auth/me');
      this.currentUser = me.data;
      this.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(this.currentUser));
      localStorage.setItem('isAuthenticated', 'true');
      return this.currentUser;
    } catch (error) {
      this.clearAuthState();
      return null;
    }
  }

  // Profile management
  async updateProfile(userData) {
    // Placeholder: adjust when backend profile endpoints are available
    throw new Error('Profile update not implemented');
  }

  // Session management methods
  async getSessionInfo() {
    try {
      const me = await API.get('/auth/me');
      return me.data;
    } catch (error) {
      return null;
    }
  }

  async getMySessions() {
    try {
      const response = await API.get('/sessions/my-sessions');
      return response.data;
    } catch (error) {
      console.error('Get my sessions error:', error);
      return null;
    }
  }

  async invalidateOtherSessions() {
    try {
      const response = await API.post('/sessions/invalidate-others');
      return response.data;
    } catch (error) {
      console.error('Invalidate other sessions error:', error);
      throw error;
    }
  }

  async extendSession(seconds = 1800) {
    try {
      const response = await API.post(`/sessions/extend?seconds=${seconds}`);
      return response.data;
    } catch (error) {
      console.error('Extend session error:', error);
      throw error;
    }
  }

  // Utility methods
  clearAuthState() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.sessionId = null;
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('sessionId');
    
    this.notifyAuthListeners(false, null);
  }

  // Initialize auth state from localStorage
  initializeFromStorage() {
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedSessionId = localStorage.getItem('sessionId');
    let storedUser = null;
    try {
      const raw = localStorage.getItem('user');
      storedUser = raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Invalid user JSON in localStorage, clearing it.');
      localStorage.removeItem('user');
      storedUser = null;
    }

    if (storedUser && storedAuth === 'true') {
      this.currentUser = storedUser;
      this.isAuthenticated = true;
      this.sessionId = storedSessionId || null;
    } else {
      this.currentUser = null;
      this.isAuthenticated = false;
      this.sessionId = null;
    }
  }

  // Auth state management
  addAuthListener(callback) {
    this.authListeners.push(callback);
  }

  removeAuthListener(callback) {
    this.authListeners = this.authListeners.filter(listener => listener !== callback);
  }

  notifyAuthListeners(isAuthenticated, user) {
    this.authListeners.forEach(callback => {
      try {
        callback(isAuthenticated, user);
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }

  // Permission and role checking
  hasRole(roleName) {
    return this.currentUser?.roles?.includes(roleName) || false;
  }

  hasPermission(permissionName) {
    return this.currentUser?.permissions?.includes(permissionName) || false;
  }

  hasAnyRole(roleNames) {
    if (!this.currentUser?.roles) return false;
    return roleNames.some(role => this.currentUser.roles.includes(role));
  }

  hasAnyPermission(permissionNames) {
    if (!this.currentUser?.permissions) return false;
    return permissionNames.some(permission => this.currentUser.permissions.includes(permission));
  }

  // Getters
  getUser() {
    return this.currentUser;
  }

  getSessionId() {
    return this.sessionId;
  }

  isLoggedIn() {
    return this.isAuthenticated && this.currentUser !== null;
  }

  getUserRoles() {
    return this.currentUser?.roles || [];
  }

  getUserPermissions() {
    return this.currentUser?.permissions || [];
  }

  getUserFullName() {
    if (!this.currentUser) return '';
    return `${this.currentUser.firstName || ''} ${this.currentUser.lastName || ''}`.trim() || this.currentUser.username;
  }
}

// Create singleton instance
const authService = new AuthService();

// Initialize from storage on app start
authService.initializeFromStorage();

export default authService;