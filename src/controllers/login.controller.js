import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

async function loginController(req, res) { 
    const { email, password } = req.body;
    console.log(email ,  password)
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }
    console.log("user cradintials are not empty");
    try {
        const user = await User.findOne({ email });
        // console.log(");
        if (!user) {
            console.log("user not exist");
            return res.status(404).json({ success: false, message: "User not found" });
        }
        console.log("user exist")
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log("password does not match");
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        console.log("password is valid", isPasswordValid);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ email: user.email , name:user.username }, process.env.JWT_KEY, { expiresIn: '7h' });
        console.log("token is generated", token);
        res.cookie("token", token, {
            httpOntokenly: true,
            maxAge: 7 * 60 * 60 * 1000,
            // sameSite: "lax",
          });
        console.log("cookie is set");   
        return res.status(200).json({ success: true, message: "Login successful",  username: user.username });
        // res.status(200).json({ success: true, message: "Login successful" });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
export { loginController };