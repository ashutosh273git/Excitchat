import User from "../models/User.js";

export const getRecommendedUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId); // we can also use req.user directly

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, // we exclude current user here
        { _id: { $nin: currentUser.friends } }, // we exclude current user's friends here
        { isOnboarded: true },
      ],
    });

    res.status(200).json({
      message: "Recommended users fetched successfully",
      recommendedUsers: recommendedUsers,
    });
  } catch (error) {
    console.error("Error in getRecommendedUsers controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("friends")
      .populate(
        "friends",
        "fullName profilePic nativeLanguage learningLanguage"
      );

    res.status(200).json({
      message: "My friends fetched successfully",
      friends: user.friends,
    });
  } catch (error) {
    console.error("Error in getMyFriends controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
