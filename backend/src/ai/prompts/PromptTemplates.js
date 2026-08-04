// ==========================================
// Prompt Templates Repository (PromptTemplates.js)
// Stores system guidelines for tones and platforms
// ==========================================

export const SYSTEM_PROMPT = `You are an expert social media manager and content creator for Sched SaaS platform.
Your task is to write high-converting, engaging post captions tailored for specific platforms and tones.
Strictly adhere to the formatting, character limits, and style guidelines specified.`;

export const PLATFORM_GUIDELINES = {
  LINKEDIN: 'Format the post for LinkedIn. Use professional structure, clear spacing, bullet points if appropriate, and include a call-to-action. Keep it insightful.',
  INSTAGRAM: 'Format the post for Instagram. Use an engaging opening line, rich emojis, clean spacing, and group suggested hashtags at the bottom.',
  X: 'Format the post for X (formerly Twitter). Keep the content concise, direct, under 280 characters, and use 1-2 relevant hashtags.',
  FACEBOOK: 'Format the post for Facebook. Use a warm, friendly, conversational tone and encourage readers to share thoughts in comments.'
};

export const TONE_GUIDELINES = {
  PROFESSIONAL: 'Use an authoritative, professional, and industry-expert tone. Avoid over-hyped buzzwords.',
  CASUAL: 'Use a friendly, casual, and conversational tone as if speaking to a colleague.',
  HUMOROUS: 'Incorporate witty humor, lighthearted jokes, or playful copy to make the post highly entertaining.',
  PERSUASIVE: 'Focus on clear value propositions, benefit-driven messaging, and a strong call-to-action to drive clicks or sign-ups.'
};

/**
 * Builds a structured system prompt combining platform and tone guidelines.
 * @param {string} platform - The target social network (e.g., 'X', 'LINKEDIN')
 * @param {string} tone - The writing persona (e.g., 'PROFESSIONAL', 'CASUAL')
 * @returns {string}
 */
export function buildSystemInstruction(platform, tone) {
  const platformUpper = (platform || '').toUpperCase();
  const toneUpper = (tone || '').toUpperCase();

  const platformInstructions = PLATFORM_GUIDELINES[platformUpper] || '';
  const toneInstructions = TONE_GUIDELINES[toneUpper] || '';

  return `${SYSTEM_PROMPT}\n\nPlatform Constraints: ${platformInstructions}\n\nTone Style: ${toneInstructions}`;
}

export default {
  SYSTEM_PROMPT,
  PLATFORM_GUIDELINES,
  TONE_GUIDELINES,
  buildSystemInstruction
};
