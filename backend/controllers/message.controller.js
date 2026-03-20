import { getReceiverSocketId, io } from "../../socket/socket.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { message, replyTo, messageType } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Check if receiver has blocked sender
    const receiver = await User.findById(receiverId).select("blockedUsers");
    if (receiver?.blockedUsers?.some((id) => id.toString() === senderId.toString())) {
      return res.status(403).json({ error: "You cannot send messages to this user" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      messageType: messageType || "text",
      replyTo: replyTo || undefined,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    await Promise.all([conversation.save(), newMessage.save()]);

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error while Sending Message: " + error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages");

    if (!conversation) {
      return res.status(200).json([]);
    }
    res.status(200).json(conversation.messages);
  } catch (error) {
    console.log("Error while Getting Messages: " + error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    // Only sender can delete
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    message.deleted = true;
    message.message = "This message was deleted";
    await message.save();

    // Notify receiver via socket
    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { messageId });
    }

    res.status(200).json({ messageId, deleted: true });
  } catch (error) {
    console.log("Error while Deleting Message: " + error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const reactToMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    // Toggle: remove if same emoji exists from user, else add/replace
    const existingIdx = message.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existingIdx !== -1) {
      if (message.reactions[existingIdx].emoji === emoji) {
        // Remove reaction
        message.reactions.splice(existingIdx, 1);
      } else {
        // Replace with new emoji
        message.reactions[existingIdx].emoji = emoji;
      }
    } else {
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    // Notify the other party
    const otherId =
      message.senderId.toString() === userId.toString()
        ? message.receiverId.toString()
        : message.senderId.toString();

    const otherSocketId = getReceiverSocketId(otherId);
    if (otherSocketId) {
      io.to(otherSocketId).emit("messageReaction", {
        messageId,
        reactions: message.reactions,
      });
    }

    res.status(200).json({ messageId, reactions: message.reactions });
  } catch (error) {
    console.log("Error while Reacting to Message: " + error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { id: senderId } = req.params; // the person whose messages we're marking read
    const receiverId = req.user._id;

    await Message.updateMany(
      { senderId, receiverId, read: false },
      { $set: { read: true } }
    );

    // Notify sender their messages were read
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", { readBy: receiverId });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error while marking messages as read: " + error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { message: newText } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });
    if (message.senderId.toString() !== userId.toString())
      return res.status(403).json({ error: "Not authorized" });
    if (message.deleted)
      return res.status(400).json({ error: "Cannot edit a deleted message" });
    if (message.messageType === "image")
      return res.status(400).json({ error: "Cannot edit image messages" });
    if (!newText?.trim())
      return res.status(400).json({ error: "Message cannot be empty" });

    message.message = newText.trim();
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    const otherId =
      message.receiverId?.toString() !== userId.toString()
        ? message.receiverId?.toString()
        : null;

    if (otherId) {
      const otherSocketId = getReceiverSocketId(otherId);
      if (otherSocketId)
        io.to(otherSocketId).emit("messageEdited", {
          messageId,
          message: message.message,
          editedAt: message.editedAt,
        });
    }

    // Group message broadcast
    if (message.groupId) {
      io.to(`group_${message.groupId}`).emit("messageEdited", {
        messageId,
        message: message.message,
        editedAt: message.editedAt,
      });
    }

    res.status(200).json({ messageId, message: message.message, editedAt: message.editedAt });
  } catch (error) {
    console.log("Error while editing message: " + error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const searchMessages = async (req, res) => {
  try {
    const { q, with: withUserId } = req.query;
    const userId = req.user._id;

    if (!q || q.trim().length < 2)
      return res.status(400).json({ error: "Query too short" });

    const conversation = await Conversation.findOne({
      participants: { $all: [userId, withUserId] },
    });
    if (!conversation) return res.status(200).json([]);

    const results = await Message.find({
      _id: { $in: conversation.messages },
      deleted: false,
      messageType: "text",
      message: { $regex: q.trim(), $options: "i" },
    })
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json(results);
  } catch (error) {
    console.log("Error in searchMessages: " + error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
