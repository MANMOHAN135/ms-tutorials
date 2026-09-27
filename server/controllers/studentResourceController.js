import {
  getStudentResources,
  getStudentResourceById,
} from '../services/studentResourceService.js';

const ALLOWED_RESOURCE_TYPES = [
  'notes',
  'worksheet',
  'important_questions',
  'video',
  'question_bank',
  'summary_sheet',
];

const ALLOWED_DIFFICULTY_LEVELS = [
  'foundation',
  'standard',
  'advanced',
];

/**
 * GET /api/v1/student/resources
 * Retrieves a paginated list of published learning resources applicable to the authenticated student's active enrollment.
 * Student identity is derived strictly from req.user.id.
 */
export async function getResources(req, res) {
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

    // 1. Validate resourceType filter
    if (req.query.resourceType) {
      const type = String(req.query.resourceType).trim();
      if (!ALLOWED_RESOURCE_TYPES.includes(type)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Invalid resourceType filter. Allowed values: ${ALLOWED_RESOURCE_TYPES.join(', ')}.`,
          },
        });
      }
      filters.resourceType = type;
    }

    // 2. Validate difficultyLevel filter
    if (req.query.difficultyLevel) {
      const level = String(req.query.difficultyLevel).trim();
      if (!ALLOWED_DIFFICULTY_LEVELS.includes(level)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Invalid difficultyLevel filter. Allowed values: ${ALLOWED_DIFFICULTY_LEVELS.join(', ')}.`,
          },
        });
      }
      filters.difficultyLevel = level;
    }

    // 3. Optional hierarchical ID filters (parameterized, narrowing only)
    if (req.query.subjectId && typeof req.query.subjectId === 'string' && req.query.subjectId.trim()) {
      filters.subjectId = req.query.subjectId.trim();
    }
    if (req.query.chapterId && typeof req.query.chapterId === 'string' && req.query.chapterId.trim()) {
      filters.chapterId = req.query.chapterId.trim();
    }
    if (req.query.topicId && typeof req.query.topicId === 'string' && req.query.topicId.trim()) {
      filters.topicId = req.query.topicId.trim();
    }

    // 4. Validate pagination parameters
    let page = 1;
    if (req.query.page !== undefined) {
      const parsedPage = Number(req.query.page);
      if (!Number.isInteger(parsedPage) || parsedPage < 1) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid page parameter. Must be an integer >= 1.',
          },
        });
      }
      page = parsedPage;
    }

    let pageSize = 20;
    if (req.query.pageSize !== undefined) {
      const parsedPageSize = Number(req.query.pageSize);
      if (!Number.isInteger(parsedPageSize) || parsedPageSize < 1 || parsedPageSize > 100) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid pageSize parameter. Must be an integer between 1 and 100.',
          },
        });
      }
      pageSize = parsedPageSize;
    }

    const result = await getStudentResources(userId, filters, { page, pageSize });
    if (!result) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Student record not found.',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        resources: result.resources,
      },
      pagination: result.pagination,
      message: 'Learning resources retrieved successfully.',
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Student Resource Controller Error (getResources):', error.message);
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
 * GET /api/v1/student/resources/:id
 * Retrieves a single learning resource by ID for the authenticated student.
 * Guarantees that the resource is published and belongs to the student's active enrollment scope.
 */
export async function getResourceById(req, res) {
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
          message: 'Learning resource not found.',
        },
      });
    }

    const resource = await getStudentResourceById(userId, id.trim());
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Learning resource not found.',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        resource,
      },
      message: 'Learning resource retrieved successfully.',
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Student Resource Controller Error (getResourceById):', error.message);
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
  getResources,
  getResourceById,
};
