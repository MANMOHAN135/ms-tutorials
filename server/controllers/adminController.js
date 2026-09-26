import { getAdminProfile } from '../services/adminService.js';

/**
 * GET /api/v1/admin/profile
 * Retrieves authenticated admin's profile.
 */
export async function getProfile(req, res) {
  try {
    const profile = await getAdminProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Admin profile not found.',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        profile,
      },
      message: 'Admin profile retrieved successfully.',
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Admin Controller Error (getProfile):', error.message);
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
