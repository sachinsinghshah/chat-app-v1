import useConversation from "../../../zustand/useConversation";
import { useSocketContext } from "../../context/SocketContext";
import UserAvatar from "../common/UserAvatar";

const Conversation = ({ conversation, lastIdx }) => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const isSelected = selectedConversation?._id === conversation._id;
  const { onlineUsers } = useSocketContext();
  const isOnline = onlineUsers.includes(conversation._id);

  return (
    <>
      <div
        className={`flex gap-3 items-center rounded-xl p-2.5 cursor-pointer transition-all ${
          isSelected
            ? "bg-indigo-600/30 ring-1 ring-indigo-500/40"
            : "hover:bg-gray-700/40"
        }`}
        onClick={() => setSelectedConversation(conversation)}
      >
        <div className="relative shrink-0">
          <UserAvatar user={conversation} size={40} />
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-100 truncate">
            {conversation.fullName}
          </p>
          <p className={`text-xs ${isOnline ? "text-green-400" : "text-gray-500"}`}>
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>
      {!lastIdx && <div className="h-px bg-gray-700/30 mx-1 my-0.5" />}
    </>
  );
};

export default Conversation;