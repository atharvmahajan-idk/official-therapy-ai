import { geminiFunction } from "../apis/genima.api.js";
import { murfFunction } from "../apis/murf.api.js";
import { checkUser } from "../utils/checkUser.utils.js";
import { userMap, activeUsers } from "../utils/maps.utils.js";

async function chatController(req, res, next) {
    var geminiRes = false
    try {
        console.log("============= Chat Controller =============");

        const email = req.email;
        const username = req.username;
        const { transcript, time } = req.body;

        if (!transcript || !time) {
            console.error("Transcript or time is missing in the request body.");
            return res.status(400).json({
                success: false,
                message: "Transcript and time are required.",
            });
        }

        console.log("Transcript received:", transcript, time);

        // Check if the user exists in the maps
        if (!userMap.has(email) || !activeUsers.has(email)) {
            console.log("============== Creating user in maps ==============");
            checkUser(email);
            console.log("User successfully added to maps.");
        }

        // Call the geminaFunction to process the transcript
        if(!transcript || transcript.trim() === "") {
            var geminaResponse = await geminiFunction(
                email,
                username,
                transcript,
                "gemini-2.5-flash-lite-preview-06-17",
                false,
                false
            );
            if(!geminaResponse.success){
                var geminaResponse = await geminiFunction(
                    email,
                    username,
                    transcript,
                    "gemini-2.0-flash",
                    false,
                    false
                );
                if(geminaResponse.success){
                    geminiRes  = true
                    message = geminaResponse.message             

                }
            }

        }


        console.log("Gemina response:", message);
        const murfAIresponse = await murfFunction(message)
        // console.log()
        res.status(200).json({
            success: true,
            message,
            audioData:"",
        });
    } catch (error) {
        console.error("Error in chatController:", error.message);
        next(error); // Pass the error to the global error handler
    }
}

export { chatController };