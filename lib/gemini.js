// 6. lib/gemini.js (UPDATED)
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
    throw new Error('Invalid/Missing environment variable: "GEMINI_API_KEY"');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configuration to request JSON output from the model
const generationConfig = {
  response_mime_type: "application/json",
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export async function runGemini(prompt) {
  try {
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig,
        safetySettings
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    // The response from the API is now expected to be a stringified JSON object.
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error running Gemini API:", error);
    return JSON.stringify({ error: "Could not get a response from the LLM. Please check the server console." });
  }
}
