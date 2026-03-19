import { useState } from "react";
import Conversations from "./Conversations";
import SearchInput from "./SearchInput";
import AIBotEntry from "./AIBotEntry";
import ProfileModal from "../common/ProfileModal";
import UserAvatar from "../common/UserAvatar";
import { useAuthContext } from "../../context/AuthContext";
import { FiSettings } from "react-icons/fi";

const Sidebar = () => {
  const { authUser } = useAuthContext();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      <div className="w-full h-full border-r border-gray-700/60 flex flex-col bg-gray-900/60 backdrop-blur-sm">
        {/* Header */}
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-lg font-bold text-white mb-3">Messages</h2>
          <SearchInput />
        </div>

        <div className="px-4">
          <div className="h-px bg-gray-700/50 my-2" />
        </div>

        {/* AI Assistant */}
        <div className="px-3">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1 px-1">
            AI Assistant
          </p>
          <AIBotEntry />
        </div>

        <div className="px-4">
          <div className="h-px bg-gray-700/50 my-2" />
        </div>

        {/* Conversations list */}
        <div className="px-3 flex-1 overflow-hidden flex flex-col min-h-0">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1 px-1">
            Contacts
          </p>
          <Conversations />
        </div>

        {/* User Profile Section */}
        <div
          className="px-4 py-3 border-t border-gray-700/60 flex items-center gap-3 cursor-pointer hover:bg-gray-800/60 transition-colors"
          onClick={() => setShowProfile(true)}
          title="Edit profile"
        >
          <div className="shrink-0">
            <UserAvatar user={authUser} size={38} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {authUser?.fullName}
            </p>
            <p className="text-xs text-gray-400 truncate">@{authUser?.username}</p>
          </div>
          <FiSettings className="text-gray-400 shrink-0" size={16} />
        </div>
      </div>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
};

export default Sidebar;
