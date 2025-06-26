// 7. utils/llmRouter.js (UPDATED)
import { runGemini } from '../lib/gemini';

// This function now builds a more structured prompt designed to elicit a JSON response.
function buildRefinementPrompt(phrases, selectedPromptIds, questionBank) {
  const tasks = selectedPromptIds
    .map(id => {
      const question = questionBank.find(q => q.id === id);
      return question ? `- ${question.prompt}` : '';
    })
    .filter(Boolean)
    .join('\n');

  const systemInstruction = `SYSTEM: You are an expert product strategist, market analyst, and project manager. Your task is to analyze raw, unstructured ideas and provide structured, actionable feedback. You must perform the requested analysis tasks and return the response ONLY as a single, valid JSON object. The keys of the JSON object must be the snake_cased 'id' of each task requested (e.g., 'structure', 'sub_components', 'pitch'). The value for each key must be your analysis, formatted as a Markdown string.`;

  const userPrompt = `
USER: Here are the raw idea snippets, newest last:
- ${phrases.join('\n- ')}

Tasks:
${tasks}

Return a valid JSON object with keys for each requested task: [${selectedPromptIds.map(id => `"${id}"`).join(', ')}]`;

  return `${systemInstruction}\n\n${userPrompt}`;
}

export async function refineIdeaWithLLM(provider, phrases, selectedPromptIds, questionBank) {
  const prompt = buildRefinementPrompt(phrases, selectedPromptIds, questionBank);

  switch (provider) {
    case 'gemini':
      return await runGemini(prompt);
    case 'openai':
      // To-do: Implement OpenAI API call here
      return JSON.stringify({ error: "OpenAI provider is not yet implemented. Please select another provider." });
    case 'claude':
      // To-do: Implement Claude API call here
      return JSON.stringify({ error: "Claude provider is not yet implemented. Please select another provider." });
    default:
        return JSON.stringify({ error: `Unsupported LLM provider: ${provider}` });
  }
}
