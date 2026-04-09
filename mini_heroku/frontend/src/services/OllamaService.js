import axios from 'axios';

const OLLAMA_URL = 'http://localhost:11434/api/generate';

export const getAIResponse = async (prompt, systemPrompt = "") => {
  try {
    const response = await axios.post(OLLAMA_URL, {
      model: 'mistral',
      prompt: prompt,
      system: systemPrompt,
      stream: false
    });
    return response.data.response;
  } catch (error) {
    console.error("Ollama Error:", error);
    return "AI Assistant is currently offline. Please ensure your local Ollama server is running.";
  }
};

/**
 * Intelligent App Diagnostics
 * Performs a sanity check on source code or Dockerfiles.
 */
export const runDiagnostics = async (fileName, content) => {
    const prompt = `Analyze the following file [${fileName}] for potential security risks, performance improvements, and syntax errors. Provide a clear and professional report.\n\nFILE CONTENT:\n${content}`;
    const systemPrompt = "You are the EzDeploy Technical Assistant. You provide professional, concise, and easy-to-understand feedback for developers. Structure your response with [ANALYSIS], [RECOMMENDATIONS], and [NEXT STEPS]. Keep it professional and helpful.";
    return await getAIResponse(prompt, systemPrompt);
};

/**
 * Intelligent Error Analysis
 * Analyzes deployment logs when a stage fails.
 */
export const runFieldTriage = async (appName, logs) => {
    const prompt = `Review the failure logs for app [${appName}] and determine the root cause. Provide a clear solution for the customer.\n\nLOGS:\n${logs}`;
    const systemPrompt = "You are the EzDeploy Technical Assistant. Your goal is to help customers understand and fix deployment errors. Be clear, empathetic, and professional. Provide the most likely solution first.";
    return await getAIResponse(prompt, systemPrompt);
};
