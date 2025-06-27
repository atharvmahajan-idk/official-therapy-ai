import express from "express"
import ejs from "ejs"
import path from "path"
import dotenv from "dotenv"
import {connectToMongo} from "./config/mongo.config.js";
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

// Define a basic route
app.get('/', (req, res) => {
    res.render('index', { title: 'Welcome to Therapy AI' });
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
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});