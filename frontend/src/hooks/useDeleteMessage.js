import { useState } from "react";
import useConversation from "../../zustand/useConversation";
import toast from "react-hot-toast";

const useDeleteMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages } = useConversation();

  const deleteMessage = async (messageId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages(
        messages.map((msg) =>
          msg._id === messageId
            ? { ...msg, deleted: true, message: "This message was deleted" }
            : msg
        )
      );
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { deleteMessage, loading };
};

export default useDeleteMessage;
