import { findAdminByUserId } from '../repositories/adminRepository.js';

/**
 * Retrieves the admin profile for an authenticated user.
 *
 * @param {string} userId - User UUID.
 * @param {Function} [customQuery] - Optional query runner for isolated testing.
 * @returns {Promise<Object|null>} Safe admin profile or null if not found.
 */
export async function getAdminProfile(userId, customQuery) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const raw = await findAdminByUserId(userId, customQuery);
  if (!raw) {
    return null;
  }

  return {
    userId: raw.user_id,
    adminId: raw.admin_id,
    identifier: raw.identifier,
    name: raw.full_name,
    email: raw.email || null,
    phone: raw.phone || null,
    role: raw.role,
    status: raw.status,
    adminCode: raw.admin_code,
    accessLevel: raw.access_level,
    department: raw.department || null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export default {
  getAdminProfile,
};
