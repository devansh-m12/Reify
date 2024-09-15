import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export async function generateQuestions({prompt}: {prompt: string}) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro-latest' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error in generateQuestions:', error);
    throw new Error('Failed to generate questions');
  }
}
