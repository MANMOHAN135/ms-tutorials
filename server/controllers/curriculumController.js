import {
  getCurriculumNodes,
  getCurriculumNodeById,
  getChaptersByNodeId,
  getChapterById,
  getTopicsByChapterId,
  getTopicById,
} from '../services/curriculumService.js';

/**
 * GET /api/v1/curriculum/nodes
 * Retrieves all curriculum nodes.
 */
export async function getNodes(req, res) {
  try {
    const nodes = await getCurriculumNodes();
    return res.status(200).json({
      success: true,
      data: {
        nodes,
      },
      message: 'Curriculum nodes retrieved successfully.',
      meta: {
        count: nodes.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Curriculum Controller Error (getNodes):', error.message);
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
 * GET /api/v1/curriculum/nodes/:id
 * Retrieves a single curriculum node by ID.
 */
export async function getNodeById(req, res) {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Curriculum node not found.',
        },
      });
    }

    const node = await getCurriculumNodeById(id.trim());
    if (!node) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Curriculum node not found.',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        node,
      },
      message: 'Curriculum node retrieved successfully.',
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Curriculum Controller Error (getNodeById):', error.message);
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
 * GET /api/v1/curriculum/nodes/:id/chapters
 * Retrieves chapters belonging to a curriculum node.
 */
export async function getNodeChapters(req, res) {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Curriculum node not found.',
        },
      });
    }

    const chapters = await getChaptersByNodeId(id.trim());
    if (!chapters) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Curriculum node not found.',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        chapters,
      },
      message: 'Curriculum node chapters retrieved successfully.',
      meta: {
        count: chapters.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Curriculum Controller Error (getNodeChapters):', error.message);
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
 * GET /api/v1/curriculum/chapters/:id
 * Retrieves a single chapter by ID.
 */
export async function getChapter(req, res) {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Chapter not found.',
        },
      });
    }

    const chapter = await getChapterById(id.trim());
    if (!chapter) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Chapter not found.',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        chapter,
      },
      message: 'Chapter retrieved successfully.',
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Curriculum Controller Error (getChapter):', error.message);
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
 * GET /api/v1/curriculum/chapters/:id/topics
 * Retrieves topics belonging to a chapter.
 */
export async function getChapterTopics(req, res) {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Chapter not found.',
        },
      });
    }

    const topics = await getTopicsByChapterId(id.trim());
    if (!topics) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Chapter not found.',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        topics,
      },
      message: 'Chapter topics retrieved successfully.',
      meta: {
        count: topics.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Curriculum Controller Error (getChapterTopics):', error.message);
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
 * GET /api/v1/curriculum/topics/:id
 * Retrieves a single topic by ID.
 */
export async function getTopic(req, res) {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Topic not found.',
        },
      });
    }

    const topic = await getTopicById(id.trim());
    if (!topic) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Topic not found.',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        topic,
      },
      message: 'Topic retrieved successfully.',
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Curriculum Controller Error (getTopic):', error.message);
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
  getNodes,
  getNodeById,
  getNodeChapters,
  getChapter,
  getChapterTopics,
  getTopic,
};
