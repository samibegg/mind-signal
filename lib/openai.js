// lib/openai.js
// Complete implementation for OpenAI API integration

import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Function to run an OpenAI model.
 * @param {string} fullPrompt - The complete prompt string containing SYSTEM and USER instructions.
 * @returns {Promise<string>} A JSON string with the analysis or an error message.
 */
export async function runOpenAI(fullPrompt) {
  if (!openai) {
    return JSON.stringify({ error: "OpenAI API key is not configured in .env.local" });
  }

  try {
    // OpenAI's API works best with separate system and user prompts.
    // We'll parse the full prompt to extract these roles.
    const parts = fullPrompt.split('USER:');
    const systemPrompt = parts[0].replace('SYSTEM:', '').trim();
    const userPrompt = `USER:${parts[1]}`.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // A powerful model well-suited for JSON output and complex instructions
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }, // Instruct the model to return a JSON object
    });

    // Return the JSON string from the API response.
    return response.choices[0].message.content;

  } catch (error) {
    console.error("Error running OpenAI API:", error);
    return JSON.stringify({ error: "Could not get a response from the OpenAI API. Please check the server console." });
  }
}

