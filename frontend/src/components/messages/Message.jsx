import { useState } from "react";
import { extractTime } from "../../../../backend/utils/exactTime";
import useConversation from "../../../zustand/useConversation";
import { useAuthContext } from "../../context/AuthContext";
import useDeleteMessage from "../../hooks/useDeleteMessage";
import useReactToMessage from "../../hooks/useReactToMessage";
import { BsTrash, BsReply, BsCheckAll, BsCheck } from "react-icons/bs";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

const Message = ({ message }) => {
  const { authUser } = useAuthContext();
  const { selectedConversation, setReplyTo } = useConversation();
  const { deleteMessage } = useDeleteMessage();
  const { reactToMessage } = useReactToMessage();
  const [showActions, setShowActions] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const fromMe = message.senderId === authUser._id;
  const formattedTime = extractTime(message.createdAt);
  const chatClassName = fromMe ? "chat-end" : "chat-start";
  const profilePic = fromMe
    ? authUser.profilePic
    : selectedConversation?.profilePic;

  const shakeClass = message.shouldShake ? "shake" : "";
  const isDeleted = message.deleted;

  // Group reactions by emoji
  const reactionGroups = {};
  (message.reactions || []).forEach(({ emoji, userId }) => {
    if (!reactionGroups[emoji]) reactionGroups[emoji] = [];
    reactionGroups[emoji].push(userId);
  });

  return (
    <div
      className={`chat ${chatClassName} group relative`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowReactionPicker(false);
      }}
    >
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img alt="avatar" src={profilePic} />
        </div>
      </div>

      <div className="flex flex-col gap-1 max-w-[70%]">
        {/* Reply preview */}
        {message.replyTo?.message && (
          <div
            className={`text-xs px-3 py-1.5 rounded-lg border-l-2 border-blue-400 bg-black/20 text-gray-300 ${
              fromMe ? "self-end" : "self-start"
            }`}
          >
            <span className="font-semibold text-blue-300">
              {message.replyTo.senderName}
            </span>
            <p className="truncate max-w-[200px]">{message.replyTo.message}</p>
          </div>
        )}

        {/* Bubble */}
        <div
          className={`chat-bubble text-white pb-2 relative ${
            isDeleted
              ? "bg-gray-600 italic opacity-60"
              : fromMe
              ? "bg-blue-500"
              : "bg-purple-600"
          } ${shakeClass}`}
        >
          {isDeleted ? (
            <span className="text-sm">🚫 This message was deleted</span>
          ) : (
            message.message
          )}

          {/* Action buttons on hover */}
          {!isDeleted && showActions && (
            <div
              className={`absolute -top-8 flex gap-1 bg-gray-800 rounded-full px-2 py-1 shadow-lg z-10 ${
                fromMe ? "right-0" : "left-0"
              }`}
            >
              {/* Quick reactions */}
              <button
                className="text-lg hover:scale-125 transition-transform"
                onClick={() =>
                  setShowReactionPicker((p) => !p)
                }
                title="React"
              >
                😊
              </button>
              {/* Reply */}
              <button
                className="text-gray-300 hover:text-white p-1"
                onClick={() =>
                  setReplyTo({
                    _id: message._id,
                    message: message.message,
                    senderName: fromMe
                      ? authUser.fullName
                      : selectedConversation?.fullName,
                  })
                }
                title="Reply"
              >
                <BsReply size={16} />
              </button>
              {/* Delete (only own messages) */}
              {fromMe && (
                <button
                  className="text-red-400 hover:text-red-300 p-1"
                  onClick={() => deleteMessage(message._id)}
                  title="Delete"
                >
                  <BsTrash size={14} />
                </button>
              )}
            </div>
          )}

          {/* Reaction emoji picker */}
          {showReactionPicker && (
            <div
              className={`absolute -top-14 flex gap-1 bg-gray-800 rounded-full px-3 py-2 shadow-xl z-20 ${
                fromMe ? "right-0" : "left-0"
              }`}
            >
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  className="text-xl hover:scale-125 transition-transform"
                  onClick={() => {
                    reactToMessage(message._id, emoji);
                    setShowReactionPicker(false);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reactions display */}
        {Object.keys(reactionGroups).length > 0 && (
          <div
            className={`flex flex-wrap gap-1 ${fromMe ? "justify-end" : "justify-start"}`}
          >
            {Object.entries(reactionGroups).map(([emoji, users]) => (
              <button
                key={emoji}
                className={`text-xs flex items-center gap-0.5 px-2 py-0.5 rounded-full border transition-all ${
                  users.includes(authUser._id)
                    ? "bg-blue-500/30 border-blue-400"
                    : "bg-gray-700/50 border-gray-600 hover:bg-gray-600/50"
                }`}
                onClick={() => reactToMessage(message._id, emoji)}
              >
                <span>{emoji}</span>
                {users.length > 1 && (
                  <span className="text-gray-300">{users.length}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer: time + read receipt */}
      <div className="chat-footer opacity-50 text-xs flex gap-1 items-center mt-1">
        {formattedTime}
        {fromMe && (
          <span className={message.read ? "text-blue-400" : "text-gray-400"}>
            {message.read ? <BsCheckAll size={14} /> : <BsCheck size={14} />}
          </span>
        )}
      </div>
    </div>
  );
};

export default Message;
