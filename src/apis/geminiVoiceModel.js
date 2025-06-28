import {GoogleGenAI } from "@google/genai";
import path from "path"
import fs from "fs/promises"
import { response } from "express";
import wav from "wav";
import { Stream } from "stream"
import { write } from "fs";

async function convertIntoWav(
    pcmData,
    channels = 1,
    rate = 24000,
    sampleWidth = 2
) {
  try {
    const writer = new wav.Writer(
      {
        channels,
        sampleRate: rate,
        bitDepth: sampleWidth * 8,
      }
    )  
    console.log("wav created")
    var chunks = []
  
    const passTrough = new Stream.PassThrough()
    passTrough.on('data' , data=>chunks.push(data))
    writer.pipe(passTrough)
    console.log("stream attached")
    const done = new Promise(resolve => writer.on('finish' , resolve))
    
    writer.write(pcmData)
    console.log("sending data to writer")
    writer.end()
    console.log("data sended")
  
    await done
    // console.log("buffer: " , chunks)
    return Buffer.concat(chunks)
  } catch (error) {
    console.log(error.messsage)
    return true
  }
}

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
            audioFile:""
        };
    }
    try {
        

        const ai = new GoogleGenAI({ apiKey: API_KEY });
        console.log("Gemini AI initialized successfully");
        // Generate audio content
        const res = await ai.models.generateContent({
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
        res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        const audioBuffer = Buffer.from(data, "base64");
        const buffer = await convertIntoWav(audioBuffer)
        console.log("Audio buffer converted to WAV format successfully");

        return {
            success: true,
            audioFile: buffer.toString('base64')|| "not available",
            message: response,
            status: 200,
          };
        
      } catch (error) {
        console.error("Voice model error:", error);
        return {
            success: false,
            message: "Error generating audio response",
            audioFile: ""
        };
      }
    
    
}
export {geminaVoiceModelFuction}