import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be of 8 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "There is already a user with this email",
      });
    }

    const seed = Math.random().toString(36).substring(7);
    const avatar = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`;

    const newUser = await User.create({
      fullName,
      email,
      password,
      profilePic: avatar,
    });

    const userToSend = newUser.toObject();
    delete userToSend.password;

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, // prevent XSS attacks
      sameSite: "strict", // prevent CSRF attacks
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({
      message: "User created successfully",
      user: userToSend,
    });
  } catch (error) {
    console.error("Error in signup", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {};

export const logout = async (req, res) => {};
