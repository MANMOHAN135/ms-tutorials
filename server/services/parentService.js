import {
  findParentByUserId,
  findLinkedChildrenByParentUserId,
} from '../repositories/parentRepository.js';

/**
 * Retrieves the parent profile for an authenticated user.
 *
 * @param {string} userId - User UUID.
 * @param {Function} [customQuery] - Optional query runner for isolated testing.
 * @returns {Promise<Object|null>} Safe parent profile or null if not found.
 */
export async function getParentProfile(userId, customQuery) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const raw = await findParentByUserId(userId, customQuery);
  if (!raw) {
    return null;
  }

  return {
    userId: raw.user_id,
    parentId: raw.parent_id,
    identifier: raw.identifier,
    name: raw.full_name,
    email: raw.email || null,
    phone: raw.phone || null,
    role: raw.role,
    status: raw.status,
    parentCode: raw.parent_code,
    occupation: raw.occupation || null,
    alternatePhone: raw.alternate_phone || null,
    emergencyContactPhone: raw.emergency_contact_phone || null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/**
 * Retrieves all linked children for an authenticated parent.
 *
 * @param {string} userId - Parent's user UUID.
 * @param {Function} [customQuery] - Optional query runner for isolated testing.
 * @returns {Promise<Array<Object>|null>} Array of child profiles, or null if parent doesn't exist.
 */
export async function getParentChildren(userId, customQuery) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  // Ensure parent profile exists
  const parent = await findParentByUserId(userId, customQuery);
  if (!parent) {
    return null;
  }

  const rawChildren = await findLinkedChildrenByParentUserId(userId, customQuery);

  return rawChildren.map((child) => ({
    studentId: child.student_id,
    admissionNumber: child.admission_number,
    name: child.name,
    email: child.email || null,
    phone: child.phone || null,
    relationshipType: child.relationship_type,
    isPrimaryContact: Boolean(child.is_primary_contact),
    dateOfBirth: child.date_of_birth instanceof Date 
      ? child.date_of_birth.toISOString().split('T')[0] 
      : (child.date_of_birth || null),
    gender: child.gender || null,
    schoolName: child.school_name || null,
    board: child.board || null,
    academicTrack: child.academic_track || null,
    createdAt: child.created_at,
    updatedAt: child.updated_at,
  }));
}

export default {
  getParentProfile,
  getParentChildren,
};
