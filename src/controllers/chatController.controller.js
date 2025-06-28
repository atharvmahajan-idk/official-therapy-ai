import { geminiFunction } from "../apis/genima.api.js";
import { murfFunction } from "../apis/murf.api.js";
import { checkUser } from "../utils/checkUser.utils.js";
import { userMap, activeUsers } from "../utils/maps.utils.js";
import {RedisClient} from "../config/redis.config.js"; // Assuming you have this setup
import { geminaVoiceModelFuction } from "../apis/geminiVoiceModel.js";

async function chatController(req, res, next) {
    try {
        console.log("============= Chat Controller =============");

        // Destructure request data
        const { email, username } = req;
        const { transcript, time  ,  prompt} = req.body;
        let geminiResponse_success = false;
        // Validate required fields
        if (!transcript) {
            console.error("Missing required fields: transcript or time");
            return res.status(400).json({
                success: false,
                message: "Both transcript and time are required.",
            });
        }


        console.log(`Processing request from ${username} (${email})`);
        console.log("Transcript:", transcript);

        // Ensure user exists in maps
        if (!userMap.has(email) || !activeUsers.has(email)) {
            console.log("Adding user to maps");
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
            console.log("Processing non-empty transcript");
            
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
                response.message = "i am having issues right now,"
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
                console.log("Gemini response:", geminiResponse);
                // Store summary in Redis if available
                if (geminiResponse.summaries) {
                    try {
                        const redisKey = `user:${email}:summaries`;
                        await RedisClient.rPush(redisKey, JSON.stringify(geminiResponse.summaries));
                        console.log(`Successfully appended summary to Redis list for user ${email}`);
                
                        console.log("Successfully stored summary in Redis");
                        let user = userMap.get(email);
                        user.totalMess += 1;
                        user.last4Mess += 1;
                    } catch (redisError) {
                        console.error("Redis storage error:", redisError);
                        // Continue with response even if Redis fails
                    }
                }
                console.log(userMap.get(email));

                // if(!audioResponse.success) {
                //     console.error("Gemina voice model function failed:", audioResponse.message);
                // }

                
                // Generate audio response
                // const murfResponse = await murfFunction(response.message);
                // if (murfResponse?.audioData) {
                //     response.audioData = murfResponse.audioData;
                // }
            }

        }
        if(prompt){
            return  res.status(200).json({
                success: true,
                message:response.message
            })
        }
        let audioResponse = await geminaVoiceModelFuction(response.message);
        // console.log("Gemina Voice Response:", audioResponse);
        if(audioResponse.success) {
            response.audioData = audioResponse.audioFile;
        }
        let userDetail = userMap.get(email);
        if(userDetail.last4Mess >= 5){
            console.log("=============calling memory function=============")
            userDetail.last4Mess = 0
            const session = userDetail.sessionID
            memoryFeature(email ,  session)
        }
        res.status(200).json(response)
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