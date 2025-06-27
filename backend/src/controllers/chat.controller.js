import { generateStreamToken } from "../libs/stream.js";

export const getStreamToken = async (req, res) => {
  try {
    const token = generateStreamToken(req.user.id);

    res.status(200).json({token});
  } catch (error) {
    console.error("Error in getStreamToken controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
