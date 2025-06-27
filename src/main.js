import express from "express"
import ejs from "ejs"
import path from "path"
import dotenv from "dotenv"
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});