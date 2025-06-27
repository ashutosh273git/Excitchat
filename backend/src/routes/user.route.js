import express from "express";
import { acceptFriendRequest, getFriendRequests, getMyFriends, getOutgoingFriendRequests, getRecommendedUsers, sendFriendRequest } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const userRoutes = express.Router()

userRoutes.use(authMiddleware)

userRoutes.get("/", getRecommendedUsers)
userRoutes.get("/friends", getMyFriends)
userRoutes.post("/friend-request/:id", sendFriendRequest)
userRoutes.put("/friend-request/:id/accept", acceptFriendRequest)
userRoutes.get("/friend-requests", getFriendRequests)
userRoutes.get("/outgoing-friend-requests", getOutgoingFriendRequests)

export default userRoutes