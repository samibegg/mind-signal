// 12. utils/llmRouter.js
import { runGemini } from '../lib/gemini';
import { runOpenAI } from '../lib/openai';
import { runClaude } from '../lib/claude';
function buildRefinementPrompt(phrases, selectedPromptIds, questionBank) {
  const tasks = selectedPromptIds.map(id => questionBank.find(q => q.id === id)?.prompt).filter(Boolean).join('\n');
  const systemInstruction = `SYSTEM: You are an expert product strategist, market analyst, and project manager. Your task is to analyze raw, unstructured ideas and provide structured, actionable feedback. You must perform the requested analysis tasks and return the response ONLY as a single, valid JSON object. The keys of the JSON object must be the snake_cased 'id' of each task requested (e.g., 'structure', 'sub_components', 'pitch'). The value for each key must be your analysis, formatted as a Markdown string.`;
  const userPrompt = `USER: Here are the raw idea snippets, newest last:\n- ${phrases.join('\n- ')}\n\nTasks:\n${tasks}\n\nReturn a valid JSON object with keys for each requested task: [${selectedPromptIds.map(id => `"${id}"`).join(', ')}]`;
  return `${systemInstruction}\n\n${userPrompt}`;
}
export async function refineIdeaWithLLM(provider, phrases, selectedPromptIds, questionBank) {
  const prompt = buildRefinementPrompt(phrases, selectedPromptIds, questionBank);
  switch (provider) {
    case 'gemini': return await runGemini(prompt);
    case 'openai': return await runOpenAI(prompt);
    case 'claude': return await runClaude(prompt);
    default: return JSON.stringify({ error: `Unsupported LLM provider: ${provider}` });
  }
}
