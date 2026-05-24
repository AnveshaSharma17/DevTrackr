/**
 * Gemini AI Client
 * Uses @google/genai SDK with automatic model fallback on quota errors
 */
const { GoogleGenAI } = require('@google/genai');

let aiInstance = null;

const getAI = () => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiInstance;
};

const PRIMARY_MODEL  = process.env.GEMINI_MODEL          || 'gemini-2.0-flash';
const FALLBACK_MODEL = process.env.GEMINI_MODEL_FALLBACK || 'gemini-1.5-flash';

/**
 * Attempt a single generateContent call with a given model
 */
const callModel = async (model, prompt) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });
  return response.text;
};

/**
 * Generate content with model fallback + retry logic
 * Order: PRIMARY_MODEL → FALLBACK_MODEL → throw
 */
const generateContent = async (prompt, retries = 1) => {
  const models = [PRIMARY_MODEL, FALLBACK_MODEL];

  for (const model of models) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const text = await callModel(model, prompt);
        if (model !== PRIMARY_MODEL) {
          console.log(`⚡ Used fallback model: ${model}`);
        }
        return text;
      } catch (error) {
        const status = error.status || error.response?.status;
        const msg    = error.message || '';

        const isQuota      = status === 429 || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
        const isRetryable  = isQuota || status === 503 || status === 500;
        const isNotFound   = status === 404 || msg.includes('not found') || msg.includes('does not exist');

        // If model doesn't exist, skip to next model immediately
        if (isNotFound) {
          console.warn(`⚠️  Model "${model}" not found, trying next...`);
          break; // break inner retry loop → try next model
        }

        // On quota/rate-limit: try retrying this model first, then fall through to next
        if (isRetryable && attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`🔄 Gemini retry attempt ${attempt + 1} on ${model} after ${delay}ms`);
          await new Promise((res) => setTimeout(res, delay));
          continue;
        }

        // Quota exhausted after retries → try next model
        if (isQuota) {
          console.warn(`⚠️  Quota exhausted for "${model}", trying fallback...`);
          break;
        }

        // For non-quota errors, log and rethrow immediately
        console.error(`Gemini API Error [${model}]:`, msg);
        throw error;
      }
    }
  }

  // All models failed
  const err = new Error('All Gemini models exhausted or unavailable');
  err.isGeminiFailure = true;
  throw err;
};

module.exports = { generateContent, PRIMARY_MODEL, FALLBACK_MODEL };
