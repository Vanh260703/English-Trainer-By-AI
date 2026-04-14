const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Trả về model instance.
 * Dùng chung một model name từ .env để dễ đổi sau.
 * apiVersion: 'v1' vì gemini-1.5-flash không available trên v1beta mặc định.
 */
const getModel = (modelName = process.env.GEMINI_MODEL || 'gemini-3-flash-preview') =>
  genAI.getGenerativeModel({ model: modelName });

module.exports = { getModel };
