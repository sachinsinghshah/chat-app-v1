import { useEffect } from "react";
import useConversation from "../../zustand/useConversation";
import { useSocketContext } from "../context/SocketContext";
import { useAuthContext } from "../context/AuthContext";
import notificationSound from "../assets/sounds/bubble.mp3";

const useListenMessages = () => {
  const { socket } = useSocketContext();
  const { authUser } = useAuthContext();
  const {
    messages, setMessages, updateMessage,
    selectedConversation,
    updateConversationMeta, clearUnread,
    updateGroupMeta, clearGroupUnread,
  } = useConversation();

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
      // Update tab title
      const match = document.title.match(/^\((\d+)\)\s/);
      const current = match ? parseInt(match[1]) : 0;
      document.title = `(${current + 1}) Chatify`;
    };

    // Reset tab title when window is focused
    const handleFocus = () => {
      document.title = "Chatify";
    };
    window.addEventListener("focus", handleFocus);

    // Request notification permission once
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    // ── 1-to-1 new message ────────────────────────────────────────────────
    socket?.on("newMessage", (newMessage) => {
      newMessage.shouldShake = true;
      playSound();

      const isActiveChat = selectedConversation?._id === newMessage.senderId;
      if (isActiveChat) {
        setMessages([...messages, newMessage]);
        clearUnread(newMessage.senderId);
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
      if (newMessage.senderId?._id === authUser?._id) return; // own message
      playSound();

      const isActiveGroup = selectedConversation?._id === newMessage.groupId;
      if (isActiveGroup) {
        setMessages([...messages, newMessage]);
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
      setMessages(messages.map((msg) => ({ ...msg, read: true })));
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
  }, [socket, messages, setMessages, updateMessage, selectedConversation,
      updateConversationMeta, clearUnread, updateGroupMeta, clearGroupUnread, authUser]);
};

export default useListenMessages;
