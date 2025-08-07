import express from "express";
import { register, login,logoutUser, getUserById } from "../Controllers/authController.js";
const router = express.Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/logout", logoutUser);
router.get('/auth/getuser/:userId',getUserById)

export default router;
