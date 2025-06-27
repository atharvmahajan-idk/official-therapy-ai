import mongoose  from "mongoose";
import { ApiError } from "../utils/apiError.utils.js";
import { appendGeneralLog } from "../utils/appendGenralLog.utils.js";

const connectToMongo = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected:', connection.connection.host);
    } catch (error) {

        const message =  `ERROR: ${error.message}; status:${500} ; source:connectToMongo function in mongo.config.js`;
        console.log(message);
        appendGeneralLog(message)
    }
};

export { connectToMongo };