import { useEffect } from "react";
import useConversation from "../../../zustand/useConversation";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { TbMessages, TbRobot } from "react-icons/tb";
import { useAuthContext } from "../../context/AuthContext";
import { useSocketContext } from "../../context/SocketContext";
import AIChat from "./AIChat";
import UserAvatar from "../common/UserAvatar";
import { IoArrowBack } from "react-icons/io5";

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
    <div className="flex-1 flex flex-col min-w-0">
      {!selectedConversation ? (
        <NoChatSelected />
      ) : isAIBot ? (
        <AIChat />
      ) : (
        <>
          {/* Chat header */}
          <div className="bg-gray-900/80 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-gray-700/60">
            {/* Back button — mobile only */}
            <button
              className="md:hidden text-gray-400 hover:text-white shrink-0 -ml-1 p-1"
              onClick={() => setSelectedConversation(null)}
              aria-label="Back"
            >
              <IoArrowBack size={22} />
            </button>

            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-indigo-500/30">
                <UserAvatar user={selectedConversation} size={40} />
              </div>
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-white text-sm">
                {selectedConversation.fullName}
              </span>
              <span className={`text-xs ${isOnline ? "text-green-400" : "text-gray-500"}`}>
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
    <div className="flex items-center justify-center w-full h-full bg-gray-900/20">
      <div className="px-6 text-center flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
          <TbMessages className="text-4xl text-indigo-400" />
        </div>
        <div>
          <p className="text-lg font-bold text-white">
            Welcome, {authUser.fullName}!
          </p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            Select a conversation to start chatting, or try the AI Assistant.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-800/50 px-4 py-2 rounded-full">
          <TbRobot className="text-purple-400" size={16} />
          <span>AI Assistant available in the sidebar</span>
        </div>
      </div>
    </div>
  );
};
