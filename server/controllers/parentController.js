import { getParentProfile, getParentChildren } from '../services/parentService.js';

/**
 * GET /api/v1/parent/profile
 * Retrieves authenticated parent's profile.
 */
export async function getProfile(req, res) {
  try {
    const profile = await getParentProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Parent profile not found.',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        profile,
      },
      message: 'Parent profile retrieved successfully.',
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Parent Controller Error (getProfile):', error.message);
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
 * GET /api/v1/parent/children
 * Retrieves all linked children for the authenticated parent.
 */
export async function getChildren(req, res) {
  try {
    const children = await getParentChildren(req.user.id);
    if (children === null) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Parent profile not found.',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        children,
      },
      message: 'Linked children retrieved successfully.',
      meta: {
        count: children.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Parent Controller Error (getChildren):', error.message);
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
  getChildren,
};
