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
      model: "claude-3-sonnet-20240229", // A fast and capable model from the Claude 3 family
      max_tokens: 4096, // Set a max token limit for the response
      system: systemPrompt,
      messages: [
        { role: "user", content: userPrompt }
      ],
    });

    // Claude is excellent at following instructions. The prompt's requirement for JSON
    // is usually sufficient. We return the text content which should be a JSON string.
    return response.content[0].text;

  } catch (error) {
    console.error("Error running Anthropic Claude API:", error);
    return JSON.stringify({ error: "Could not get a response from the Claude API. Please check the server console." });
  }
}

