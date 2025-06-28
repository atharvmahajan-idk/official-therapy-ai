// import { appendGenralLogs } from "./genralLogs.util.js";
import { GoogleGenAI } from "@google/genai";
import { client } from "../config/qdrant.config.js";
import { RedisClient } from "../config/redis.config.js";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import { userMap } from "../utils/maps.utils.js";

async function GetEmbedings(messagesList, email, session) {
    // memoryFeatureLogs(`\n${messagesList}`)
    let list = messagesList.map((Obj) => {
      console.log(Obj);
      let obj = Obj;
      console.log(obj)
      let string = `
              User Summary: ${obj.user_prompt}
              AI Summary: ${obj.ai_response}
              Mood Score: ${obj.moodScore}
              Events: ${obj.events.length ? obj.events.join(", ") : "None"}
              Emotional State: ${
                obj.emotinol_state.length ? obj.emotinol_state.join(", ") : "None"
              }
          `.trim();
      // return
      return [
        `User Summary: ${obj.user_prompt}`,
        `AI Summary: ${obj.ai_response}`,
        `Mood Score: ${obj.moodScore}`,
        `Events: ${obj.events.length ? obj.events.join(", ") : "None"}`,
        `Emotional State: ${
          obj.emotinol_state.length ? obj.emotinol_state.join(", ") : "None"
        }`,
      ].join("\n"); // clean join without spaces or indentation
    });
    // console.log(list)
    list.forEach((element) => {
      console.log("\n", element);
    });
    const API_KEY = process.env.GEMINA_API_KEY;
    // messagesList =  messagesList.map(obj=>{
    //     let string = `
    //         user_promptSummarie: ${obj.}
    //     `
    // })
    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const response = await ai.models.embedContent({
        model: "gemini-embedding-exp-03-07",
        contents: list,
      });
      let embeddings = response.embeddings;
      const qdrantPoints = messagesList.map((obj, idx) => ({
        id: randomUUID(),
        vector: embeddings[idx].values, // from Gemini
        payload: {
          user_prompt: obj.user_prompt,
          ai_response: obj.ai_response,
          moodScore: obj.moodScore,
          events: obj.events,
          emotional_state: obj.emotinol_state,
          email: email,
          session: session,
        },
      }));
  
      return qdrantPoints;
    } catch (error) {
      const str = error.message;
  
      const match = str.match(/{.*}/s); // `s` flag allows dot to match newline characters too (if any)
  
      if (match) {
        const jsonObj = JSON.parse(match[0]);
        console.log(jsonObj);
      } else {
        console.log("No JSON object found.");
      }
    }
}

async function getUserLastTenMess(email, messLength = -4) {
  try {
    const messagesList = await RedisClient.lRange(
      `users:${email}`,
      messLength,
      -1
    );
    if (messagesList.length === 0) {
      console.log("the list length is empty");
      appendLog("list length is empty", "getUserLastTenMess");
      return {
        success: false,
        messagesList,
      };
    } else if (messagesList.length > 0) {
      console.log("list 200");

      return {
        success: true,
        messagesList,
      };
    }
  } catch (error) {
    console.log(error.message);
    return {
      success: false,
    };
  }
}

async function memoryFeature(email, session, messLength = -4, redis = true) {
  const { success, messagesList } = await getUserLastTenMess(email, messLength);
  if (success) {
    let list = messagesList.map((obj) => {
      try {
        const parseObj = JSON.parse(obj);
        // console.log(parseObj)
        return parseObj.summaries;
      } catch (error) {
        memoryFeatureLogs(error.message);
      }
    });
    const finalList = await GetEmbedings(list, email, session);
    console.log(finalList);
    let collectionName = "therapy-AI";
    await client.upsert(collectionName, {
      points: finalList, // each: { id, vector, payload }
      wait: true,
    });
    console.log("vector success fully upserted");
    const user = userMap.get(email);
    console.log("here is the users before and after");
    console.log(user);
    user.vectorPushes++;
    console.log(user);
    return true;
  }
}
export { memoryFeature };
