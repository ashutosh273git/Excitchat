import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { upsertStreamUser } from "../libs/stream.js";

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

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log(`Stream user created for ${newUser.fullName}`);
    } catch (error) {
      console.error("Error creating Stream user", error);
    }

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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    console.error("Error in login", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production"
    });
    res.status(200).json({ message: "Logout successfui" });
  } catch (error) {
    console.error("Error in logout", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const onboard = async (req, res) => {
  try {
    const userId = req.user._id

    const {fullName, bio, location, nativeLanguage, learningLanguage} = req.body

    if(!fullName || !bio || !location || !nativeLanguage || !learningLanguage){
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !location && "location",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage"
        ].filter(Boolean)
      })
    }

    const updatedUser = await User.findByIdAndUpdate(userId, {
      ...req.body,
      isOnboarded: true
    }, {new: true})

    if(!updatedUser){
      return res.status(400).json({
        message: "User not found"
      })
    }

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || ""
      })
      console.log(`Stream user updated after onboarding for ${updatedUser.fullName}`)
    } catch (error) {
      console.error("Error updating Stream user after onboarding", error)
    }

    res.status(200).json({message: "Onboarding successful", user: updatedUser})
  } catch (error) {
    console.error("Error in onboarding", error)
    res.status(500).json({message: "Internal server error"})
  }
};

export const me = async(req, res) => {
  res.status(200).json({message: "User fetched successfully", user: req.user})
}