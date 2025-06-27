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

    res.status(200).json(recommendedUsers);
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

    res.status(200).json(user.friends);
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

    res.status(201).json(friendRequest)
  } catch (error) {
    console.error("Error in sendFriendRequest controller", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const acceptFriendRequest = async (req, res) => {
  try {
    const { id:requestId } = req.params

    const friendRequest = await FriendRequest.findById(requestId)
    if(!friendRequest){
      return res.status(404).json({
        message: "Friend request not found"
      })
    }

    if(friendRequest.recipient.toString() !== req.user._id){
      return res.status(403).json({
        message: "You are not authorized to accept this friend request"
      })
    }

    friendRequest.status = "accepted"
    await friendRequest.save()

    // add each other to friends list
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: {friends: friendRequest.recipient}
    })

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: {friends: friendRequest.sender}
    })

    res.status(200).json({
      message: "Friend request accepted successfully",
    })
  } catch (error) {
    console.error("Error in acceptFriendRequest controller", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const getFriendRequests = async (req, res) => {
  try {
    const incomingRequests = await FriendRequest.find({
      recipient: req.user._id,
      status: "pending"
    }).populate("sender", "fullName profilePic nativeLanguage learningLanguage")

    const acceptedRequests = await FriendRequest.find({
      sender: req.user._id,
      status: "accepted"
    }).populate("recipient", "fullName profilePic")

    res.status(200).json({incomingRequests, acceptedRequests})
  } catch (error) {
    console.error("Error in getFriendRequests controller", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const getOutgoingFriendRequests = async (req, res) => {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user._id,
      status: "pending"
    }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage")

    res.status(200).json(outgoingRequests)
  } catch (error) {
    console.error("Error in getOutgoingFriendRequests controller", error)
    res.status(500).json({ message: "Internal server error" })
  }
}