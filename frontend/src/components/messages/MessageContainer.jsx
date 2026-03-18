import { useEffect } from "react";
import useConversation from "../../../zustand/useConversation";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { TbMessages, TbRobot } from "react-icons/tb";
import { useAuthContext } from "../../context/AuthContext";
import { useSocketContext } from "../../context/SocketContext";
import AIChat from "./AIChat";

const MessageContainer = () => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { onlineUsers } = useSocketContext();

  useEffect(() => {
    return () => setSelectedConversation(null);
  }, [setSelectedConversation]);

  const isAIBot = selectedConversation?._id === "ai-assistant";
  const isOnline =
    !isAIBot && selectedConversation && onlineUsers.includes(selectedConversation._id);

  return (
    <div className="md:min-w-[450px] flex flex-col">
      {!selectedConversation ? (
        <NoChatSelected />
      ) : isAIBot ? (
        <AIChat />
      ) : (
        <>
          {/* Improved header */}
          <div className="bg-gray-800/80 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-gray-700">
            <div className={`avatar ${isOnline ? "online" : ""}`}>
              <div className="w-10 rounded-full ring-2 ring-blue-500/40">
                <img
                  src={selectedConversation.profilePic}
                  alt={selectedConversation.fullName}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-white text-sm">
                {selectedConversation.fullName}
              </span>
              <span
                className={`text-xs ${isOnline ? "text-green-400" : "text-gray-400"}`}
              >
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          <Messages />
          <MessageInput />
        </>
      )}
    </div>
  );
};

export default MessageContainer;

const NoChatSelected = () => {
  const { authUser } = useAuthContext();
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="px-4 text-center sm:text-lg md:text-xl text-gray-200 font-semibold flex flex-col items-center gap-3">
        <div className="text-5xl">👋</div>
        <p>Welcome, {authUser.fullName}!</p>
        <p className="text-sm text-gray-400 font-normal">
          Select a conversation or chat with the AI Assistant
        </p>
        <div className="flex gap-4 mt-2 text-gray-400">
          <TbMessages className="text-4xl" />
          <TbRobot className="text-4xl text-purple-400" />
        </div>
      </div>
    </div>
  );
};
