import { useContext } from 'react';
import StudentContext from '../contexts/StudentContext.jsx';

/**
 * Custom hook to access StudentContext.
 * 
 * Provides:
 *   - profile: Student profile object
 *   - academicContext: Complete academic context object { student, enrollment }
 *   - enrollment: Active enrollment details (or null if not enrolled)
 *   - studentIdentity: Student identity from context { id, admissionNumber, name, email }
 *   - isLoading: Boolean indicating loading state
 *   - error: Error message or null
 *   - isAuthError: Boolean indicating 401/403
 *   - refreshStudentData: Function to re-fetch profile and academic context
 * 
 * @returns {Object} StudentContext value
 */
export function useStudent() {
  const context = useContext(StudentContext);

  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }

  return context;
}

export default useStudent;
