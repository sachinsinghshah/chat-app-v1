import useConversation from "../../../zustand/useConversation";

const AI_BOT = {
  _id: "ai-assistant",
  fullName: "AI Assistant",
  profilePic: null,
  isAI: true,
};

const PROVIDER_CHIPS = [
  { key: "groq",        label: "Groq",    color: "bg-orange-600/70 text-orange-100" },
  { key: "gemini",      label: "Gemini",  color: "bg-blue-600/70 text-blue-100" },
  { key: "huggingface", label: "Llama", color: "bg-yellow-600/70 text-yellow-100" },
];

const AIBotEntry = () => {
  const { selectedConversation, setSelectedConversation, selectedAIProvider, setAIProvider } =
    useConversation();
  const isSelected = selectedConversation?._id === "ai-assistant";

  const handleProviderClick = (e, providerKey) => {
    e.stopPropagation();
    setAIProvider(providerKey);
    setSelectedConversation(AI_BOT);
  };

  return (
    <div
      className={`rounded-lg p-2 cursor-pointer transition-colors hover:bg-gray-700/40 ${
        isSelected ? "bg-gray-700/50 ring-1 ring-white/10" : ""
      }`}
      onClick={() => setSelectedConversation(AI_BOT)}
    >
      <div className="flex gap-2 items-center">
        {/* Stacked provider avatars */}
        <div className="flex items-center shrink-0 w-12 h-12 relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold absolute left-0 z-30 ring-2 ring-gray-900">⚡</div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold absolute left-3 z-20 ring-2 ring-gray-900">✦</div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold absolute left-6 z-10 ring-2 ring-gray-900">🤗</div>
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <p className="font-bold text-gray-200 text-sm">AI Assistant</p>
          <p className="text-xs text-gray-400">3 models available</p>
        </div>
      </div>

      {/* Provider quick-select chips */}
      <div className="flex gap-1 mt-2">
        {PROVIDER_CHIPS.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={(e) => handleProviderClick(e, key)}
            className={`text-xs px-2 py-0.5 rounded-full font-medium transition-all ${color} ${
              isSelected && selectedAIProvider === key
                ? "ring-2 ring-white/40 scale-105"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AIBotEntry;
