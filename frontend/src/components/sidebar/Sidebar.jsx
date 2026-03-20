import { useState } from "react";
import Conversations from "./Conversations";
import SearchInput from "./SearchInput";
import AIBotEntry from "./AIBotEntry";
import ProfileModal from "../common/ProfileModal";
import CreateGroupModal from "../common/CreateGroupModal";
import UserAvatar from "../common/UserAvatar";
import GroupConversation from "./GroupConversation";
import { useAuthContext } from "../../context/AuthContext";
import useConversation from "../../../zustand/useConversation";
import useGetGroups from "../../hooks/useGetGroups";
import useGetBlockedUsers from "../../hooks/useGetBlockedUsers";
import { FiSettings, FiSun, FiMoon, FiUsers, FiPlus } from "react-icons/fi";

const Sidebar = () => {
  const { authUser } = useAuthContext();
  const [showProfile, setShowProfile] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const { theme, setTheme } = useConversation();
  const { groups } = useGetGroups();
  useGetBlockedUsers();

  return (
    <>
      <div className="w-full h-full border-r border-gray-700/60 flex flex-col bg-gray-900/60 backdrop-blur-sm">
        {/* Header */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white">Messages</h2>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-gray-400 hover:text-yellow-400 transition-colors p-1"
              title="Toggle theme"
            >
              {theme === "dark" ? <FiSun size={16} /> : <FiMoon size={16} />}
            </button>
          </div>
          <SearchInput />
        </div>

        <div className="px-4"><div className="h-px bg-gray-700/50 my-2" /></div>

        {/* AI Assistant */}
        <div className="px-3">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1 px-1">
            AI Assistant
          </p>
          <AIBotEntry />
        </div>

        <div className="px-4"><div className="h-px bg-gray-700/50 my-2" /></div>

        {/* Groups */}
        <div className="px-3">
          <div className="flex items-center justify-between mb-1 px-1">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
              Groups
            </p>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="text-gray-500 hover:text-purple-400 transition-colors"
              title="New group"
            >
              <FiPlus size={14} />
            </button>
          </div>
          {groups.length === 0 ? (
            <button
              onClick={() => setShowCreateGroup(true)}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-xl text-gray-500 hover:text-purple-400 hover:bg-gray-700/30 transition-all text-sm"
            >
              <FiUsers size={14} /> Create your first group
            </button>
          ) : (
            <div className="flex flex-col">
              {groups.map((g, idx) => (
                <GroupConversation key={g._id} group={g} lastIdx={idx === groups.length - 1} />
              ))}
            </div>
          )}
        </div>

        <div className="px-4"><div className="h-px bg-gray-700/50 my-2" /></div>

        {/* Contacts */}
        <div className="px-3 flex-1 overflow-hidden flex flex-col min-h-0">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1 px-1">
            Contacts
          </p>
          <Conversations />
        </div>

        {/* User Profile */}
        <div
          className="px-4 py-3 border-t border-gray-700/60 flex items-center gap-3 cursor-pointer hover:bg-gray-800/60 transition-colors"
          onClick={() => setShowProfile(true)}
          title="Edit profile"
        >
          <div className="shrink-0"><UserAvatar user={authUser} size={38} /></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{authUser?.fullName}</p>
            <p className="text-xs text-gray-400 truncate">@{authUser?.username}</p>
          </div>
          <FiSettings className="text-gray-400 shrink-0" size={16} />
        </div>
      </div>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showCreateGroup && <CreateGroupModal onClose={() => setShowCreateGroup(false)} />}
    </>
  );
};

export default Sidebar;
