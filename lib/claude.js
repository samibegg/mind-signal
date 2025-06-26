// 11. lib/claude.js
import Anthropic from '@anthropic-ai/sdk';
const anthropic = process.env.CLAUDE_API_KEY ? new Anthropic({ apiKey: process.env.CLAUDE_API_KEY }) : null;
export async function runClaude(fullPrompt) {
  if (!anthropic) return JSON.stringify({ error: "Anthropic Claude API key is not configured in .env.local" });
  try {
    const parts = fullPrompt.split('USER:');
    const systemPrompt = parts[0].replace('SYSTEM:', '').trim();
    const userPrompt = `USER:${parts[1]}`.trim();
    const response = await anthropic.messages.create({ model: "claude-3-sonnet-20240229", max_tokens: 4096, system: systemPrompt, messages: [{ role: "user", content: userPrompt }], });
    return response.content[0].text;
  } catch (error) {
    console.error("Error running Anthropic Claude API:", error);
    return JSON.stringify({ error: "Could not get a response from the Claude API. Please check the server console." });
  }
}
