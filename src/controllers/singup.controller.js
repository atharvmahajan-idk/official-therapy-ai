import { User } from "../models/user.model.js";
import { Journal } from "../models/jounral.model.js";
import bcrypt from "bcrypt";

async function signupController(req, res) {
    const { username, email, password } = req.body;
    console.log(username, email, password);
    if(!username || !email || !password) {
        return res.status(400).json({ success:false,message: "All fields are required" });
    }
    console.log("user can be created");
    if(username.length === 0 || email.length === 0 || password.length === 0) {
        return res.status(400).json({ success:false,message: "All fields are required" });
    }
    console.log("user is not empty");
    const encrytedPassword = await bcrypt.hash(password, 10);
    const user = new User({
        username,
        email,
        password: encrytedPassword
    });
    await user.save()
    console.log("user is created");
    const jounral = new Journal({
        email
    });
    await jounral.save()
    console.log("jounral is created");
    res.status(201).json({ success: true, message: "User created successfully" });

}

export { signupController };    