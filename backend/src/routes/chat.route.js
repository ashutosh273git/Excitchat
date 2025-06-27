import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getStreamToken } from "../controllers/chat.controller.js";

const chatRoutes = express.Router()
chatRoutes.use(authMiddleware)

chatRoutes.get("/token", getStreamToken)

export default chatRoutes