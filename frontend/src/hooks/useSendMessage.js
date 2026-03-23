import { useState } from "react";
import useConversation from "../../zustand/useConversation";
import toast from "react-hot-toast";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const { setMessages, selectedConversation, replyTo, setReplyTo } =
    useConversation();

  const sendMessage = async (message, messageType = "text") => {
    setLoading(true);
    try {
      const body = { message, messageType };
      if (replyTo) {
        body.replyTo = {
          messageId: replyTo._id,
          message: replyTo.message,
          senderName: replyTo.senderName,
        };
      }

      const res = await fetch(
        `/api/messages/send/${selectedConversation._id}`,
        {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [...prev, data]);
      setReplyTo(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading };
};

export default useSendMessage;
