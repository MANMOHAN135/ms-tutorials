import { getStudentAcademicContext } from '../services/studentAcademicContextService.js';

/**
 * GET /api/v1/student/academic-context
 * Retrieves the authenticated student's current academic enrollment context.
 * The student identity is derived strictly from req.user.id.
 */
export async function getAcademicContext(req, res) {
  try {
    // Identity must come exclusively from req.user.id
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

    const context = await getStudentAcademicContext(userId);
    if (!context) {
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
      data: context,
      message: 'Student academic context retrieved successfully.',
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Academic Context Controller Error (getAcademicContext):', error.message);
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
  getAcademicContext,
};
