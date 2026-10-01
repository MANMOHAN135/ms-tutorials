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

  /**
   * Fetches paginated learning resources for the authenticated student.
   * Endpoint: GET /api/v1/student/resources
   * 
   * Supported filters (strictly aligned with Phase 5.8D backend):
   *   - resourceType ('notes' | 'worksheet' | 'important_questions' | 'video' | 'question_bank' | 'summary_sheet')
   *   - difficultyLevel ('foundation' | 'standard' | 'advanced')
   *   - subjectId (UUID)
   *   - chapterId (UUID)
   *   - topicId (UUID)
   *   - page (number >= 1)
   *   - pageSize (number 1..100)
   * 
   * @param {Object} [filters={}]
   * @param {Object} [pagination={}]
   * @returns {Promise<{ resources: Array<Object>, pagination: Object }>}
   */
  async getResources(filters = {}, pagination = {}) {
    const params = new URLSearchParams();

    if (filters.resourceType) params.append('resourceType', filters.resourceType);
    if (filters.difficultyLevel) params.append('difficultyLevel', filters.difficultyLevel);
    if (filters.subjectId) params.append('subjectId', filters.subjectId);
    if (filters.chapterId) params.append('chapterId', filters.chapterId);
    if (filters.topicId) params.append('topicId', filters.topicId);

    if (pagination.page) params.append('page', String(pagination.page));
    if (pagination.pageSize) params.append('pageSize', String(pagination.pageSize));

    const queryString = params.toString();
    const endpoint = `/api/v1/student/resources${queryString ? `?${queryString}` : ''}`;

    const res = await authService.authFetch(endpoint, {
      method: 'GET',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error?.message || data.error || 'Failed to retrieve learning resources.';
      const err = new Error(errorMsg);
      err.status = res.status;
      err.code = data.error?.code;
      throw err;
    }

    return {
      resources: data.data?.resources || [],
      pagination: data.pagination || {
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  },

  /**
   * Fetches a single learning resource by ID for the authenticated student.
   * Endpoint: GET /api/v1/student/resources/:id
   * 
   * @param {string} id - Learning resource UUID
   * @returns {Promise<Object>} Learning resource object
   */
  async getResourceById(id) {
    if (!id || typeof id !== 'string') {
      const err = new Error('Resource ID is required.');
      err.status = 400;
      throw err;
    }

    const res = await authService.authFetch(`/api/v1/student/resources/${encodeURIComponent(id)}`, {
      method: 'GET',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error?.message || data.error || 'Failed to retrieve learning resource.';
      const err = new Error(errorMsg);
      err.status = res.status;
      err.code = data.error?.code;
      throw err;
    }

    return data.data?.resource || null;
  },

  /**
   * Fetches reference subjects to populate curriculum filters.
   * Endpoint: GET /api/v1/academic/subjects
   * 
   * @returns {Promise<Array<Object>>} List of academic subjects
   */
  async getSubjects() {
    const res = await authService.authFetch('/api/v1/academic/subjects', {
      method: 'GET',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return [];
    }

    return data.data?.subjects || [];
  },
};

export default studentService;
