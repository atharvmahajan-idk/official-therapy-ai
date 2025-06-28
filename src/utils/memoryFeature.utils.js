// import { appendGenralLogs } from "./genralLogs.util.js";
import { GoogleGenAI } from "@google/genai";
import { client } from "../config/qdrant.config.js";
import { RedisClient } from "../config/redis.config.js";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import { userMap } from "../utils/maps.utils.js";

async function memoryFeature(email, session, messLength = -3, redis = true) {
    const { success, messagesList } = await getUserLastTenMess(
        email,
        messLength
    );
    if(success){
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
        let collectionName = "therapy-AI"
        await client.upsert(collectionName, {
            points: finalList, // each: { id, vector, payload }
            wait: true
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
