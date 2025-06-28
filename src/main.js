import express from "express"
import ejs from "ejs"
import path from "path"
import dotenv from "dotenv"
import {connectToMongo} from "./config/mongo.config.js";
import { loginSingUpRouter } from "./routes/loginSingUp.route.js";
import { client } from "./config/qdrant.config.js";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./middlewares/auth.middleware.js";
const app = express();

dotenv.config();

if(!process.env) {
    console.log("No environment variables found. Please set up your .env file.");
}
const PORT = process.env.PORT || 3000;
// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.resolve('src/' , 'views'));

// Serve static files from the public folder
app.use(express.static(path.resolve('public/')));
app.use(express.json());
app.use(cookieParser());
// routes midddleware 
app.use('/auth' ,  loginSingUpRouter);

// Define a basic route
app.get('/', authMiddleware , (req, res) => {
    console.log("User authenticated:", req.email);
    res.render('index');
});


app.use((err, req, res, next) => {
    console.log("Global error handler triggered");
    console.log(err.message , err.status, err.source);
    res.status(500).json({
        message: err.message || 'Internal Server Error',
        status: err.status || 500,
        // source: err.source || 'Unknown'
    })
});


await connectToMongo()
console.log(process.env.QDRANT_API_KEY)
try {
    // await client.createCollection("therapy-AI", {
    //     vectors: {
    //       size: 3072,
    //       distance: "Cosine",
    //     },
    // });
    
    const result = await client.getCollections();
    console.log('List of collections:', result.collections);
} catch (err) {
    console.error('Could not get collections:', err);
}
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});