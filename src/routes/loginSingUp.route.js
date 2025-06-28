import express from "express";  
import { signupController } from "../controllers/singup.controller.js";
import { loginController } from "../controllers/login.controller.js";

const router =  express.Router();

router.get('/', (req, res) => {
    res.render('longinSingup');
})

router.post('/singup', signupController)
router.post('/login' ,  loginController)
export {router as loginSingUpRouter};