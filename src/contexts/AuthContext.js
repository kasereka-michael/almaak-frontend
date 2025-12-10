import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const currentUser = authService.getUser();
    console.log('Initial user from getUser:', currentUser); // Debugging initial state
    return currentUser || null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const isLoggedIn = authService.isLoggedIn();
    console.log('Initial authentication status:', isLoggedIn); // Debugging initial authentication status
    return isLoggedIn;
  });
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(authService.getSessionId());
  const [error, setError] = useState(null);

  // Auth state change handler
  const handleAuthChange = useCallback((authenticated, userData) => {
    console.log('Auth state changed:', authenticated, userData);
    setIsAuthenticated(authenticated);
    setUser(userData);
    setSessionId(authService.getSessionId());
  }, []);

  // Initialize authentication state
  useEffect(() => {
    authService.addAuthListener(handleAuthChange);
    // Try to restore session from server on mount
    authService.checkAuthentication();

    return () => {
      authService.removeAuthListener(handleAuthChange);
    };
  }, [handleAuthChange]);

  // Login function
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.login(username, password);
      // After login, get current user from service
      const me = await authService.getCurrentUser();
      setUser(me);
      setIsAuthenticated(true);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setSessionId(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message || 'Logout failed.');
      // Even if logout fails on server, clear local state
      setUser(null);
      setIsAuthenticated(false);
      setSessionId(null);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.updateProfile(userData);
      setUser(prevUser => ({
        ...prevUser,
        ...result.user
      }));
      return result;
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.message || 'Profile update failed.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Session management functions
  const getSessionInfo = async () => {
    return await authService.getSessionInfo();
  };

  const getMySessions = async () => {
    return await authService.getMySessions();
  };

  const invalidateOtherSessions = async () => {
    return await authService.invalidateOtherSessions();
  };

  const extendSession = async (seconds = 1800) => {
    return await authService.extendSession(seconds);
  };

  // Permission and role checking functions
  const hasRole = (roleName) => {
    return authService.hasRole(roleName);
  };

  const hasPermission = (permissionName) => {
    return authService.hasPermission(permissionName);
  };

  const hasAnyRole = (roleNames) => {
    return authService.hasAnyRole(roleNames);
  };

  const hasAnyPermission = (permissionNames) => {
    return authService.hasAnyPermission(permissionNames);
  };

  // Utility functions
  const getUserFullName = () => {
    return authService.getUserFullName();
  };

  const getUserRoles = () => {
    return authService.getUserRoles();
  };

  const getUserPermissions = () => {
    return authService.getUserPermissions();
  };

  const value = {
    // State (keeping backward compatibility)
    currentUser: user,
    user,
    isAuthenticated,
    loading,
    sessionId,
    error,

    // Auth functions
    login,
    logout,
    updateProfile,

    // Session management
    getSessionInfo,
    getMySessions,
    invalidateOtherSessions,
    extendSession,

    // Permission checking
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAnyPermission,

    // Utility functions
    getUserFullName,
    getUserRoles,
    getUserPermissions,
  };

  return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
  );
};
