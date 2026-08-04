// ==========================================
// Base AI Provider Class (BaseAIProvider.js)
// Abstract layer for scaling AI models
// ==========================================

export class BaseAIProvider {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
  }

  /**
   * Generates content based on prompt and system instructions.
   * @param {string} prompt - User request/topic
   * @param {string} [systemInstruction] - High-level persona/rules
   * @returns {Promise<{ text: string, promptTokens: number, completionTokens: number }>}
   */
  async generate(prompt, systemInstruction = '') {
    throw new Error('generate() method must be implemented by subclass');
  }
}

export default BaseAIProvider;
