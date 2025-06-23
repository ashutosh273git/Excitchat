import express from "express";
import { login, logout, me, onboard, signup } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const authRoutes= express.Router()

authRoutes.post("/signup", signup)
authRoutes.post("/login", login)
authRoutes.post("/logout", logout)
authRoutes.post("/onboarding", authMiddleware, onboard)
authRoutes.get("/me", authMiddleware, me)

export default authRoutes