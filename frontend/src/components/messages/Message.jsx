import { useState, useRef, useEffect } from "react";
import { extractTime } from "../../../../backend/utils/exactTime";
import useConversation from "../../../zustand/useConversation";
import { useAuthContext } from "../../context/AuthContext";
import useDeleteMessage from "../../hooks/useDeleteMessage";
import useReactToMessage from "../../hooks/useReactToMessage";
import useEditMessage from "../../hooks/useEditMessage";
import { BsTrash, BsReply, BsCheckAll, BsCheck, BsPencil } from "react-icons/bs";
import { IoClose, IoCheckmark } from "react-icons/io5";
import UserAvatar from "../common/UserAvatar";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

const Message = ({ message }) => {
  const { authUser } = useAuthContext();
  const { selectedConversation, setReplyTo } = useConversation();
  const { deleteMessage } = useDeleteMessage();
  const { reactToMessage } = useReactToMessage();
  const { editMessage } = useEditMessage();
  const [showActions, setShowActions] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.message);
  const [lightbox, setLightbox] = useState(false);
  const editInputRef = useRef(null);

  const fromMe = message.senderId === authUser._id;
  const formattedTime = extractTime(message.createdAt);
  const chatClassName = fromMe ? "chat-end" : "chat-start";
  const avatarUser = fromMe ? authUser : selectedConversation;

  const shakeClass = message.shouldShake ? "shake" : "";
  const isDeleted = message.deleted;
  const isImage = message.messageType === "image";

  // Focus edit input when editing starts
  useEffect(() => {
    if (editing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editing]);

  // Group reactions by emoji
  const reactionGroups = {};
  (message.reactions || []).forEach(({ emoji, userId }) => {
    if (!reactionGroups[emoji]) reactionGroups[emoji] = [];
    reactionGroups[emoji].push(userId);
  });

  const handleEditSave = async () => {
    if (editText.trim() === message.message) { setEditing(false); return; }
    const ok = await editMessage(message._id, editText);
    if (ok) setEditing(false);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEditSave(); }
    if (e.key === "Escape") { setEditing(false); setEditText(message.message); }
  };

  return (
    <>
      <div
        className={`chat ${chatClassName} group relative`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => {
          setShowActions(false);
          setShowReactionPicker(false);
        }}
      >
        <div className="chat-image avatar">
          <div className="w-10 rounded-full overflow-hidden">
            <UserAvatar user={avatarUser} size={40} />
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
            } ${shakeClass} ${isImage ? "p-1.5" : ""}`}
          >
            {isDeleted ? (
              <span className="text-sm">🚫 This message was deleted</span>
            ) : editing ? (
              /* Inline edit input */
              <div className="flex items-center gap-1 min-w-[200px]">
                <input
                  ref={editInputRef}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  className="flex-1 bg-white/10 rounded px-2 py-1 text-sm text-white outline-none border border-white/20 focus:border-white/40"
                />
                <button onClick={handleEditSave} className="text-green-300 hover:text-green-200 shrink-0">
                  <IoCheckmark size={18} />
                </button>
                <button
                  onClick={() => { setEditing(false); setEditText(message.message); }}
                  className="text-red-300 hover:text-red-200 shrink-0"
                >
                  <IoClose size={18} />
                </button>
              </div>
            ) : isImage ? (
              /* Image message */
              <img
                src={message.message}
                alt="shared"
                className="max-w-[240px] max-h-[320px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setLightbox(true)}
              />
            ) : (
              message.message
            )}

            {/* Action buttons on hover */}
            {!isDeleted && !editing && showActions && (
              <div
                className={`absolute -top-8 flex gap-1 bg-gray-800 rounded-full px-2 py-1 shadow-lg z-10 ${
                  fromMe ? "right-0" : "left-0"
                }`}
              >
                {/* Quick reactions */}
                <button
                  className="text-lg hover:scale-125 transition-transform"
                  onClick={() => setShowReactionPicker((p) => !p)}
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
                      message: isImage ? "📷 Photo" : message.message,
                      senderName: fromMe
                        ? authUser.fullName
                        : selectedConversation?.fullName,
                    })
                  }
                  title="Reply"
                >
                  <BsReply size={16} />
                </button>
                {/* Edit (own non-image messages only) */}
                {fromMe && !isImage && (
                  <button
                    className="text-gray-300 hover:text-white p-1"
                    onClick={() => setEditing(true)}
                    title="Edit"
                  >
                    <BsPencil size={13} />
                  </button>
                )}
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

        {/* Footer: time + edited label + read receipt */}
        <div className="chat-footer opacity-50 text-xs flex gap-1 items-center mt-1">
          {formattedTime}
          {message.edited && (
            <span className="italic text-gray-400">(edited)</span>
          )}
          {fromMe && (
            <span className={message.read ? "text-blue-400" : "text-gray-400"}>
              {message.read ? <BsCheckAll size={14} /> : <BsCheck size={14} />}
            </span>
          )}
        </div>
      </div>

      {/* Image lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-gray-800 rounded-full p-1.5 hover:bg-gray-700"
            onClick={() => setLightbox(false)}
          >
            <IoClose size={22} />
          </button>
          <img
            src={message.message}
            alt="full size"
            className="max-w-full max-h-full rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default Message;
