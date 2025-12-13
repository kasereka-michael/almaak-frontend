import API from './apiConfig';

const BASE_URL = 'users';

/**
 * User Service for managing users
 */
export class UserService {

  /**
   * Get all users with pagination and filtering
   */
  static async getAllUsers(filters = {}) {
    try {
      const {
        page = 0,
        size = 20,
        sortBy = 'username',
        sortDir = 'asc',
        search,
        role,
        department,
        enabled
      } = filters;

      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir
      });

      if (search) params.append('search', search);
      if (role) params.append('role', role);
      if (department) params.append('department', department);
      if (enabled !== undefined) params.append('enabled', enabled.toString());

      const { data } = await API.get(`${BASE_URL}`, { params: Object.fromEntries(params) });
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId) {
    try {
      const { data } = await API.get(`${BASE_URL}/${userId}`);
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Get user by username
   */
  static async getUserByUsername(username) {
    try {
      const { data } = await API.get(`${BASE_URL}/username/${encodeURIComponent(username)}`);
      return data;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      throw error;
    }
  }

  /**
   * Search users by term
   */
  static async searchUsers(searchTerm, filters = {}) {
    try {
      const {
        page = 0,
        size = 20,
        sortBy = 'username',
        sortDir = 'asc'
      } = filters;

      const params = new URLSearchParams({
        search: searchTerm,
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir
      });

      const { data } = await API.get(`${BASE_URL}/search`, { params: Object.fromEntries(params) });
      return data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role, filters = {}) {
    try {
      const {
        page = 0,
        size = 20,
        sortBy = 'username',
        sortDir = 'asc'
      } = filters;

      const params = new URLSearchParams({
        role,
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir
      });

      const { data } = await API.get(`${BASE_URL}/role`, { params: Object.fromEntries(params) });
      return data;
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  }

  /**
   * Get users by department
   */
  static async getUsersByDepartment(department, filters = {}) {
    try {
      const {
        page = 0,
        size = 20,
        sortBy = 'username',
        sortDir = 'asc'
      } = filters;

      const params = new URLSearchParams({
        department,
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir
      });

      const { data } = await API.get(`${BASE_URL}/department`, { params: Object.fromEntries(params) });
      return data;
    } catch (error) {
      console.error('Error fetching users by department:', error);
      throw error;
    }
  }

  /**
   * Get active users only
   */
  static async getActiveUsers(filters = {}) {
    return this.getAllUsers({ ...filters, enabled: true });
  }

  /**
   * Create new user
   */
  static async createUser(userData) {
    try {
      const { data } = await API.post(BASE_URL, userData);
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  static async updateUser(userId, userData) {
    try {
      const { data } = await API.put(`${BASE_URL}/${userId}`, userData);
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(userId) {
    try {
      const { data } = await API.delete(`${BASE_URL}/${userId}`);
      return data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Enable/Disable user
   */
  static async toggleUserStatus(userId, enabled) {
    try {
      const { data } = await API.put(`${BASE_URL}/${userId}/status`, { enabled });
      return data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUserProfile() {
    try {
      const { data } = await API.get(`${BASE_URL}/profile`);
      return data;
    } catch (error) {
      console.error('Error fetching current user profile:', error);
      throw error;
    }
  }

  /**
   * Update current user profile
   */
  static async updateCurrentUserProfile(profileData) {
    try {
      const { data } = await API.put(`${BASE_URL}/profile`, profileData);
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  static async changePassword(passwordData) {
    try {
      const { data } = await API.put(`${BASE_URL}/change-password`, passwordData);
      return data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  // Helper methods

  /**
   * Format user display name
   */
  static formatUserDisplayName(user) {
    if (!user) return 'Unknown User';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    return user.username || 'Unknown User';
  }

  /**
   * Get user initials
   */
  static getUserInitials(user) {
    if (!user) return 'U';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    
    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    
    return 'U';
  }

  /**
   * Get role display name
   */
  static getRoleDisplayName(role) {
    const roleNames = {
      'ADMIN': 'Administrator',
      'MANAGER': 'Manager',
      'DG': 'Director General',
      'EMPLOYEE': 'Employee',
      'HR': 'Human Resources',
      'FINANCE': 'Finance',
      'SALES': 'Sales',
      'TECHNICIAN': 'Technician',
      'PROJECT_MANAGER': 'Project Manager'
    };
    
    return roleNames[role] || role;
  }

  /**
   * Get role color class
   */
  static getRoleColorClass(role) {
    const roleColors = {
      'ADMIN': 'bg-red-100 text-red-800',
      'MANAGER': 'bg-blue-100 text-blue-800',
      'DG': 'bg-purple-100 text-purple-800',
      'EMPLOYEE': 'bg-gray-100 text-gray-800',
      'HR': 'bg-green-100 text-green-800',
      'FINANCE': 'bg-yellow-100 text-yellow-800',
      'SALES': 'bg-pink-100 text-pink-800',
      'TECHNICIAN': 'bg-indigo-100 text-indigo-800',
      'PROJECT_MANAGER': 'bg-cyan-100 text-cyan-800'
    };
    
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Validate user data
   */
  static validateUserData(userData) {
    const errors = [];
    
    if (!userData.username || userData.username.trim().length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    
    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push('Valid email address is required');
    }
    
    if (!userData.firstName || userData.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters long');
    }
    
    if (!userData.lastName || userData.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters long');
    }
    
    if (!userData.role) {
      errors.push('Role is required');
    }
    
    return errors;
  }

  /**
   * Validate email format
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default UserService;