import express from "express";
import { getMyFriends, getRecommendedUsers, sendFriendRequest } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const userRoutes = express.Router()

userRoutes.use(authMiddleware)

userRoutes.get("/", getRecommendedUsers)
userRoutes.get("/friends", getMyFriends)
userRoutes.post("/friend-request/:id", sendFriendRequest)

export default userRoutes