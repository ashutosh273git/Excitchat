import jwt from "jsonwebtoken"
import User from "../models/User.js"
export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.jwt

        if(!token){
            return res.status(401).json({
                message: "Unathorized no token provided"
            })
        }

        const decoded = jwt.decode(token, process.env.JWT_SECRET)

        if(!decoded){
            return res.status(401).json({
                message: "Unauthorized access invalid token"
            })
        }

        const user = await User.findById(decoded.userId).select("-password")

        if(!user){
            res.status(401).json({
                message: "Unauthorized- User not found"
            })
        }

        req.user = user
        next()
    } catch (error) {
        console.error("Error in authMiddleware", error)
        res.status(500).json({message: "Internal server error"})
    }
}