import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";
import path from "path";

// Helper function to create the system prompt
async function createSystemPrompt(email, username) {
  console.log("====== Setting up Gemini ======");
  
  // Path to the prompt file
  const promptPath = path.resolve("src/prompts", "systemPrompt.txt");
  console.log("Using prompt file at:", promptPath);

  // Read the base prompt from file
  let basePrompt = await fs.readFile(promptPath, "utf-8");

  // Add user details to the prompt
  const fullPrompt = `
    User: ${username}
    Email: ${email}

    ${basePrompt}
  `.trim();

  console.log("Final system prompt ready");
  return fullPrompt;
}

// Main Gemini function
async function geminiFunction(email, username, transcript, model, isJournal = false, isSummary = false) {
  console.log("====== Running Gemini Function ======");
  console.log(`Model: ${model}, Journal: ${isJournal}, Summary: ${isSummary}`);

  // Only generate system prompt for regular chats
  let systemPrompt = "";
  if (!isJournal && !isSummary) {
    systemPrompt = await createSystemPrompt(email, username);
  }

  // Initialize Gemini
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINA_API_KEY });

  try {
    // Send request to Gemini
    const geminiResponse = await genAI.models.generateContent({
      model: model,
      contents: transcript,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const responseText = geminiResponse.text;
    console.log("Raw Gemini response:", responseText);

    // Try to extract JSON if present
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        console.log("Parsed JSON response:", parsedResponse);
        return {
          success: true,
          message: parsedResponse.response ,
          summaries: parsedResponse.summaries,
        };
      } catch (parseError) {
        console.log("Couldn't parse JSON, using raw response");
        // If parsing fails, continue with raw response
      }
    }

    // Return successful response
    return {
      success: true,
      message: responseText.response,
      summaries: responseText.summaries,
    };

  } catch (error) {
    console.log("Gemini error occurred:", error.message);
    return {
      success: false,
      message: "I'm having some trouble right now. Please try again later.",
      summaries: false,
    };
  }
}

export { geminiFunction };