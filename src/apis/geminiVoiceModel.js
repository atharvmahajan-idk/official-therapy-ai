import {GoogleGenAI } from "@google/genai";
import path from "path"
import fs from "fs/promises"
import { response } from "express";



async function geminaVoiceModelFuction(response){
    console.log(
        "======================Genima voiceModel function======================"
      );
    const API_KEY = process.env.GEMINA_API_KEY;
    console.log("API Key:", API_KEY);
    if (!API_KEY) {
        console.error("Gemini API key is not set in environment variables.");
        return {
            success: false,
            message: "Gemini API key is not set.",
            audioBase64:""
        };
    }
    try {
        

        const ai = new GoogleGenAI({ apiKey: API_KEY });
        console.log("Gemini AI initialized successfully");
        // Generate audio content
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: response }] }],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: "kore" },
              },
            },
          },
        });
    
        console.log("Audio response generated successfully");
        const data =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        const audioBuffer = Buffer.from(data, "base64");
        
        
      } catch (error) {
        console.error("Voice model error:", error);
        return {
            success: false,
            message: "Error generating audio response",
            audioBase64: ""
        };
      }
    
    
}