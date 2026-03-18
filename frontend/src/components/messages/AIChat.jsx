import { useEffect, useRef, useState } from "react";
import { IoSend } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";
import useAIChat from "../../hooks/useAIChat";
import useConversation from "../../../zustand/useConversation";
import { useAuthContext } from "../../context/AuthContext";
import { extractTime } from "../../../../backend/utils/exactTime";

const EMOJI_LIST = [
  "😀","😂","😍","🥰","😎","🤔","😮","😢","😡","🥳",
  "👍","👎","❤️","🔥","🎉","✨","💯","🙏","🤝","👋",
];

// ── Provider config ────────────────────────────────────────────────────────
const PROVIDERS = {
  grok: {
    label: "Grok",
    subLabel: "xAI · Grok-3 Mini",
    avatar: "𝕏",
    headerGrad: "from-gray-900/90 to-zinc-800/90",
    headerBorder: "border-zinc-600/40",
    badge: "bg-zinc-700 text-zinc-200",
    subText: "text-zinc-400",
    bubbleBg: "bg-zinc-700",
    tabActive: "bg-zinc-700 text-white",
    tabInactive: "text-zinc-400 hover:text-zinc-200",
    avatarBg: "bg-zinc-700",
    dotColor: "bg-zinc-400",
    inputBorder: "border-zinc-600/50 focus-within:border-zinc-400",
    sendBtn: "text-zinc-400 hover:text-zinc-200",
    suggestions: [
      "What's trending in tech today?",
      "Explain recursion simply",
      "Write a haiku about code",
      "Best practices for React",
    ],
  },
  gemini: {
    label: "Gemini",
    subLabel: "Google · Gemini 2.0 Flash",
    avatar: "✦",
    headerGrad: "from-blue-900/80 to-cyan-900/80",
    headerBorder: "border-blue-700/40",
    badge: "bg-blue-700/60 text-blue-200",
    subText: "text-blue-300",
    bubbleBg: "bg-blue-700",
    tabActive: "bg-blue-600 text-white",
    tabInactive: "text-blue-400 hover:text-blue-200",
    avatarBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
    dotColor: "bg-blue-300",
    inputBorder: "border-blue-700/50 focus-within:border-blue-400",
    sendBtn: "text-blue-400 hover:text-blue-200",
    suggestions: [
      "Explain machine learning",
      "Pros & cons of TypeScript",
      "Give me a 5-step workout plan",
      "Summarise the news for me",
    ],
  },
  claude: {
    label: "Claude",
    subLabel: "Anthropic · Claude Haiku",
    avatar: "◆",
    headerGrad: "from-purple-900/80 to-indigo-900/80",
    headerBorder: "border-purple-700/50",
    badge: "bg-purple-600/60 text-purple-200",
    subText: "text-purple-300",
    bubbleBg: "bg-purple-700",
    tabActive: "bg-purple-600 text-white",
    tabInactive: "text-purple-400 hover:text-purple-200",
    avatarBg: "bg-gradient-to-br from-purple-500 to-indigo-600",
    dotColor: "bg-purple-300",
    inputBorder: "border-purple-700/50 focus-within:border-purple-500",
    sendBtn: "text-purple-400 hover:text-purple-300",
    suggestions: [
      "Write a short poem",
      "Explain async/await",
      "Give me a fun fact",
      "Help me brainstorm an app idea",
    ],
  },
};

// ── Component ────────────────────────────────────────────────────────────────
const AIChat = () => {
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const { sendToAI, loading, aiMessages } = useAIChat();
  const { authUser } = useAuthContext();
  const { setAiMessages, selectedAIProvider, setAIProvider } = useConversation();
  const bottomRef = useRef();

  const cfg = PROVIDERS[selectedAIProvider] || PROVIDERS.grok;

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
      {/* ── Header ──────────────────────────────────────────────── */}
      <div
        className={`bg-gradient-to-r ${cfg.headerGrad} backdrop-blur-sm px-4 py-3 border-b ${cfg.headerBorder}`}
      >
        {/* Model selector tabs */}
        <div className="flex gap-1 mb-3 bg-black/20 rounded-lg p-1">
          {Object.entries(PROVIDERS).map(([key, p]) => (
            <button
              key={key}
              onClick={() => setAIProvider(key)}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all ${
                selectedAIProvider === key ? p.tabActive : p.tabInactive
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Active model info */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full ${cfg.avatarBg} flex items-center justify-center ring-2 ring-white/10 text-white font-bold text-base shrink-0`}
          >
            {cfg.avatar}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-semibold text-white text-sm">{cfg.label}</span>
            <span className={`text-xs ${cfg.subText}`}>{cfg.subLabel}</span>
          </div>
          {aiMessages.length > 0 && (
            <button
              className="text-xs text-gray-400 hover:text-red-400 transition-colors shrink-0"
              onClick={() => setAiMessages([])}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Messages ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto px-4 py-3 space-y-3">
        {aiMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-gray-400 pb-6">
            <div
              className={`w-16 h-16 rounded-full ${cfg.avatarBg} flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white/10`}
            >
              {cfg.avatar}
            </div>
            <div>
              <p className="font-semibold text-gray-200 text-base">
                Chat with {cfg.label}
              </p>
              <p className="text-sm text-gray-400 mt-1 max-w-xs">
                {cfg.subLabel} — ask anything!
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1 w-full max-w-sm">
              {cfg.suggestions.map((s) => (
                <button
                  key={s}
                  className={`text-xs border rounded-lg px-3 py-2 transition-colors text-left ${cfg.badge} border-white/10 hover:brightness-110`}
                  onClick={() => setInput(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {aiMessages.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={idx}
              className={`chat ${isUser ? "chat-end" : "chat-start"}`}
            >
              <div className="chat-image avatar">
                <div className="w-9 rounded-full overflow-hidden">
                  {isUser ? (
                    <img src={authUser.profilePic} alt="you" />
                  ) : (
                    <div
                      className={`w-9 h-9 ${cfg.avatarBg} flex items-center justify-center text-white font-bold text-sm`}
                    >
                      {cfg.avatar}
                    </div>
                  )}
                </div>
              </div>
              <div
                className={`chat-bubble text-white whitespace-pre-wrap text-sm ${
                  isUser ? "bg-blue-500" : cfg.bubbleBg
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

        {/* Typing indicator */}
        {loading && (
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div
                className={`w-9 h-9 rounded-full ${cfg.avatarBg} flex items-center justify-center text-white font-bold text-sm`}
              >
                {cfg.avatar}
              </div>
            </div>
            <div
              className={`chat-bubble ${cfg.bubbleBg} text-white flex items-center gap-1 px-4 py-3`}
            >
              <span
                className={`w-2 h-2 ${cfg.dotColor} rounded-full animate-bounce`}
                style={{ animationDelay: "0ms" }}
              />
              <span
                className={`w-2 h-2 ${cfg.dotColor} rounded-full animate-bounce`}
                style={{ animationDelay: "150ms" }}
              />
              <span
                className={`w-2 h-2 ${cfg.dotColor} rounded-full animate-bounce`}
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ───────────────────────────────────────────────── */}
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
          <div
            className={`flex items-center gap-2 bg-gray-700 rounded-xl px-3 py-2 border ${cfg.inputBorder} transition-colors`}
          >
            <button
              type="button"
              onClick={() => setShowEmoji((p) => !p)}
              className={`text-gray-400 hover:text-yellow-400 transition-colors shrink-0 ${
                showEmoji ? "text-yellow-400" : ""
              }`}
            >
              <BsEmojiSmile size={20} />
            </button>
            <input
              type="text"
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-400 outline-none"
              placeholder={`Ask ${cfg.label} anything…`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) handleSubmit(e);
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={`${cfg.sendBtn} disabled:opacity-40 transition-colors shrink-0`}
            >
              {loading ? (
                <div className="loading loading-spinner w-5 h-5" />
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
