import UserAvatar from "../common/UserAvatar";

const TypingIndicator = ({ user }) => {
  return (
    <div className="chat chat-start">
      <div className="chat-image avatar">
        <div className="w-10 rounded-full overflow-hidden">
          <UserAvatar user={user} size={40} />
        </div>
      </div>
      <div className="chat-bubble bg-gray-700/80 text-white flex items-center gap-1 px-4 py-3">
        <span
          className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
};

export default TypingIndicator;
