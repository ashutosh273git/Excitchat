import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./libs/db.js";

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

app.use("/api/v1/auth", authRoutes)

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })   
})