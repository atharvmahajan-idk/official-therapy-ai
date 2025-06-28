import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";
import path from "path";

async function generateSystemPrompt(email, username) {
    console.log("====== gemini func======")
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
  console.log("======================Genima function======================");

  let systemPrompt = "";

  if (!isJournal && !isSummary) {
    systemPrompt = await generateSystemPrompt(email, username);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINA_API_KEY });

  try {
    var response = await ai.models.generateContent({
      model: model,
      contents: transcript,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const res = response.text;
    const match = res.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        // console.log("match: ", match);
        response = JSON.parse(match[0]);
      } catch (error) {
        console.error("Log Error:", error.message); // Replace with actual logging function or import it
        return {
          success: false,
          message: error.messaage,
        };
      }
    }
    console.log(match)
    console.log("Gemini response:", res);
    return {
      success: true,
      message: res,
      summaries: res,
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
