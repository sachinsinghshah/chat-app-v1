import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const allUsers = await User.find({ _id: { $ne: loggedInUserId } }).select(
      "-password -blockedUsers"
    );

    // Enrich each user with lastMessage + unreadCount
    const enriched = await Promise.all(
      allUsers.map(async (user) => {
        const conversation = await Conversation.findOne({
          participants: { $all: [loggedInUserId, user._id] },
        })
          .populate({ path: "messages", options: { sort: { createdAt: -1 }, limit: 1 } });

        let lastMessage = null;
        let unreadCount = 0;

        if (conversation && conversation.messages.length > 0) {
          const msg = conversation.messages[conversation.messages.length - 1];
          lastMessage = {
            message: msg.deleted ? "🚫 Message deleted" : msg.message,
            messageType: msg.messageType,
            createdAt: msg.createdAt,
            senderId: msg.senderId,
          };
          unreadCount = await Message.countDocuments({
            senderId: user._id,
            receiverId: loggedInUserId,
            read: false,
            deleted: false,
          });
        }

        return { ...user.toObject(), lastMessage, unreadCount };
      })
    );

    // Sort: conversations with messages first (by recency), then alphabetically
    enriched.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage)
        return a.fullName.localeCompare(b.fullName);
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return (
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
      );
    });

    return res.status(200).json(enriched);
  } catch (error) {
    console.log("Error in getUserForSidebar: " + error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { profilePic, fullName } = req.body;

    const updates = {};
    if (fullName && fullName.trim()) updates.fullName = fullName.trim();
    if (profilePic !== undefined) updates.profilePic = profilePic;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in updateProfile controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { id: targetId } = req.params;
    const userId = req.user._id;

    if (targetId === userId.toString())
      return res.status(400).json({ error: "Cannot block yourself" });

    await User.findByIdAndUpdate(userId, {
      $addToSet: { blockedUsers: targetId },
    });
    res.status(200).json({ blocked: true, targetId });
  } catch (error) {
    console.error("Error in blockUser:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { id: targetId } = req.params;
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, {
      $pull: { blockedUsers: targetId },
    });
    res.status(200).json({ blocked: false, targetId });
  } catch (error) {
    console.error("Error in unblockUser:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("blockedUsers");
    res.status(200).json(user.blockedUsers || []);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
