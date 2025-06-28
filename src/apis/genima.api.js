import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";
import path from "path";

async function generateSystemPrompt(email, username) {
  const promptFilePath = path.resolve("src/prompts", "systemPrompt.txt");
  console.log("Reading from:", promptFilePath);

  let systemPrompt = await fs.readFile(promptFilePath, "utf-8");

  systemPrompt = `
User: ${username}
Email: ${email}

${systemPrompt}
  `.trim();

  console.log("System prompt generated:", systemPrompt);
  return systemPrompt;
}

async function geminiFunction(
  email,
  username,
  transcript,
  model, 
  isJournal = false,
  isSummary = false
) {
  let systemPrompt = "";

  if (!isJournal && !isSummary) {
    systemPrompt = await generateSystemPrompt(email, username);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINA_API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: transcript,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const res = response.text;

    return {
      success: true,
      message: res,
      summaries: false,
    };
  } catch (error) {
    console.error("Error in Gemini Function:", error.message);
    return {
      success: false,
      message: "I am having issues right now",
      summaries: false,
    };
  }
}

export { geminiFunction };
