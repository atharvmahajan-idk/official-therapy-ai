import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";
import path from "path";
import { RedisClient } from "../config/redis.config.js";
// Helper function to create the system prompt

async function getLastFourMessages(email) {
  try {
      // Get last 4 messages from Redis
      const messages = await RedisClient.lRange(`user:${email}`, -4, -1);
      
      // Parse messages and filter out invalid ones
      const validMessages = [];
      for (const msg of messages) {
          try {
              validMessages.push(JSON.parse(msg));
          } catch {
              console.log("Skipping invalid message format");
          }
      }
      
      return validMessages;
  } catch (error) {
      console.log("Error getting messages:", error.message);
      return [];
  }
}


async function createSystemPrompt(email, username) {
  try {
      // Read prompt template
      const promptPath = path.resolve("src/prompts", "systemPrompt.txt");
      const basePrompt = await fs.readFile(promptPath, "utf-8");
      
      // Combine with user info
      return `
User: ${username}
Email: ${email}

${basePrompt}
      `.trim();
      
  } catch (error) {
      console.log("Error creating prompt:", error.message);
      // Fallback prompt
      return `User: ${username}\nEmail: ${email}\n\nPlease respond helpfully.`;
  }
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