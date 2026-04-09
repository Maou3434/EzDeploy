import axios from 'axios';

const OLLAMA_URL = 'http://localhost:11434/api/generate';

export const getAIResponse = async (prompt, systemPrompt = "") => {
  try {
    const response = await axios.post(OLLAMA_URL, {
      model: 'mistral', // Using mistral since it was running in the user terminal
      prompt: prompt,
      system: systemPrompt,
      stream: false
    });
    return response.data.response;
  } catch (error) {
    console.error("Ollama Error:", error);
    return "I'm offline right now, but I can still help you manually! Check your deployment status below.";
  }
};

export const analyzeBuildLogs = async (appName, logs) => {
    const prompt = `Analyze these deployment logs for the app '${appName}' and provide a concise, friendly summary of findings or fixes if there are errors:\n\n${logs}`;
    const systemPrompt = "You are EZDeploy AI, a helpful cloud architect. Be technical but friendly. Focus on actionable fixes.";
    return await getAIResponse(prompt, systemPrompt);
};
