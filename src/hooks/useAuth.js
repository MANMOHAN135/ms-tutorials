import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';

/**
 * Custom hook to access global authentication state and methods.
 * 
 * @returns {{
 *   user: { id: string, role: string, identifier: string, name: string } | null,
 *   isAuthenticated: boolean,
 *   isLoading: boolean,
 *   isSubmitting: boolean,
 *   error: string | null,
 *   login: (credentials: { identifier: string, password: string }) => Promise<Object>,
 *   logout: () => Promise<void>,
 *   checkAuth: () => Promise<Object|null>,
 *   clearError: () => void
 * }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
}

export default useAuth;
