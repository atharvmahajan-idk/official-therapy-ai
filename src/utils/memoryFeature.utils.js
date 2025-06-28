import { GoogleGenAI } from "@google/genai";
import { client } from "../config/qdrant.config.js";
import { RedisClient } from "../config/redis.config.js";
import { randomUUID } from "crypto";

async function GetEmbeddings(messagesList, email, session) {
    if (!messagesList || !Array.isArray(messagesList)) {
        throw new Error("Invalid messages list provided");
    }

    try {
        // Prepare text for embedding
        const textList = messagesList.map(obj => {
            if (!obj || typeof obj !== 'object') {
                console.warn("Invalid message object:", obj);
                return "";
            }
            
            return [
                `User Summary: ${obj.user_prompt || "No user prompt"}`,
                `AI Summary: ${obj.ai_response || "No AI response"}`,
                `Mood Score: ${obj.moodScore || "Not rated"}`,
                `Events: ${obj.events?.length ? obj.events.join(", ") : "None"}`,
                `Emotional State: ${obj.emotinol_state?.length ? obj.emotinol_state.join(", ") : "None"}`
            ].join("\n");
        }).filter(text => text.trim());

        if (!textList.length) {
            throw new Error("No valid text content for embedding");
        }

        // Generate embeddings
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINA_API_KEY });
        const response = await ai.models.embedContent({
            model: "gemini-embedding-exp-03-07",
            contents: textList,
        });

        if (!response.embeddings || !response.embeddings.length) {
            throw new Error("No embeddings generated");
        }

        // Prepare Qdrant points
        return messagesList.map((obj, idx) => ({
            id: randomUUID(),
            vector: response.embeddings[idx]?.values || [],
            payload: {
                user_prompt: obj.user_prompt,
                ai_response: obj.ai_response,
                moodScore: obj.moodScore,
                events: obj.events || [],
                emotional_state: obj.emotinol_state || [],
                email: email,
                session: session,
                timestamp: new Date().toISOString()
            }
        }));

    } catch (error) {
        console.error("Embedding generation failed:", error);
        
        // Enhanced error parsing
        try {
            const errorStr = error.message || JSON.stringify(error);
            const jsonMatch = errorStr.match(/{[\s\S]*}/);
            if (jsonMatch) {
                const errorObj = JSON.parse(jsonMatch[0]);
                console.error("Detailed error:", errorObj);
            }
        } catch (parseError) {
            console.error("Error parsing error message:", parseError);
        }
        
        throw error;
    }
}


async function getUserMessages(email, messLength = -4) {
    if (!email) {
        return { success: false, messagesList: [] };
    }

    try {
        const messagesList = await RedisClient.lRange(
            `user:${email}`,
            messLength,
            -1
        );

        return {
            success: messagesList.length > 0,
            messagesList: messagesList.filter(msg => msg).map(msg => {
                try {
                    return JSON.parse(msg);
                } catch (e) {
                    console.error("Failed to parse message:", msg);
                    return null;
                }
            }).filter(msg => msg)
        };
    } catch (error) {
        console.error("Redis retrieval failed:", error);
        return { success: false, messagesList: [] };
    }
}


async function memoryFeature(email, session, messLength = -4) {
    if (!email || !session) {
        console.error("Missing required parameters");
        return false;
    }

    try {
        const { success, messagesList } = await getUserMessages(email, messLength);
        
        if (!success || !messagesList.length) {
            console.log("No valid messages found for user:", email);
            return false;
        }

        // Extract summaries and filter invalid entries
        const summaries = messagesList
            .map(msg => msg?.summaries)
            .filter(summary => summary && typeof summary === 'object');

        if (!summaries.length) {
            console.log("No valid summaries found");
            return false;
        }

        const qdrantPoints = await GetEmbeddings(summaries, email, session);
        
        if (!qdrantPoints.length) {
            console.log("No valid embeddings generated");
            return false;
        }

        // Store in Qdrant
        await client.upsert("therapy-AI", {
            points: qdrantPoints,
            wait: true
        });

        console.log("Vectors successfully upserted");

        // Update user stats
        const user = userMap.get(email);
        if (user) {
            user.vectorPushes = (user.vectorPushes || 0) + 1;
            console.log("Updated user vector pushes:", user.vectorPushes);
        } else {
            console.warn("User not found in userMap:", email);
        }

        return true;

    } catch (error) {
        console.error("Memory feature failed:", error);
        return false;
    }
}

export { memoryFeature };