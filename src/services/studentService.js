/**
 * MS Tutorials — Frontend Student Service (Phase 5.10C)
 * 
 * Interacts with locked Phase 5.5 and Phase 5.8C backend endpoints:
 *   GET /api/v1/student/profile
 *   GET /api/v1/student/academic-context
 * 
 * Security Invariants:
 *   - Identity is derived strictly from backend session tokens (req.user.id).
 *   - No client-supplied student IDs or query parameter overrides.
 *   - Uses authService.authFetch with in-memory Bearer token and automatic 401 refresh.
 *   - Does NOT store response data in browser storage (localStorage/sessionStorage).
 */

import authService from './authService.js';

export const studentService = {
  /**
   * Fetches the authenticated student's profile.
   * Endpoint: GET /api/v1/student/profile
   * 
   * Response envelope:
   *   {
   *     success: true,
   *     data: { profile: { ... } },
   *     message: "...",
   *     meta: { timestamp: "..." }
   *   }
   * 
   * @returns {Promise<Object>} Safe student profile object
   */
  async getProfile() {
    const res = await authService.authFetch('/api/v1/student/profile', {
      method: 'GET',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error?.message || data.error || 'Failed to retrieve student profile.';
      const err = new Error(errorMsg);
      err.status = res.status;
      err.code = data.error?.code;
      throw err;
    }

    return data.data?.profile || null;
  },

  /**
   * Fetches the authenticated student's academic enrollment context.
   * Endpoint: GET /api/v1/student/academic-context
   * 
   * Response envelope:
   *   {
   *     success: true,
   *     data: {
   *       student: { id, admissionNumber, name, email },
   *       enrollment: { ... } | null
   *     },
   *     message: "...",
   *     meta: { timestamp: "..." }
   *   }
   * 
   * @returns {Promise<{ student: Object, enrollment: Object|null }>} Academic context
   */
  async getAcademicContext() {
    const res = await authService.authFetch('/api/v1/student/academic-context', {
      method: 'GET',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error?.message || data.error || 'Failed to retrieve student academic context.';
      const err = new Error(errorMsg);
      err.status = res.status;
      err.code = data.error?.code;
      throw err;
    }

    return data.data || { student: null, enrollment: null };
  },
};

export default studentService;
