import { getTeacherProfile } from '../services/teacherService.js';

/**
 * GET /api/v1/teacher/profile
 * Retrieves authenticated teacher's profile.
 */
export async function getProfile(req, res) {
  try {
    const profile = await getTeacherProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Teacher profile not found.',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        profile,
      },
      message: 'Teacher profile retrieved successfully.',
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Teacher Controller Error (getProfile):', error.message);
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
  getProfile,
};
