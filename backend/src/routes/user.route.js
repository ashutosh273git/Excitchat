import express from "express";
import { getMyFriends, getRecommendedUsers } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const userRoutes = express.Router()

userRoutes.use(authMiddleware)

userRoutes.get("/", getRecommendedUsers)
userRoutes.get("/friends", getMyFriends)

export default userRoutes