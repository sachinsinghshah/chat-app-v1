import { useState, useRef, useCallback } from "react";
import { IoSend, IoClose } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";
import { BsReply } from "react-icons/bs";
import useSendMessage from "../../hooks/useSendMessage";
import useConversation from "../../../zustand/useConversation";
import { useSocketContext } from "../../context/SocketContext";

const EMOJI_LIST = [
  "😀","😂","😍","🥰","😎","🤔","😮","😢","😡","🥳",
  "👍","👎","❤️","🔥","🎉","✨","💯","🙏","🤝","👋",
  "😏","🤣","😅","🥺","😴","🤯","🥹","😇","🤩","🫡",
];

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { loading, sendMessage } = useSendMessage();
  const { replyTo, setReplyTo, selectedConversation } = useConversation();
  const { socket } = useSocketContext();
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const emitTyping = useCallback(() => {
    if (!socket || !selectedConversation) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing", { receiverId: selectedConversation._id });
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit("stopTyping", { receiverId: selectedConversation._id });
    }, 1500);
  }, [socket, selectedConversation]);

  const handleChange = (e) => {
    setMessage(e.target.value);
    emitTyping();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    // Stop typing indicator before sending
    if (socket && selectedConversation) {
      socket.emit("stopTyping", { receiverId: selectedConversation._id });
    }
    isTypingRef.current = false;
    clearTimeout(typingTimeoutRef.current);
    await sendMessage(message.trim());
    setMessage("");
    setShowEmojiPicker(false);
  };

  const insertEmoji = (emoji) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="px-4 pb-3">
      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center gap-2 bg-gray-700/60 rounded-t-lg px-3 py-2 border-l-2 border-blue-400 mb-1">
          <BsReply className="text-blue-400 shrink-0" size={16} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-blue-300 font-semibold">{replyTo.senderName}</p>
            <p className="text-xs text-gray-300 truncate">{replyTo.message}</p>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="text-gray-400 hover:text-white shrink-0"
          >
            <IoClose size={16} />
          </button>
        </div>
      )}

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="bg-gray-800 rounded-xl p-3 mb-2 grid grid-cols-10 gap-1 shadow-xl border border-gray-600">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              className="text-xl hover:scale-125 transition-transform p-0.5 rounded"
              onClick={() => insertEmoji(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <form className="w-full" onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 bg-gray-700 rounded-xl px-3 py-2 border border-gray-600 focus-within:border-blue-500 transition-colors">
          {/* Emoji toggle */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker((p) => !p)}
            className={`text-gray-400 hover:text-yellow-400 transition-colors shrink-0 ${
              showEmojiPicker ? "text-yellow-400" : ""
            }`}
          >
            <BsEmojiSmile size={20} />
          </button>

          <input
            type="text"
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-400 outline-none"
            placeholder="Type a message..."
            value={message}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) handleSubmit(e);
            }}
          />

          <button
            type="submit"
            disabled={!message.trim() || loading}
            className="text-blue-400 hover:text-blue-300 disabled:opacity-40 transition-colors shrink-0"
          >
            {loading ? (
              <div className="loading loading-spinner w-5 h-5"></div>
            ) : (
              <IoSend size={20} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
