const { GoogleGenerativeAI } = require('@google/generative-ai');

const isRetryableGeminiError = (error) => {
  const message = error?.message || '';
  return /\[(503|429)\b|service unavailable|high demand|temporarily unavailable/i.test(message);
};

const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Invalid Gemini response');
      }

      return text;
    } catch (error) {
      const isLastAttempt = attempt === 2;
      if (isLastAttempt || !isRetryableGeminiError(error)) {
        console.error('Gemini API Error:', error.message);
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
    }
  }
};

module.exports = {
  callGemini,
};
