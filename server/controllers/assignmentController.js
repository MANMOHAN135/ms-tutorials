import assignmentService from '../services/assignmentService.js';

/**
 * POST /api/v1/assignments
 * Creates a new assignment master definition.
 */
export async function createAssignment(req, res) {
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

    const assignment = await assignmentService.createAssignment(userId, req.body || {});

    return res.status(201).json({
      success: true,
      data: {
        assignment,
      },
      message: 'Assignment created successfully in draft status.',
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

    console.error('Assignment Controller Error (createAssignment):', error.message);
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
 * GET /api/v1/assignments
 * Lists assignments authored by the teacher or all for admin.
 */
export async function getAssignments(req, res) {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
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
    if (req.query.curriculumNodeId) {
      filters.curriculumNodeId = String(req.query.curriculumNodeId).trim();
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

    const result = await assignmentService.listAssignments(userId, userRole, filters, { page, pageSize });

    return res.status(200).json({
      success: true,
      data: {
        assignments: result.assignments,
      },
      pagination: result.pagination,
      message: 'Assignments retrieved successfully.',
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Assignment Controller Error (getAssignments):', error.message);
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
 * GET /api/v1/assignments/:id
 * Retrieves assignment details with targets.
 */
export async function getAssignmentDetail(req, res) {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
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

    const assignment = await assignmentService.getAssignmentDetail(userId, userRole, id.trim());
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
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code || 'FORBIDDEN',
          message: error.message,
        },
      });
    }

    console.error('Assignment Controller Error (getAssignmentDetail):', error.message);
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
 * POST /api/v1/assignments/:id/publish
 * Publishes an assignment and generates student_assignments instances.
 */
export async function publishAssignment(req, res) {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
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

    const result = await assignmentService.publishAssignment(userId, userRole, id.trim());

    return res.status(200).json({
      success: true,
      data: {
        assignment: result,
      },
      message: 'Assignment published successfully.',
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

    console.error('Assignment Controller Error (publishAssignment):', error.message);
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
 * GET /api/v1/assignments/:id/submissions
 * Retrieves student submissions for an assignment.
 */
export async function getAssignmentSubmissions(req, res) {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
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

    const filters = {};
    if (req.query.status) {
      filters.status = String(req.query.status).trim();
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

    const result = await assignmentService.listAssignmentSubmissions(userId, userRole, id.trim(), filters, { page, pageSize });

    return res.status(200).json({
      success: true,
      data: {
        submissions: result.submissions,
      },
      pagination: result.pagination,
      message: 'Submissions retrieved successfully.',
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

    console.error('Assignment Controller Error (getAssignmentSubmissions):', error.message);
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
 * POST /api/v1/assignments/submissions/:submissionId/evaluate
 * Evaluates a student submission.
 */
export async function evaluateSubmission(req, res) {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
        },
      });
    }

    const { submissionId } = req.params;
    if (!submissionId || typeof submissionId !== 'string' || !submissionId.trim()) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Submission not found.',
        },
      });
    }

    const evaluation = await assignmentService.evaluateSubmission(userId, userRole, submissionId.trim(), req.body || {});

    return res.status(200).json({
      success: true,
      data: {
        evaluation,
      },
      message: 'Submission evaluated successfully.',
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

    console.error('Assignment Controller Error (evaluateSubmission):', error.message);
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
  createAssignment,
  getAssignments,
  getAssignmentDetail,
  publishAssignment,
  getAssignmentSubmissions,
  evaluateSubmission,
};
