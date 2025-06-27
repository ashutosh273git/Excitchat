import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./libs/db.js";
import cookieParser from "cookie-parser"
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())
app.use(cookieParser())

app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/users", userRoutes)
app.use("api/v1/chat", chatRoutes)

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })   
})