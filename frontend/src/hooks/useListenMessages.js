import { useEffect } from "react";
import useConversation from "../../zustand/useConversation";
import { useSocketContext } from "../context/SocketContext";
import notificationSound from "../assets/sounds/bubble.mp3";

const useListenMessages = () => {
  const { socket } = useSocketContext();
  const { messages, setMessages } = useConversation();

  useEffect(() => {
    // New incoming message
    socket?.on("newMessage", (newMessage) => {
      newMessage.shouldShake = true;
      const sound = new Audio(notificationSound);
      sound.play();
      setMessages([...messages, newMessage]);
    });

    // Reaction updated on a message
    socket?.on("messageReaction", ({ messageId, reactions }) => {
      setMessages(
        messages.map((msg) =>
          msg._id === messageId ? { ...msg, reactions } : msg
        )
      );
    });

    // Message soft-deleted
    socket?.on("messageDeleted", ({ messageId }) => {
      setMessages(
        messages.map((msg) =>
          msg._id === messageId
            ? { ...msg, deleted: true, message: "This message was deleted" }
            : msg
        )
      );
    });

    // Read receipt: all messages sent by me are now read
    socket?.on("messagesRead", () => {
      setMessages(messages.map((msg) => ({ ...msg, read: true })));
    });

    return () => {
      socket?.off("newMessage");
      socket?.off("messageReaction");
      socket?.off("messageDeleted");
      socket?.off("messagesRead");
    };
  }, [socket, setMessages, messages]);
};

export default useListenMessages;
