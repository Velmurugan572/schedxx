// ==========================================
// Gemini AI Provider (GeminiProvider.js)
// Implements text generation against Gemini 1.5 Flash API
// ==========================================

import BaseAIProvider from './BaseAIProvider.js';
import { env } from '../../config/env.js';
import { logger } from '../../logger/index.js';

export class GeminiProvider extends BaseAIProvider {
  constructor(config = {}) {
    super('GEMINI', config);
    this.apiKey = env.geminiApiKey;
    this.model = config.model || 'gemini-1.5-flash';
  }

  /**
   * Generates text content. Returns simulated response if mock key is configured.
   * @param {string} prompt - User instruction
   * @param {string} [systemInstruction] - Instruction persona
   * @returns {Promise<{ text: string, promptTokens: number, completionTokens: number }>}
   */
  async generate(prompt, systemInstruction = '') {
    // If API key is not configured or set to mock, bypass network request and mock the response
    if (!this.apiKey || this.apiKey === 'mock_gemini_api_key') {
      logger.info('Gemini API key is mock or not set. Returning mock generated response.');
      
      const cleanPrompt = prompt.toLowerCase();
      let generatedText = `Here is a custom post generated for you: "${prompt}". #socialmedia #marketing`;
      
      if (cleanPrompt.includes('launch')) {
        generatedText = `🚀 Exciting News! We are officially launching our new feature today. Check it out and let us know your thoughts! #launch #product #tech #social`;
      } else if (cleanPrompt.includes('tips') || cleanPrompt.includes('productivity')) {
        generatedText = `💡 Quick Tip: Optimize your workflow by focusing on task delegation. It increases throughput and reduces burnout. #productivity #leadership #tips`;
      }

      return {
        text: generatedText,
        promptTokens: Math.max(1, Math.floor(prompt.length / 4)),
        completionTokens: Math.max(1, Math.floor(generatedText.length / 4))
      };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    
    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    };

    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [
          {
            text: systemInstruction
          }
        ]
      };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API returned error status ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      const candidate = responseData.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('Gemini API returned empty response content.');
      }

      const usage = responseData.usageMetadata || {};
      const promptTokens = usage.promptTokenCount || Math.max(1, Math.floor(prompt.length / 4));
      const completionTokens = usage.candidatesTokenCount || Math.max(1, Math.floor(text.length / 4));

      return {
        text,
        promptTokens,
        completionTokens
      };
    } catch (error) {
      logger.error(`Error calling Gemini API: ${error.message}`);
      throw error;
    }
  }
}

export default GeminiProvider;
