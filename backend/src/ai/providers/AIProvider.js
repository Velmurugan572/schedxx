// ==========================================
// AI Provider Factory Registry (AIProvider.js)
// Central resolver for AI engines
// ==========================================

import GeminiProvider from './GeminiProvider.js';

class AIProviderFactory {
  constructor() {
    this.providers = new Map();
    
    // Automatically register default Gemini provider
    this.register('gemini', new GeminiProvider());
  }

  /**
   * Registers a new AI provider instance.
   * @param {string} name - Identifier key
   * @param {BaseAIProvider} providerInstance - Custom provider implementation
   */
  register(name, providerInstance) {
    this.providers.set(name.toLowerCase(), providerInstance);
  }

  /**
   * Resolves a registered AI provider.
   * @param {string} name - Identifier key
   * @returns {BaseAIProvider}
   */
  get(name) {
    const provider = this.providers.get(name.toLowerCase());
    if (!provider) {
      throw new Error(`AI Provider [${name}] is not registered.`);
    }
    return provider;
  }
}

export const AIProvider = new AIProviderFactory();
export default AIProvider;
