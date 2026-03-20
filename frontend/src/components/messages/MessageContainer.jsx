import { useEffect, useState } from "react";
import useConversation from "../../../zustand/useConversation";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import MessageSearch from "./MessageSearch";
import { TbMessages, TbRobot } from "react-icons/tb";
import { useAuthContext } from "../../context/AuthContext";
import { useSocketContext } from "../../context/SocketContext";
import AIChat from "./AIChat";
import UserAvatar from "../common/UserAvatar";
import { IoArrowBack } from "react-icons/io5";
import { FiSearch, FiMoreVertical, FiUserX, FiUserCheck } from "react-icons/fi";
import { FiUsers, FiLogOut } from "react-icons/fi";
import useBlockUser from "../../hooks/useBlockUser";
import Avatar from "boring-avatars";
import toast from "react-hot-toast";

const PALETTE = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

const MessageContainer = () => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { onlineUsers } = useSocketContext();
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Reset state when conversation changes
  useEffect(() => {
    setShowSearch(false);
    setShowMenu(false);
  }, [selectedConversation?._id]);

  useEffect(() => {
    return () => setSelectedConversation(null);
  }, [setSelectedConversation]);

  const isAIBot = selectedConversation?._id === "ai-assistant";
  const isGroup = selectedConversation?.isGroup;
  const isOnline =
    !isAIBot && !isGroup && selectedConversation && onlineUsers.includes(selectedConversation._id);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {!selectedConversation ? (
        <NoChatSelected />
      ) : isAIBot ? (
        <AIChat />
      ) : (
        <>
          {/* Chat header */}
          <div className="bg-gray-900/80 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-gray-700/60 relative">
            {/* Back button — mobile only */}
            <button
              className="md:hidden text-gray-400 hover:text-white shrink-0 -ml-1 p-1"
              onClick={() => setSelectedConversation(null)}
              aria-label="Back"
            >
              <IoArrowBack size={22} />
            </button>

            {/* Avatar */}
            <div className="relative shrink-0">
              {isGroup ? (
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-500/30">
                  {selectedConversation.avatar ? (
                    <img src={selectedConversation.avatar} alt={selectedConversation.name} className="w-full h-full object-cover" />
                  ) : (
                    <Avatar size={40} name={selectedConversation.name} variant="ring" colors={PALETTE} />
                  )}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-indigo-500/30">
                  <UserAvatar user={selectedConversation} size={40} />
                </div>
              )}
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900" />
              )}
            </div>

            {/* Name + status */}
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-semibold text-white text-sm truncate">
                {isGroup ? selectedConversation.name : selectedConversation.fullName}
              </span>
              {isGroup ? (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <FiUsers size={10} />
                  {selectedConversation.members?.length ?? 0} members
                </span>
              ) : (
                <span className={`text-xs ${isOnline ? "text-green-400" : "text-gray-500"}`}>
                  {isOnline ? "Online" : "Offline"}
                </span>
              )}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => { setShowSearch((p) => !p); setShowMenu(false); }}
                className={`p-1.5 rounded-full transition-colors ${showSearch ? "text-indigo-400 bg-indigo-500/10" : "text-gray-400 hover:text-white hover:bg-gray-700/50"}`}
                title="Search messages"
              >
                <FiSearch size={16} />
              </button>
              {/* More menu */}
              <div className="relative">
                <button
                  onClick={() => { setShowMenu((p) => !p); setShowSearch(false); }}
                  className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
                  title="More options"
                >
                  <FiMoreVertical size={16} />
                </button>
                {showMenu && (
                  <HeaderMenu
                    isGroup={isGroup}
                    conversation={selectedConversation}
                    onClose={() => setShowMenu(false)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Search panel */}
          {showSearch && (
            <MessageSearch onClose={() => setShowSearch(false)} />
          )}

          <Messages />
          <MessageInput />
        </>
      )}
    </div>
  );
};

/** Dropdown menu in header */
const HeaderMenu = ({ isGroup, conversation, onClose }) => {
  const { setSelectedConversation } = useConversation();
  const { blockUser, unblockUser, isBlocked } = useBlockUser();

  const blocked = !isGroup && isBlocked(conversation._id);

  const handleBlock = async () => {
    onClose();
    if (blocked) await unblockUser(conversation._id);
    else await blockUser(conversation._id);
  };

  const handleLeaveGroup = async () => {
    onClose();
    try {
      const res = await fetch(`/api/groups/${conversation._id}/leave`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setSelectedConversation(null);
      toast.success("Left group");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl py-1 w-44 z-30">
      {isGroup ? (
        <button
          onClick={handleLeaveGroup}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700/60 transition-colors"
        >
          <FiLogOut size={14} />
          Leave group
        </button>
      ) : (
        <button
          onClick={handleBlock}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
            blocked ? "text-green-400 hover:bg-gray-700/60" : "text-red-400 hover:bg-gray-700/60"
          }`}
        >
          {blocked ? <FiUserCheck size={14} /> : <FiUserX size={14} />}
          {blocked ? "Unblock user" : "Block user"}
        </button>
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
