import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService.js';

export const AuthContext = createContext(null);

/**
 * Global Authentication Context Provider for MS Tutorials
 * 
 * Provides reactive authentication state, session bootstrap hydration,
 * and login/logout methods.
 * 
 * Invariants:
 *   - Public website routes never block on auth initialization.
 *   - Access tokens remain strictly in memory via authService.
 *   - Refresh tokens remain strictly in HttpOnly cookie.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Performs silent session restoration on bootstrap.
   * Attempts refresh -> getMe without logging console errors if unauthenticated.
   */
  const checkAuth = useCallback(async () => {
    try {
      // 1. Attempt token refresh using HttpOnly cookie
      const refreshResult = await authService.refresh();
      if (refreshResult && refreshResult.accessToken) {
        // 2. Fetch authoritative user identity from /api/auth/me
        const meResult = await authService.getMe(refreshResult.accessToken);
        if (meResult && meResult.user) {
          setUser(meResult.user);
          setIsAuthenticated(true);
          return meResult.user;
        }
      }
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } catch (err) {
      // Normal path for unauthenticated visitor or expired session
      authService.clearAccessToken();
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Background hydration on initial mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Authenticates student credentials.
   * Role is locked to 'student'.
   */
  const login = async ({ identifier, password }) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await authService.login({
        role: 'student',
        identifier,
        password,
      });

      if (result && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        return result.user;
      }
      throw new Error('Authentication succeeded but received incomplete user data.');
    } catch (err) {
      const errorMessage = err.message || 'Authentication failed. Please verify credentials.';
      setError(errorMessage);
      setUser(null);
      setIsAuthenticated(false);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Terminates active session.
   * Revokes refresh token on backend, clears cookie, and wipes local state.
   */
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isSubmitting,
    error,
    login,
    logout,
    checkAuth,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
