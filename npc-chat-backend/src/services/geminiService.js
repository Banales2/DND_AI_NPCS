import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

/**
 * Genera una respuesta del modelo de IA de Google
 * @param {string} prompt - Texto de entrada
 * @returns {Promise<string>} Respuesta generada
 */
export async function generateGeminiResponse(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generando respuesta con Gemini:", error);
    throw error;
  }
}
