// 11. lib/claude.js


// lib/claude.js
// Complete implementation for Anthropic Claude API integration

import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client
const anthropic = process.env.CLAUDE_API_KEY
  ? new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })
  : null;

/**
 * Function to run a Claude model.
 * @param {string} fullPrompt - The complete prompt string containing SYSTEM and USER instructions.
 * @returns {Promise<string>} A JSON string with the analysis or an error message.
 */
export async function runClaude(fullPrompt) {
  if (!anthropic) {
    return JSON.stringify({ error: "Anthropic Claude API key is not configured in .env.local" });
  }

  try {
    // Similar to the OpenAI implementation, we separate the system and user prompts.
    const parts = fullPrompt.split('USER:');
    const systemPrompt = parts[0].replace('SYSTEM:', '').trim();
    const userPrompt = `USER:${parts[1]}`.trim();
    
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514", // A fast and capable model from the Claude 3 family
      max_tokens: 4096, // Set a max token limit for the response
      system: systemPrompt,
      messages: [
        { role: "user", content: userPrompt }
      ],
    });

    let jsonString = response.content[0].text;

    // **FIX:** Check for and remove the JSON Markdown wrapper if Claude adds it.
    if (jsonString.startsWith("```json\n")) {
        jsonString = jsonString.substring(7, jsonString.length - 3).trim();
    }

    // Return the cleaned JSON string.
    return jsonString;

  } catch (error) {
    console.error("Error running Anthropic Claude API:", error);
    return JSON.stringify({ error: "Could not get a response from the Claude API. Please check the server console." });
  }
}
