import { useEffect, useRef } from "react";
import useConversation from "../../zustand/useConversation";
import { useSocketContext } from "../context/SocketContext";
import { useAuthContext } from "../context/AuthContext";
import notificationSound from "../assets/sounds/bubble.mp3";
import useSuggestedReplies from "./useSuggestedReplies";

const useListenMessages = () => {
  const { socket } = useSocketContext();
  const { authUser } = useAuthContext();
  const {
    setMessages, updateMessage,
    selectedConversation,
    updateConversationMeta, clearUnread,
    updateGroupMeta, clearGroupUnread,
  } = useConversation();
  const { generateReplies } = useSuggestedReplies();

  // Keep refs so socket listeners always read the latest values
  // without needing them in the dependency array
  const selectedConvRef = useRef(selectedConversation);
  useEffect(() => { selectedConvRef.current = selectedConversation; }, [selectedConversation]);

  const authUserRef = useRef(authUser);
  useEffect(() => { authUserRef.current = authUser; }, [authUser]);

  const generateRepliesRef = useRef(generateReplies);
  useEffect(() => { generateRepliesRef.current = generateReplies; }, [generateReplies]);

  useEffect(() => {
    // ── Helpers ──────────────────────────────────────────────────────────
    const playSound = () => {
      try { new Audio(notificationSound).play(); } catch (_) {}
    };

    const showBrowserNotification = (title, body) => {
      if (document.hasFocus()) return;
      if (Notification.permission === "granted") {
        new Notification(title, { body, icon: "/vite.svg" });
      }
      const match = document.title.match(/^\((\d+)\)\s/);
      const current = match ? parseInt(match[1]) : 0;
      document.title = `(${current + 1}) Chatify`;
    };

    const handleFocus = () => { document.title = "Chatify"; };
    window.addEventListener("focus", handleFocus);

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    // ── 1-to-1 new message ────────────────────────────────────────────────
    socket?.on("newMessage", (newMessage) => {
      newMessage.shouldShake = true;
      playSound();

      const isActiveChat = selectedConvRef.current?._id === newMessage.senderId;
      if (isActiveChat) {
        // Functional update — always appends to the latest messages array
        setMessages((prev) => [...prev, newMessage]);
        clearUnread(newMessage.senderId);
        if (newMessage.messageType !== "image") {
          generateRepliesRef.current?.(newMessage.message);
        }
      } else {
        const preview = {
          message: newMessage.messageType === "image" ? "📷 Image" : newMessage.message,
          messageType: newMessage.messageType,
          createdAt: newMessage.createdAt,
          senderId: newMessage.senderId,
        };
        updateConversationMeta(newMessage.senderId, preview, true);
        showBrowserNotification("New message", newMessage.message);
      }
    });

    // ── Group new message ─────────────────────────────────────────────────
    socket?.on("newGroupMessage", (newMessage) => {
      if (newMessage.senderId?._id === authUserRef.current?._id) return;
      playSound();

      const isActiveGroup = selectedConvRef.current?._id === newMessage.groupId;
      if (isActiveGroup) {
        setMessages((prev) => [...prev, newMessage]);
        clearGroupUnread(newMessage.groupId);
      } else {
        updateGroupMeta(
          newMessage.groupId,
          {
            message: newMessage.messageType === "image" ? "📷 Image" : newMessage.message,
            messageType: newMessage.messageType,
            createdAt: newMessage.createdAt,
            senderName: newMessage.senderId?.fullName,
          },
          true
        );
        showBrowserNotification(
          `New group message`,
          `${newMessage.senderId?.fullName}: ${newMessage.message}`
        );
      }
    });

    // ── New group created / added ─────────────────────────────────────────
    socket?.on("newGroup", (group) => {
      useConversation.getState().addGroup(group);
    });

    // ── Reactions ─────────────────────────────────────────────────────────
    socket?.on("messageReaction", ({ messageId, reactions }) => {
      updateMessage(messageId, { reactions });
    });

    // ── Delete ────────────────────────────────────────────────────────────
    socket?.on("messageDeleted", ({ messageId }) => {
      updateMessage(messageId, { deleted: true, message: "This message was deleted" });
    });

    // ── Edit ──────────────────────────────────────────────────────────────
    socket?.on("messageEdited", ({ messageId, message, editedAt }) => {
      updateMessage(messageId, { message, edited: true, editedAt });
    });

    // ── Read receipts ─────────────────────────────────────────────────────
    socket?.on("messagesRead", () => {
      setMessages((prev) => prev.map((msg) => ({ ...msg, read: true })));
    });

    return () => {
      window.removeEventListener("focus", handleFocus);
      socket?.off("newMessage");
      socket?.off("newGroupMessage");
      socket?.off("newGroup");
      socket?.off("messageReaction");
      socket?.off("messageDeleted");
      socket?.off("messageEdited");
      socket?.off("messagesRead");
    };
  // Only re-register listeners when the socket itself changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);
};

export default useListenMessages;
