import axios from "axios";

async function murfFunction(aiRes) {
    console.log("========== i am running =========")
    try {
        const data = {
            text: aiRes,
            voiceId: "en-US-terrell",
            encodeAsBase64: true 
          };
          console.log("Data to be sent:", data);
        const res = await axios
        .post("https://api.murf.ai/v1/speech/generate", data, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "api-key": process.env.MURF_API_KEY,
          },
        })
        
        console.log(res)
        // let response =  await dat
    } catch (error) {
        
    }
}
export { murfFunction };