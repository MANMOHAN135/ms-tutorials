import {
  getAcademicSessions,
  getAcademicBoards,
  getAcademicClasses,
  getAcademicPrograms,
  getAcademicSubjects,
} from '../services/academicReferenceService.js';

/**
 * GET /api/v1/academic/sessions
 * Retrieves all academic calendar sessions.
 */
export async function getSessions(req, res) {
  try {
    const sessions = await getAcademicSessions();
    return res.status(200).json({
      success: true,
      data: {
        sessions,
      },
      message: 'Academic sessions retrieved successfully.',
      meta: {
        count: sessions.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Academic Controller Error (getSessions):', error.message);
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
 * GET /api/v1/academic/boards
 * Retrieves all educational boards.
 */
export async function getBoards(req, res) {
  try {
    const boards = await getAcademicBoards();
    return res.status(200).json({
      success: true,
      data: {
        boards,
      },
      message: 'Educational boards retrieved successfully.',
      meta: {
        count: boards.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Academic Controller Error (getBoards):', error.message);
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
 * GET /api/v1/academic/classes
 * Retrieves all academic class standards.
 */
export async function getClasses(req, res) {
  try {
    const classes = await getAcademicClasses();
    return res.status(200).json({
      success: true,
      data: {
        classes,
      },
      message: 'Academic classes retrieved successfully.',
      meta: {
        count: classes.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Academic Controller Error (getClasses):', error.message);
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
 * GET /api/v1/academic/programs
 * Retrieves all pedagogical programs/tracks.
 */
export async function getPrograms(req, res) {
  try {
    const programs = await getAcademicPrograms();
    return res.status(200).json({
      success: true,
      data: {
        programs,
      },
      message: 'Educational programs retrieved successfully.',
      meta: {
        count: programs.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Academic Controller Error (getPrograms):', error.message);
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
 * GET /api/v1/academic/subjects
 * Retrieves all academic subjects and disciplinary components.
 */
export async function getSubjects(req, res) {
  try {
    const subjects = await getAcademicSubjects();
    return res.status(200).json({
      success: true,
      data: {
        subjects,
      },
      message: 'Academic subjects retrieved successfully.',
      meta: {
        count: subjects.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Academic Controller Error (getSubjects):', error.message);
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
  getSessions,
  getBoards,
  getClasses,
  getPrograms,
  getSubjects,
};
