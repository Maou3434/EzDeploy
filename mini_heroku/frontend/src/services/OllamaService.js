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
/**
 * Project-Wide Sentinel Scan
 * Analyzes the holistic project structure for architecture and security issues.
 */
export const runSentinelScan = async (appName, fileList) => {
    const prompt = `Perform a high-level Sentinel Scan on the project [${appName}]. 
    Provided below is the list of files in the project.
    Identify:
    1. Missing essential files (e.g., .dockerignore, requirements.txt, readme.md).
    2. Security vulnerabilities (patterns suggesting hardcoded secrets).
    3. Structural optimizations.
    
    Return your findings as a JSON-compatible list of objects with the following keys:
    - type: "architecture" | "security" | "optimization"
    - title: short descriptive title
    - description: what is wrong
    - severity: "high" | "medium" | "low"
    - fix_file: the filename that needs to be created or modified
    - fix_label: e.g. "Generate .dockerignore"
    
    PROJECT FILES:\n${fileList.join('\n')}`;
    
    const systemPrompt = "You are the EzDeploy Sentinel. You specialize in software architecture and security audits. Only provide technical, actionable advice. Format your main output as a clear list of issues, but ensure each issue has a concrete 'fix_file' suggestion.";
    return await getAIResponse(prompt, systemPrompt);
};

/**
 * Automated Fix Generation
 * Generates the content for a suggested fix file.
 */
export const generateFix = async (appName, fixType, fileName, existingContext = "") => {
    const prompt = `Generate the optimal content for the file [${fileName}] in the project [${appName}]. 
    Fix Type: ${fixType}
    Existing Context/Target Issue: ${existingContext}
    
    Return ONLY the file content. No markdown formatting, no explanations, just the raw code/text that should be saved to the file.`;
    
    const systemPrompt = "You are a senior DevOps engineer. You generate perfect, production-ready configuration and source code. No preamble, no chat, just raw file content.";
    return await getAIResponse(prompt, systemPrompt);
};
