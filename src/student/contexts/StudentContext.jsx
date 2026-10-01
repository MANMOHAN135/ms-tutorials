import React, { createContext, useState, useEffect, useCallback } from 'react';
import useAuth from '../../hooks/useAuth.js';
import studentService from '../../services/studentService.js';

export const StudentContext = createContext(null);

/**
 * Student Domain Context Provider
 * 
 * Manages loading, caching, and reactive state for:
 *   - Authenticated student profile (GET /api/v1/student/profile)
 *   - Authenticated academic enrollment context (GET /api/v1/student/academic-context)
 * 
 * Invariants:
 *   - Only fetches when user is authenticated as 'student'.
 *   - Gracefully supports students with no active enrollment (enrollment: null).
 *   - Leverages shared-promise refresh deduplication via authFetch.
 */
export function StudentProvider({ children }) {
  const { isAuthenticated, user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [academicContext, setAcademicContext] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthError, setIsAuthError] = useState(false);

  const fetchStudentData = useCallback(async () => {
    // If not authenticated or not a student, do not query student APIs
    if (!isAuthenticated || user?.role !== 'student') {
      setProfile(null);
      setAcademicContext(null);
      setIsLoading(false);
      setError(null);
      setIsAuthError(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsAuthError(false);

    try {
      // Execute both requests concurrently; authService handles refresh deduplication
      const [profileData, contextData] = await Promise.all([
        studentService.getProfile(),
        studentService.getAcademicContext(),
      ]);

      setProfile(profileData);
      setAcademicContext(contextData);
    } catch (err) {
      console.error('StudentContext: Failed to load student data:', err.message);
      setError(err.message || 'Unable to retrieve student academic information.');
      if (err.status === 401 || err.status === 403) {
        setIsAuthError(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const value = {
    profile,
    academicContext,
    enrollment: academicContext?.enrollment || null,
    studentIdentity: academicContext?.student || null,
    isLoading,
    error,
    isAuthError,
    refreshStudentData: fetchStudentData,
  };

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

export default StudentContext;
