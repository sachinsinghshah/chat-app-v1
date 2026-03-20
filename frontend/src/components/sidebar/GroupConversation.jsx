import { useState } from "react";
import useConversation from "../../../zustand/useConversation";
import Avatar from "boring-avatars";

const PALETTE = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

const GroupConversation = ({ group, lastIdx }) => {
  const { selectedConversation, setSelectedConversation, clearGroupUnread } =
    useConversation();
  const isSelected = selectedConversation?._id === group._id;

  const handleClick = () => {
    setSelectedConversation({ ...group, isGroup: true });
    clearGroupUnread(group._id);
  };

  const preview = group.lastMessage
    ? group.lastMessage.messageType === "image"
      ? `${group.lastMessage.senderName || "Someone"}: 📷 Photo`
      : `${group.lastMessage.senderName || "Someone"}: ${group.lastMessage.message}`
    : "No messages yet";

  return (
    <>
      <div
        className={`flex gap-3 items-center rounded-xl p-2.5 cursor-pointer transition-all ${
          isSelected
            ? "bg-purple-600/30 ring-1 ring-purple-500/40"
            : "hover:bg-gray-700/40"
        }`}
        onClick={handleClick}
      >
        {/* Group avatar */}
        <div className="relative shrink-0 w-10 h-10 rounded-full overflow-hidden">
          {group.avatar ? (
            <img src={group.avatar} alt={group.name} className="w-full h-full object-cover" />
          ) : (
            <Avatar size={40} name={group.name} variant="ring" colors={PALETTE} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-100 truncate">{group.name}</p>
          <p className="text-xs text-gray-400 truncate">{preview}</p>
        </div>

        {group.unreadCount > 0 && !isSelected && (
          <span className="shrink-0 min-w-[18px] h-[18px] bg-purple-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {group.unreadCount > 99 ? "99+" : group.unreadCount}
          </span>
        )}
      </div>
      {!lastIdx && <div className="h-px bg-gray-700/30 mx-1 my-0.5" />}
    </>
  );
};

export default GroupConversation;
