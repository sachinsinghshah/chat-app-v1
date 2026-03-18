import { TbRobot } from "react-icons/tb";
import useConversation from "../../../zustand/useConversation";

const AI_BOT = {
  _id: "ai-assistant",
  fullName: "AI Assistant",
  profilePic: null,
  isAI: true,
};

const AIBotEntry = () => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const isSelected = selectedConversation?._id === "ai-assistant";

  return (
    <div
      className={`flex gap-2 items-center hover:bg-purple-700/50 rounded-lg p-2 py-2 cursor-pointer transition-colors ${
        isSelected ? "bg-purple-700/60 ring-1 ring-purple-500/50" : ""
      }`}
      onClick={() => setSelectedConversation(AI_BOT)}
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0 ring-2 ring-purple-400/30">
        <TbRobot size={24} className="text-white" />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex gap-2 items-center justify-between">
          <p className="font-bold text-gray-200 text-sm">AI Assistant</p>
          <span className="text-xs bg-purple-600/60 text-purple-200 px-2 py-0.5 rounded-full">
            Claude
          </span>
        </div>
        <p className="text-xs text-gray-400 truncate">Ask me anything!</p>
      </div>
    </div>
  );
};

export default AIBotEntry;
