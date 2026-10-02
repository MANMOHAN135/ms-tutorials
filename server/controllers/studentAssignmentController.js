import studentAssignmentService from '../services/studentAssignmentService.js';

/**
 * GET /api/v1/student/assignments
 * Retrieves paginated list of assignments applicable to the authenticated student.
 */
export async function getAssignments(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
        },
      });
    }

    const filters = {};
    if (req.query.status) {
      filters.status = String(req.query.status).trim();
    }
    if (req.query.subjectId) {
      filters.subjectId = String(req.query.subjectId).trim();
    }
    if (req.query.chapterId) {
      filters.chapterId = String(req.query.chapterId).trim();
    }

    let page = 1;
    if (req.query.page !== undefined) {
      const parsed = Number(req.query.page);
      if (!Number.isInteger(parsed) || parsed < 1) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid page parameter. Must be an integer >= 1.',
          },
        });
      }
      page = parsed;
    }

    let pageSize = 20;
    if (req.query.pageSize !== undefined) {
      const parsed = Number(req.query.pageSize);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid pageSize parameter. Must be an integer between 1 and 100.',
          },
        });
      }
      pageSize = parsed;
    }

    const result = await studentAssignmentService.getStudentAssignments(userId, filters, { page, pageSize });
    if (!result) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Student account not found.',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        assignments: result.assignments,
      },
      pagination: result.pagination,
      message: 'Student assignments retrieved successfully.',
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Student Assignment Controller Error (getAssignments):', error.message);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal error occurred.',
      },
    });
  }
}

/**
 * GET /api/v1/student/assignments/:id
 * Retrieves details of a specific assignment instance for the authenticated student.
 */
export async function getAssignmentDetail(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
        },
      });
    }

    const { id } = req.params;
    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Assignment not found.',
        },
      });
    }

    const assignment = await studentAssignmentService.getStudentAssignmentDetail(userId, id.trim());
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Assignment not found.',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        assignment,
      },
      message: 'Assignment details retrieved successfully.',
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Student Assignment Controller Error (getAssignmentDetail):', error.message);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal error occurred.',
      },
    });
  }
}

/**
 * POST /api/v1/student/assignments/:id/submissions
 * Submits work for the authenticated student's assignment instance.
 */
export async function createSubmission(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
        },
      });
    }

    const { id } = req.params;
    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Assignment not found.',
        },
      });
    }

    const submission = await studentAssignmentService.submitAssignment(userId, id.trim(), req.body || {});

    return res.status(201).json({
      success: true,
      data: {
        submission,
      },
      message: 'Assignment submitted successfully.',
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code || 'BAD_REQUEST',
          message: error.message,
        },
      });
    }

    console.error('Student Assignment Controller Error (createSubmission):', error.message);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal error occurred.',
      },
    });
  }
}

/**
 * GET /api/v1/student/assignments/:id/submissions
 * Retrieves historical attempts and evaluations for an assignment.
 */
export async function getSubmissions(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
        },
      });
    }

    const { id } = req.params;
    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Assignment not found.',
        },
      });
    }

    const submissions = await studentAssignmentService.getStudentSubmissions(userId, id.trim());
    if (submissions === null) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Assignment not found.',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        submissions,
      },
      message: 'Submissions retrieved successfully.',
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Student Assignment Controller Error (getSubmissions):', error.message);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal error occurred.',
      },
    });
  }
}

export default {
  getAssignments,
  getAssignmentDetail,
  createSubmission,
  getSubmissions,
};
