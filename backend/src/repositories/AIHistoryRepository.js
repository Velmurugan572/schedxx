// ==========================================
// AI History Repository (AIHistoryRepository.js)
// Layer for storing and retrieving AI generation history
// ==========================================

import prisma from '../database/prisma.js';

export class AIHistoryRepository {
  /**
   * Saves an AI generation interaction to the database.
   * @param {object} data - Mapped logs fields
   * @returns {Promise<object>}
   */
  async createHistoryEntry(data) {
    return prisma.aIHistory.create({
      data: {
        workspaceId: data.workspaceId,
        userId: data.userId,
        provider: data.provider,
        model: data.model,
        prompt: data.prompt,
        response: data.response,
        promptTokens: data.promptTokens,
        completionTokens: data.completionTokens
      }
    });
  }

  /**
   * Retrieves all AI history logs registered under a workspace.
   * @param {string} workspaceId - Unique workspace UUID
   * @returns {Promise<Array>}
   */
  async findByWorkspaceId(workspaceId) {
    return prisma.aIHistory.findMany({
      where: {
        workspaceId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}

export default new AIHistoryRepository();
