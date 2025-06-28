import { geminiFunction } from "../apis/genima.api.js";
import { checkUser } from "../utils/checkUser.utils.js";
import { userMap, activeUsers } from "../utils/maps.utils.js";
import { RedisClient } from "../config/redis.config.js";
import { geminaVoiceModelFuction } from "../apis/geminiVoiceModel.js";
import { memoryFeature } from "../utils/memoryFeature.utils.js";

async function chatController(req, res, next) {
    try {
        console.log("============= Chat Controller =============");

        // Destructure request data
        const { email, username } = req;
        const { transcript, time, prompt } = req.body;

        // Validate required fields
        if (!transcript) {
            return res.status(400).json({
                success: false,
                message: "Transcript is required",
            });
        }

        console.log(`Processing request from ${username} (${email})`);

        // Ensure user exists in maps
        if (!userMap.has(email) || !activeUsers.has(email)) {
            checkUser(email);
        }

        // Initialize default response
        let response = {
            success: true,
            message: "Sorry, I didn't hear anything. Please try again.",
            audioData: ""
        };

        // Only process if transcript is not empty
        if (transcript.trim().length > 0) {
            // Try with primary model first
            let geminiResponse = await geminiFunction(
                email,
                username,
                transcript,
                "gemini-2.5-flash-lite-preview-06-17",
                false,
                false
            );

            // Fallback to secondary model if primary fails
            if (!geminiResponse.success) {
                geminiResponse = await geminiFunction(
                    email,
                    username,
                    transcript,
                    "gemini-2.0-flash",
                    false,
                    false
                );
            }

            // Update response if successful
            if (geminiResponse.success) {
                response.message = geminiResponse.message;
                
                // Store summary in Redis if available
                if (geminiResponse.summaries) {
                    try {
                        await RedisClient.rPush(`user:${email}`, JSON.stringify(geminiResponse.summaries));
                        
                        // Update user stats
                        const user = userMap.get(email);
                        user.totalMess += 1;
                        user.last4Mess += 1;

                        // Check if we need to trigger memory feature
                        if (user.last4Mess >= 4) {
                            console.log("Triggering memory feature");
                            user.last4Mess = 0;
                            await memoryFeature(email, user.sessionID);
                        }
                    } catch (error) {
                        console.error("Redis error:", error);
                    }
                }
            }
        }

        // Handle prompt-only responses
        if (prompt) {
            return res.status(200).json({
                success: true,
                message: response.message
            });
        }

        // Generate audio response
        const audioResponse = await geminaVoiceModelFuction(response.message);
        if (audioResponse.success) {
            response.audioData = audioResponse.audioFile;
        }

        return res.status(200).json(response);

    } catch (error) {
        console.error("Chat controller error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while processing your request.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export { chatController };