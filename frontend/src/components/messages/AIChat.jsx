import { useEffect, useRef, useState } from "react";
import { IoSend } from "react-icons/io5";
import { TbRobot } from "react-icons/tb";
import { BsEmojiSmile } from "react-icons/bs";
import useAIChat from "../../hooks/useAIChat";
import useConversation from "../../../zustand/useConversation";
import { useAuthContext } from "../../context/AuthContext";
import { extractTime } from "../../../../backend/utils/exactTime";

const EMOJI_LIST = [
  "😀","😂","😍","🥰","😎","🤔","😮","😢","😡","🥳",
  "👍","👎","❤️","🔥","🎉","✨","💯","🙏","🤝","👋",
];

const AIChat = () => {
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const { sendToAI, loading, aiMessages } = useAIChat();
  const { authUser } = useAuthContext();
  const { setAiMessages } = useConversation();
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = input.trim();
    setInput("");
    setShowEmoji(false);
    await sendToAI(msg);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/80 to-indigo-900/80 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-purple-700/50">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center ring-2 ring-purple-400/40">
          <TbRobot size={22} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-white text-sm">AI Assistant</span>
          <span className="text-xs text-purple-300">Powered by Claude</span>
        </div>
        {aiMessages.length > 0 && (
          <button
            className="ml-auto text-xs text-gray-400 hover:text-red-400 transition-colors"
            onClick={() => setAiMessages([])}
          >
            Clear chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-4 py-3 space-y-3">
        {aiMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-gray-400">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <TbRobot size={32} className="text-white" />
            </div>
            <p className="font-medium text-gray-300">
              Hello! I&apos;m your AI Assistant
            </p>
            <p className="text-sm max-w-xs">
              Ask me anything — questions, coding help, creative ideas, or just
              chat!
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2 w-full max-w-sm">
              {[
                "Write a short poem",
                "Explain async/await",
                "Give me a fun fact",
                "Help me brainstorm",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  className="text-xs bg-purple-900/40 hover:bg-purple-800/50 border border-purple-700/50 rounded-lg px-3 py-2 text-purple-200 transition-colors text-left"
                  onClick={() => {
                    setInput(suggestion);
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {aiMessages.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <div key={idx} className={`chat ${isUser ? "chat-end" : "chat-start"}`}>
              <div className="chat-image avatar">
                <div className="w-9 rounded-full">
                  {isUser ? (
                    <img src={authUser.profilePic} alt="you" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                      <TbRobot size={18} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
              <div
                className={`chat-bubble text-white whitespace-pre-wrap text-sm ${
                  isUser ? "bg-blue-500" : "bg-purple-700"
                }`}
              >
                {msg.content}
              </div>
              <div className="chat-footer opacity-40 text-xs mt-0.5">
                {extractTime(msg.timestamp || new Date().toISOString())}
              </div>
            </div>
          );
        })}

        {/* Loading indicator */}
        {loading && (
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <TbRobot size={18} className="text-white" />
              </div>
            </div>
            <div className="chat-bubble bg-purple-700 text-white flex items-center gap-1 px-4 py-3">
              <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-3">
        {showEmoji && (
          <div className="bg-gray-800 rounded-xl p-3 mb-2 grid grid-cols-10 gap-1 shadow-xl border border-gray-600">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                className="text-xl hover:scale-125 transition-transform p-0.5 rounded"
                onClick={() => {
                  setInput((p) => p + emoji);
                  setShowEmoji(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 bg-gray-700 rounded-xl px-3 py-2 border border-purple-700/50 focus-within:border-purple-500 transition-colors">
            <button
              type="button"
              onClick={() => setShowEmoji((p) => !p)}
              className={`text-gray-400 hover:text-yellow-400 transition-colors shrink-0 ${showEmoji ? "text-yellow-400" : ""}`}
            >
              <BsEmojiSmile size={20} />
            </button>
            <input
              type="text"
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-400 outline-none"
              placeholder="Ask the AI anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) handleSubmit(e);
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="text-purple-400 hover:text-purple-300 disabled:opacity-40 transition-colors shrink-0"
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
    </div>
  );
};

export default AIChat;
