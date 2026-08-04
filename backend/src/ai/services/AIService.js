// ==========================================
// AI Service Orchestrator (AIService.js)
// Coordinates business flows, prompts, and providers
// ==========================================

import WorkspaceMemberRepository from '../../repositories/WorkspaceMemberRepository.js';
import AIHistoryRepository from '../../repositories/AIHistoryRepository.js';
import AIProvider from '../providers/AIProvider.js';
import { buildSystemInstruction } from '../prompts/PromptTemplates.js';
import { AppError } from '../../errors/AppError.js';

export class AIService {
  /**
   * Generates post content and logs the interaction.
   * @param {object} payload - Generation parameters
   * @returns {Promise<{ text: string, historyEntry: object }>}
   */
  async generateContent(payload) {
    const { workspaceId, userId, prompt, platform, tone, providerName = 'gemini' } = payload;

    // 1. Authorize workspace membership
    const membership = await WorkspaceMemberRepository.findByWorkspaceAndUser(workspaceId, userId);
    if (!membership || membership.deletedAt) {
      throw new AppError('You are not a member of this workspace.', 403);
    }

    // 2. Resolve AI provider
    const provider = AIProvider.get(providerName);

    // 3. Construct system instruction guidelines
    const systemInstruction = buildSystemInstruction(platform, tone);

    // 4. Invoke AI model generation
    const result = await provider.generate(prompt, systemInstruction);

    // 5. Audit log generated data in AIHistory DB table
    const historyEntry = await AIHistoryRepository.createHistoryEntry({
      workspaceId,
      userId,
      provider: provider.name,
      model: provider.config.model || 'gemini-1.5-flash',
      prompt,
      response: result.text,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens
    });

    return {
      text: result.text,
      historyEntry
    };
  }

  /**
   * Retrieves AI prompt/response log histories for a workspace.
   * @param {string} workspaceId - Unique workspace UUID
   * @param {string} userId - User requesting information
   * @returns {Promise<Array>}
   */
  async getWorkspaceHistory(workspaceId, userId) {
    // Authorize workspace membership
    const membership = await WorkspaceMemberRepository.findByWorkspaceAndUser(workspaceId, userId);
    if (!membership || membership.deletedAt) {
      throw new AppError('You are not a member of this workspace.', 403);
    }

    return AIHistoryRepository.findByWorkspaceId(workspaceId);
  }
}

export default new AIService();
