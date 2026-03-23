import { useState } from "react";
import toast from "react-hot-toast";
import useConversation from "../../zustand/useConversation";

const useSendGroupMessage = () => {
  const [loading, setLoading] = useState(false);
  const { setMessages, selectedConversation, replyTo, setReplyTo } =
    useConversation();

  const sendGroupMessage = async (messageText, messageType = "text") => {
    if (!messageText?.trim() && messageType === "text") return;
    const groupId = selectedConversation?._id;
    if (!groupId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          messageType,
          replyTo: replyTo
            ? { messageId: replyTo._id, message: replyTo.message, senderName: replyTo.senderName }
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages((prev) => [...prev, data]);
      setReplyTo(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, sendGroupMessage };
};

export default useSendGroupMessage;
