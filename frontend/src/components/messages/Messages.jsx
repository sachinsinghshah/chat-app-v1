import { useEffect, useRef } from "react";
import useGetMessages from "../../hooks/useGetMessages";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import Message from "./Message";
import useListenMessages from "../../hooks/useListenMessages";
import TypingIndicator from "./TypingIndicator";
import useConversation from "../../../zustand/useConversation";

const Messages = () => {
  const { messages, loading } = useGetMessages();
  useListenMessages();
  const lastMessageRef = useRef();
  const { selectedConversation, typingUsers } = useConversation();

  const isOtherTyping =
    selectedConversation && typingUsers[selectedConversation._id];

  useEffect(() => {
    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages, isOtherTyping]);

  return (
    <div className="px-4 flex-1 overflow-y-auto overflow-x-hidden">
      {!loading &&
        messages.length > 0 &&
        messages.map((message) => (
          <div key={message._id} ref={lastMessageRef}>
            <Message message={message} />
          </div>
        ))}

      {loading &&
        [...Array(3)].map((_, idx) => <MessageSkeleton key={idx} />)}

      {!loading && messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
          <span className="text-4xl">👋</span>
          <p className="text-sm">
            Say hi to{" "}
            <span className="font-semibold text-gray-300">
              {selectedConversation?.fullName || selectedConversation?.name}
            </span>
            !
          </p>
        </div>
      )}

      {/* Typing indicator */}
      {isOtherTyping && (
        <div ref={lastMessageRef}>
          <TypingIndicator user={selectedConversation} />
        </div>
      )}
    </div>
  );
};

export default Messages;
