import { findStudentByUserId } from '../repositories/studentRepository.js';

/**
 * Retrieves the student profile for an authenticated user.
 *
 * @param {string} userId - User UUID.
 * @param {Function} [customQuery] - Optional query runner for isolated testing.
 * @returns {Promise<Object|null>} Safe student profile or null if not found.
 */
export async function getStudentProfile(userId, customQuery) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const raw = await findStudentByUserId(userId, customQuery);
  if (!raw) {
    return null;
  }

  return {
    userId: raw.user_id,
    studentId: raw.student_id,
    identifier: raw.identifier,
    name: raw.full_name,
    email: raw.email || null,
    phone: raw.phone || null,
    role: raw.role,
    status: raw.status,
    admissionNumber: raw.admission_number,
    dateOfBirth: raw.date_of_birth instanceof Date 
      ? raw.date_of_birth.toISOString().split('T')[0] 
      : (raw.date_of_birth || null),
    gender: raw.gender || null,
    schoolName: raw.school_name || null,
    board: raw.board || null,
    academicTrack: raw.academic_track || null,
    address: raw.address_text || null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export default {
  getStudentProfile,
};
