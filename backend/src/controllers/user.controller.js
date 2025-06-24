import FriendRequest from "../models/FriendRequest.js";
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

export const sendFriendRequest = async (req, res) => {
  try {
    const myId = req.user._id
    const { id: recipientId } = req.params

    // prevent sending request to ourselves 
    if(myId === recipientId){
      return res.status(400).json({
        message: "You cant send friend request to yourelf"
      })
    }

    const recipient = await User.findById(recipientId)
    if(!recipient){
      return res.status(404).json({
        message: "Recipient user not found"
      })
    }

    // prevent sending request if already friends
    if(recipient.friends.includes(myId)){
      return res.status(400).json({
        message: "You are already friends with this user"
      })
    }

    // prevent sending request if already sent
    const existingRequest = await FriendRequest.findById({
      $or: [
        {sender: myId, recipient: recipientId},
        {sender: recipientId, recipient: myId}
      ]
    })

    if(existingRequest){
      res.status(400).json({
        message: "Friend request already in progress"
      })
    }

    // create new friend request
    const friendRequest = await friendRequest.create({
      sender: myId,
      recipient: recipientId,
    })

    res.status(201).json({
      message: "Friend request sent successfully",
      friendRequest
    })
  } catch (error) {
    
  }
}
