import { findTeacherByUserId } from '../repositories/teacherRepository.js';

/**
 * Retrieves the teacher profile for an authenticated user.
 *
 * @param {string} userId - User UUID.
 * @param {Function} [customQuery] - Optional query runner for isolated testing.
 * @returns {Promise<Object|null>} Safe teacher profile or null if not found.
 */
export async function getTeacherProfile(userId, customQuery) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const raw = await findTeacherByUserId(userId, customQuery);
  if (!raw) {
    return null;
  }

  return {
    userId: raw.user_id,
    teacherId: raw.teacher_id,
    identifier: raw.identifier,
    name: raw.full_name,
    email: raw.email || null,
    phone: raw.phone || null,
    role: raw.role,
    status: raw.status,
    facultyCode: raw.faculty_code,
    qualification: raw.qualification || null,
    specialization: raw.specialization || null,
    joiningDate: raw.joining_date instanceof Date 
      ? raw.joining_date.toISOString().split('T')[0] 
      : (raw.joining_date || null),
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export default {
  getTeacherProfile,
};
