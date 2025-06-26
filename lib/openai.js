// 10. lib/openai.js
import OpenAI from 'openai';
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
export async function runOpenAI(fullPrompt) {
  if (!openai) return JSON.stringify({ error: "OpenAI API key is not configured in .env.local" });
  try {
    const parts = fullPrompt.split('USER:');
    const systemPrompt = parts[0].replace('SYSTEM:', '').trim();
    const userPrompt = `USER:${parts[1]}`.trim();
    const response = await openai.chat.completions.create({ model: "gpt-4o", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], response_format: { type: "json_object" }, });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error running OpenAI API:", error);
    return JSON.stringify({ error: "Could not get a response from the OpenAI API. Please check the server console." });
  }
}
