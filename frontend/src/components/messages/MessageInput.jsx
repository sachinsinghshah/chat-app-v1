import { useState, useRef, useCallback } from "react";
import { IoSend, IoClose } from "react-icons/io5";
import { BsEmojiSmile, BsImage } from "react-icons/bs";
import { BsReply } from "react-icons/bs";
import useSendMessage from "../../hooks/useSendMessage";
import useConversation from "../../../zustand/useConversation";
import { useSocketContext } from "../../context/SocketContext";
import toast from "react-hot-toast";

const EMOJI_LIST = [
  "😀","😂","😍","🥰","😎","🤔","😮","😢","😡","🥳",
  "👍","👎","❤️","🔥","🎉","✨","💯","🙏","🤝","👋",
  "😏","🤣","😅","🥺","😴","🤯","🥹","😇","🤩","🫡",
];

/** Compress an image File to a base64 data URL (max 800px, JPEG 0.8) */
const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 800;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState(null); // base64 string
  const [imageLoading, setImageLoading] = useState(false);
  const { loading, sendMessage } = useSendMessage();
  const { replyTo, setReplyTo, selectedConversation } = useConversation();
  const { socket } = useSocketContext();
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const fileInputRef = useRef(null);

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

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10 MB"); return; }
    setImageLoading(true);
    try {
      const compressed = await compressImage(file);
      setImagePreview(compressed);
    } catch {
      toast.error("Failed to process image");
    } finally {
      setImageLoading(false);
      // Reset file input so same file can be selected again
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !imagePreview) return;
    if (socket && selectedConversation) {
      socket.emit("stopTyping", { receiverId: selectedConversation._id });
    }
    isTypingRef.current = false;
    clearTimeout(typingTimeoutRef.current);

    if (imagePreview) {
      await sendMessage(imagePreview, "image");
      setImagePreview(null);
    }
    if (message.trim()) {
      await sendMessage(message.trim());
      setMessage("");
    }
    setShowEmojiPicker(false);
  };

  const insertEmoji = (emoji) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const canSend = (message.trim() || imagePreview) && !loading && !imageLoading;

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

      {/* Image preview */}
      {imagePreview && (
        <div className="relative inline-block mb-2 max-w-[200px]">
          <img
            src={imagePreview}
            alt="preview"
            className="h-24 max-w-[200px] w-auto rounded-xl object-cover border border-gray-600"
          />
          <button
            onClick={() => setImagePreview(null)}
            className="absolute -top-1.5 -right-1.5 bg-gray-800 rounded-full p-0.5 text-gray-300 hover:text-white border border-gray-600"
          >
            <IoClose size={14} />
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
      />

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

          {/* Image attach */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-blue-400 transition-colors shrink-0"
            title="Send image"
            disabled={imageLoading}
          >
            {imageLoading ? (
              <span className="loading loading-spinner w-4 h-4" />
            ) : (
              <BsImage size={18} />
            )}
          </button>

          <input
            type="text"
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-400 outline-none"
            placeholder={imagePreview ? "Add a caption..." : "Type a message..."}
            value={message}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) handleSubmit(e);
            }}
          />

          <button
            type="submit"
            disabled={!canSend}
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
