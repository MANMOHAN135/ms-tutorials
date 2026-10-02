/**
 * MS Tutorials — Frontend Teacher Service (Phase 5.10E-D)
 * 
 * Interacts with locked Phase 5.10E-B backend assignment endpoints,
 * Phase 5.8 academic reference and curriculum endpoints, and teacher profile.
 * 
 * Security Invariants:
 *   - Identity and authorization are derived strictly from backend session tokens (req.user.id).
 *   - Faculty authorization is author-scoped (assignment.created_by = req.user.id).
 *   - Uses authService.authFetch with in-memory Bearer token and automatic 401 refresh.
 *   - Does NOT store sensitive tokens or response data in browser storage (localStorage/sessionStorage).
 */

import authService from './authService.js';

export const teacherService = {
  /**
   * Fetches paginated assignments authored by the authenticated teacher (or all for superadmin).
   * Endpoint: GET /api/v1/assignments
   * 
   * @param {Object} [filters={}] - Optional filters: status, curriculumNodeId
   * @param {Object} [pagination={}] - Optional pagination: page, pageSize
   * @returns {Promise<{ assignments: Array<Object>, pagination: Object }>}
   */
  async getAssignments(filters = {}, pagination = {}) {
    const params = new URLSearchParams();

    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.curriculumNodeId) params.append('curriculumNodeId', filters.curriculumNodeId);

    if (pagination.page) params.append('page', String(pagination.page));
    if (pagination.pageSize) params.append('pageSize', String(pagination.pageSize));

    const queryString = params.toString();
    const endpoint = `/api/v1/assignments${queryString ? `?${queryString}` : ''}`;

    const res = await authService.authFetch(endpoint, {
      method: 'GET',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error?.message || data.error || 'Failed to retrieve assignments.';
      const err = new Error(errorMsg);
      err.status = res.status;
      err.code = data.error?.code;
      throw err;
    }

    return {
      assignments: data.data?.assignments || [],
      pagination: data.pagination || {
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0,
      },
    };
  },

  /**
   * Fetches full details of a specific assignment master record with targets.
   * Endpoint: GET /api/v1/assignments/:id
   * 
   * @param {string} id - Assignment master UUID
   * @returns {Promise<Object>} Assignment detail record with targets array
   */
  async getAssignmentById(id) {
    if (!id || typeof id !== 'string') {
      throw new Error('Valid assignment ID is required.');
    }

    const res = await authService.authFetch(`/api/v1/assignments/${encodeURIComponent(id)}`, {
      method: 'GET',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error?.message || data.error || 'Failed to retrieve assignment details.';
      const err = new Error(errorMsg);
      err.status = res.status;
      err.code = data.error?.code;
      throw err;
    }

    return data.data?.assignment || null;
  },

  /**
   * Creates a new assignment master definition in draft status.
   * Endpoint: POST /api/v1/assignments
   * 
   * @param {Object} payload - Assignment definition payload
   * @returns {Promise<Object>} Created assignment definition
   */
  async createAssignment(payload) {
    const res = await authService.authFetch('/api/v1/assignments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error?.message || data.error || 'Failed to create assignment.';
      const err = new Error(errorMsg);
      err.status = res.status;
      err.code = data.error?.code;
      throw err;
    }

    return data.data?.assignment || null;
  },

  /**
   * Publishes an assignment master record and materializes student_assignments instances.
   * Endpoint: POST /api/v1/assignments/:id/publish
   * 
   * @param {string} id - Assignment master UUID
   * @returns {Promise<Object>} Published assignment result
   */
  async publishAssignment(id) {
    if (!id || typeof id !== 'string') {
      throw new Error('Valid assignment ID is required.');
    }

    const res = await authService.authFetch(`/api/v1/assignments/${encodeURIComponent(id)}/publish`, {
      method: 'POST',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error?.message || data.error || 'Failed to publish assignment.';
      const err = new Error(errorMsg);
      err.status = res.status;
      err.code = data.error?.code;
      throw err;
    }

    return data.data?.assignment || null;
  },

  /**
   * Retrieves submissions queue for an assignment.
   * Endpoint: GET /api/v1/assignments/:id/submissions
   * 
   * @param {string} assignmentId - Assignment master UUID
   * @param {Object} [filters={}] - Optional filters: status
   * @param {Object} [pagination={}] - Optional pagination: page, pageSize
   * @returns {Promise<{ submissions: Array<Object>, pagination: Object }>}
   */
  async getAssignmentSubmissions(assignmentId, filters = {}, pagination = {}) {
    if (!assignmentId || typeof assignmentId !== 'string') {
      throw new Error('Valid assignment ID is required.');
    }

    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (pagination.page) params.append('page', String(pagination.page));
    if (pagination.pageSize) params.append('pageSize', String(pagination.pageSize));

    const queryString = params.toString();
    const endpoint = `/api/v1/assignments/${encodeURIComponent(assignmentId)}/submissions${queryString ? `?${queryString}` : ''}`;

    const res = await authService.authFetch(endpoint, {
      method: 'GET',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error?.message || data.error || 'Failed to retrieve assignment submissions.';
      const err = new Error(errorMsg);
      err.status = res.status;
      err.code = data.error?.code;
      throw err;
    }

    return {
      submissions: data.data?.submissions || [],
      pagination: data.pagination || {
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0,
      },
    };
  },

  /**
   * Evaluates a student submission attempt.
   * Endpoint: POST /api/v1/assignments/submissions/:submissionId/evaluate
   * 
   * @param {string} submissionId - Submission attempt UUID
   * @param {Object} evalData - Evaluation data: { scoreAwarded, feedback, gradingStatus }
   * @returns {Promise<Object>} Created/updated evaluation record
   */
  async evaluateSubmission(submissionId, evalData) {
    if (!submissionId || typeof submissionId !== 'string') {
      throw new Error('Valid submission ID is required.');
    }

    const res = await authService.authFetch(`/api/v1/assignments/submissions/${encodeURIComponent(submissionId)}/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(evalData),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error?.message || data.error || 'Failed to evaluate submission.';
      const err = new Error(errorMsg);
      err.status = res.status;
      err.code = data.error?.code;
      throw err;
    }

    return data.data?.evaluation || null;
  },

  /**
   * Fetches academic classes.
   * Endpoint: GET /api/v1/academic/classes
   * 
   * @returns {Promise<Array<Object>>} List of academic classes
   */
  async getClasses() {
    const res = await authService.authFetch('/api/v1/academic/classes', {
      method: 'GET',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) return [];
    return data.data?.classes || [];
  },

  /**
   * Fetches academic subjects.
   * Endpoint: GET /api/v1/academic/subjects
   * 
   * @returns {Promise<Array<Object>>} List of academic subjects
   */
  async getSubjects() {
    const res = await authService.authFetch('/api/v1/academic/subjects', {
      method: 'GET',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) return [];
    return data.data?.subjects || [];
  },

  /**
   * Fetches all curriculum nodes for curriculum anchoring.
   * Endpoint: GET /api/v1/curriculum/nodes
   * 
   * @returns {Promise<Array<Object>>} List of curriculum nodes
   */
  async getCurriculumNodes() {
    const res = await authService.authFetch('/api/v1/curriculum/nodes', {
      method: 'GET',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) return [];
    return data.data?.nodes || [];
  },

  /**
   * Fetches chapters belonging to a curriculum node.
   * Endpoint: GET /api/v1/curriculum/nodes/:id/chapters
   * 
   * @param {string} nodeId - Curriculum node UUID
   * @returns {Promise<Array<Object>>} List of chapters
   */
  async getNodeChapters(nodeId) {
    if (!nodeId) return [];

    const res = await authService.authFetch(`/api/v1/curriculum/nodes/${encodeURIComponent(nodeId)}/chapters`, {
      method: 'GET',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) return [];
    return data.data?.chapters || [];
  },

  /**
   * Fetches topics belonging to a chapter.
   * Endpoint: GET /api/v1/curriculum/chapters/:id/topics
   * 
   * @param {string} chapterId - Chapter UUID
   * @returns {Promise<Array<Object>>} List of topics
   */
  async getChapterTopics(chapterId) {
    if (!chapterId) return [];

    const res = await authService.authFetch(`/api/v1/curriculum/chapters/${encodeURIComponent(chapterId)}/topics`, {
      method: 'GET',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) return [];
    return data.data?.topics || [];
  },

  /**
   * Fetches the authenticated teacher's profile.
   * Endpoint: GET /api/v1/teacher/profile
   * 
   * @returns {Promise<Object|null>} Teacher profile
   */
  async getTeacherProfile() {
    const res = await authService.authFetch('/api/v1/teacher/profile', {
      method: 'GET',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) return null;
    return data.data?.profile || null;
  },
};

export default teacherService;
