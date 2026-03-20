import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    emoji: { type: String, required: true },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // null for group messages
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // set for group messages
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },
    message: {
      type: String,
      required: true,
    },
    read: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    edited: { type: Boolean, default: false },
    editedAt: { type: Date },
    reactions: [reactionSchema],
    replyTo: {
      messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
      message: { type: String },
      senderName: { type: String },
    },
    messageType: {
      type: String,
      enum: ["text", "image"],
      default: "text",
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;

