import useConversation from "../../../zustand/useConversation";
import { useSocketContext } from "../../context/SocketContext";
import { useAuthContext } from "../../context/AuthContext";
import UserAvatar from "../common/UserAvatar";

const Conversation = ({ conversation, lastIdx }) => {
  const { selectedConversation, setSelectedConversation, clearUnread } = useConversation();
  const { authUser } = useAuthContext();
  const isSelected = selectedConversation?._id === conversation._id;
  const { onlineUsers } = useSocketContext();
  const isOnline = onlineUsers.includes(conversation._id);

  const handleClick = () => {
    setSelectedConversation(conversation);
    clearUnread(conversation._id);
  };

  const preview = getPreview(conversation, authUser);

  return (
    <>
      <div
        className={`flex gap-3 items-center rounded-xl p-2.5 cursor-pointer transition-all ${
          isSelected
            ? "bg-indigo-600/30 ring-1 ring-indigo-500/40"
            : "hover:bg-gray-700/40"
        }`}
        onClick={handleClick}
      >
        {/* Avatar + online dot */}
        <div className="relative shrink-0">
          <UserAvatar user={conversation} size={40} />
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900" />
          )}
        </div>

        {/* Name + last message */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-100 truncate">
            {conversation.fullName}
          </p>
          <p className="text-xs text-gray-400 truncate">{preview}</p>
        </div>

        {/* Unread badge */}
        {conversation.unreadCount > 0 && !isSelected && (
          <span className="shrink-0 min-w-[18px] h-[18px] bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
          </span>
        )}
      </div>
      {!lastIdx && <div className="h-px bg-gray-700/30 mx-1 my-0.5" />}
    </>
  );
};

function getPreview(conversation, authUser) {
  const last = conversation.lastMessage;
  if (!last) return "No messages yet";
  const isMe = last.senderId?.toString() === authUser?._id?.toString();
  const prefix = isMe ? "You: " : "";
  if (last.message === "🚫 Message deleted") return `${prefix}${last.message}`;
  if (last.messageType === "image") return `${prefix}📷 Photo`;
  return `${prefix}${last.message}`;
}

export default Conversation;
