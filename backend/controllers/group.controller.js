import Group from "../models/group.model.js";
import Message from "../models/message.model.js";
import { io, getReceiverSocketId } from "../../socket/socket.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const adminId = req.user._id;

    if (!name?.trim()) return res.status(400).json({ error: "Group name required" });

    // Always include creator in members
    const memberSet = [...new Set([adminId.toString(), ...(members || [])])];

    const group = await Group.create({
      name: name.trim(),
      description: description?.trim() || "",
      adminId,
      members: memberSet,
    });

    const populated = await group.populate("members", "-password -blockedUsers");

    // Notify all members via socket
    memberSet.forEach((memberId) => {
      const socketId = getReceiverSocketId(memberId);
      if (socketId) io.to(socketId).emit("newGroup", populated);
    });

    res.status(201).json(populated);
  } catch (error) {
    console.error("Error in createGroup:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({ members: userId })
      .populate("members", "-password -blockedUsers")
      .sort({ updatedAt: -1 });

    // Enrich with lastMessage + unreadCount
    const enriched = await Promise.all(
      groups.map(async (group) => {
        const lastMsg = await Message.findOne({ groupId: group._id, deleted: false })
          .sort({ createdAt: -1 })
          .populate("senderId", "fullName");

        const unreadCount = await Message.countDocuments({
          groupId: group._id,
          senderId: { $ne: userId },
          read: false,
        });

        return {
          ...group.toObject(),
          lastMessage: lastMsg
            ? {
                message: lastMsg.message,
                messageType: lastMsg.messageType,
                createdAt: lastMsg.createdAt,
                senderName: lastMsg.senderId?.fullName,
              }
            : null,
          unreadCount,
        };
      })
    );

    res.status(200).json(enriched);
  } catch (error) {
    console.error("Error in getMyGroups:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!group.members.some((m) => m.toString() === userId.toString()))
      return res.status(403).json({ error: "Not a member" });

    const messages = await Message.find({ groupId })
      .populate("senderId", "fullName profilePic username")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getGroupMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { message, messageType, replyTo } = req.body;
    const senderId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (!group.members.some((m) => m.toString() === senderId.toString()))
      return res.status(403).json({ error: "Not a member" });

    const newMessage = await Message.create({
      senderId,
      groupId,
      message,
      messageType: messageType || "text",
      replyTo: replyTo || undefined,
    });

    group.messages.push(newMessage._id);
    await group.save();

    const populated = await newMessage.populate("senderId", "fullName profilePic username");

    // Broadcast to group room
    io.to(`group_${groupId}`).emit("newGroupMessage", populated);

    res.status(201).json(populated);
  } catch (error) {
    console.error("Error in sendGroupMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addMember = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { userId: newMemberId } = req.body;
    const requesterId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (group.adminId.toString() !== requesterId.toString())
      return res.status(403).json({ error: "Only admin can add members" });

    if (!group.members.some((m) => m.toString() === newMemberId)) {
      group.members.push(newMemberId);
      await group.save();
    }

    const populated = await group.populate("members", "-password -blockedUsers");

    const newMemberSocketId = getReceiverSocketId(newMemberId);
    if (newMemberSocketId) io.to(newMemberSocketId).emit("newGroup", populated);

    res.status(200).json(populated);
  } catch (error) {
    console.error("Error in addMember:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    group.members = group.members.filter((m) => m.toString() !== userId.toString());

    // Transfer admin if admin is leaving
    if (group.adminId.toString() === userId.toString() && group.members.length > 0) {
      group.adminId = group.members[0];
    }

    if (group.members.length === 0) {
      await Group.deleteOne({ _id: groupId });
      return res.status(200).json({ left: true, deleted: true });
    }

    await group.save();
    io.to(`group_${groupId}`).emit("memberLeft", { groupId, userId });
    res.status(200).json({ left: true });
  } catch (error) {
    console.error("Error in leaveGroup:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
