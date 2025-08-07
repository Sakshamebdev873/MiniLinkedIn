import express from "express";
import { register, login,logoutUser, getUserById } from "../Controllers/authController.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logoutUser);
router.get('/getuser/:userId',getUserById)

export default router;
